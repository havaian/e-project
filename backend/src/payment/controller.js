const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('./model');
const Appointment = require('../appointment/model');
const { NotificationService } = require('../notification');

/**
 * Create a checkout session for an appointment
 */
exports.createCheckoutSession = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.status(400).json({ message: 'Appointment ID is required' });
        }

        // Find appointment
        const appointment = await Appointment.findById(appointmentId)
            .populate('provider', 'sessionFee firstName lastName email specializations')
            .populate('client', 'firstName lastName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if appointment already has a successful payment
        const existingPayment = await Payment.findOne({
            appointment: appointmentId,
            status: 'succeeded'
        });

        if (existingPayment) {
            return res.status(400).json({
                message: 'Payment already completed for this appointment',
                paymentId: existingPayment._id,
                status: existingPayment.status
            });
        }

        // Get session fee from provider's profile
        const amount = appointment.provider.sessionFee;
        const currency = 'uzs';

        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            // Handle fallback for missing session fee
            await exports.handlePaymentFailure(appointmentId, 'Invalid session fee. Provider must have a valid session fee set.');
            return res.status(400).json({
                message: 'Invalid session fee. Provider must have a valid session fee set.',
                needsConfiguration: true
            });
        }

        try {
            // Create Stripe checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: `Consultation with ${appointment.provider.firstName} ${appointment.provider.lastName}`,
                            description: `${appointment.type} session scheduled for ${new Date(appointment.dateTime).toLocaleString()}`
                        },
                        unit_amount: amount * 100 // Convert to cents
                    },
                    quantity: 1
                }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?appointment_id=${appointmentId}`,
                metadata: {
                    appointmentId: appointmentId.toString(),
                    clientId: appointment.client._id.toString(),
                    providerId: appointment.provider._id.toString()
                }
            });

            // Create or update payment record
            let payment = await Payment.findOne({ appointment: appointmentId });

            if (!payment) {
                payment = new Payment({
                    appointment: appointmentId,
                    client: appointment.client._id,
                    provider: appointment.provider._id,
                    amount,
                    currency,
                    stripeSessionId: session.id,
                    checkoutUrl: session.url,
                    status: 'pending'
                });
            } else {
                payment.stripeSessionId = session.id;
                payment.checkoutUrl = session.url;
                payment.status = 'pending';
            }

            await payment.save();

            // Update appointment with payment reference
            appointment.payment = {
                amount,
                status: 'pending',
                transactionId: payment._id
            };

            await appointment.save();

            res.status(200).json({
                paymentId: payment._id,
                checkoutUrl: session.url,
                status: 'pending'
            });

        } catch (stripeError) {
            console.error('Stripe error:', stripeError);

            // Handle Stripe-specific errors with fallback
            await exports.handlePaymentFailure(appointmentId, `Stripe error: ${stripeError.message}`);

            res.status(500).json({
                message: 'Payment system temporarily unavailable. Please try again.',
                error: stripeError.message,
                fallbackHandled: true
            });
        }

    } catch (error) {
        console.error('Error creating checkout session:', error);

        // Handle general errors
        if (req.body.appointmentId) {
            await exports.handlePaymentFailure(req.body.appointmentId, error.message);
        }

        res.status(500).json({
            message: 'Failed to create checkout session',
            error: error.message,
            fallbackHandled: true
        });
    }
};

/**
 * Handle webhook events from Stripe
 */
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'checkout.session.expired':
                await handleCheckoutSessionExpired(event.data.object);
                break;
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(session) {
    try {
        // ── Course enrollment payment ────────────────────────────────────
        // Course checkout sessions embed courseId in metadata.
        // They do NOT create a Payment document — only an Enrollment.
        if (session.metadata?.courseId) {
            const { Enrollment } = require('../course/model');

            const enrollment = await Enrollment.findOne({
                'payment.stripeSessionId': session.id
            });

            if (!enrollment) {
                console.error('Enrollment not found for course session:', session.id);
                return;
            }

            enrollment.payment.status = 'succeeded';
            enrollment.payment.paidAt = new Date();
            await enrollment.save();

            console.log(`Course enrollment confirmed via webhook — session ${session.id}`);
            return;
        }

        // ── Appointment payment (existing logic unchanged) ───────────────
        const payment = await Payment.findOne({ stripeSessionId: session.id });

        if (!payment) {
            console.error('Payment not found for session:', session.id);
            return;
        }

        // Update payment status
        payment.status = 'succeeded';
        payment.paidAt = new Date();
        await payment.save();

        // Update appointment payment status
        const appointment = await Appointment.findById(payment.appointment);
        if (appointment) {
            // Send success emails
            await NotificationService.sendPaymentSuccessEmail(payment._id, appointment);
            await NotificationService.sendProviderAppointmentEmail(appointment);

            appointment.payment.status = 'completed';
            await appointment.save();

            // Send payment confirmation
            await NotificationService.sendPaymentConfirmation(payment._id);
        }
    } catch (error) {
        console.error('Error handling completed checkout session:', error);
        throw error;
    }
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(session) {
    try {
        // ── Course enrollment expired ────────────────────────────────────
        if (session.metadata?.courseId) {
            const { Enrollment } = require('../course/model');

            const enrollment = await Enrollment.findOne({
                'payment.stripeSessionId': session.id
            });

            if (!enrollment) {
                console.error('Enrollment not found for expired session:', session.id);
                return;
            }

            enrollment.payment.status = 'failed';
            await enrollment.save();

            console.log(`Course enrollment expired via webhook — session ${session.id}`);
            return;
        }

        // ── Appointment payment expired (existing logic) ─────────────────
        const payment = await Payment.findOne({ stripeSessionId: session.id });

        if (!payment) {
            console.error('Payment not found for session:', session.id);
            return;
        }

        payment.status = 'failed';
        await payment.save();

        const appointment = await Appointment.findById(payment.appointment);
        if (appointment) {
            await NotificationService.sendPaymentFailureEmail(payment._id, appointment);
        }
        if (appointment && appointment.payment.status === 'pending') {
            appointment.payment.status = 'pending';
            await appointment.save();
        }
    } catch (error) {
        console.error('Error handling expired checkout session:', error);
        throw error;
    }
}

/**
 * Verify payment session status
 */
exports.verifySessionStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        // Find payment by session ID
        const payment = await Payment.findOne({ stripeSessionId: sessionId })
            .populate('appointment')
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName specializations');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found for this session' });
        }

        // If payment is still pending, check with Stripe
        if (payment.status === 'pending') {
            try {
                const session = await stripe.checkout.sessions.retrieve(sessionId);

                if (session.payment_status === 'paid') {
                    payment.status = 'succeeded';
                    payment.paidAt = new Date();
                    await payment.save();

                    // Update appointment
                    const appointment = await Appointment.findById(payment.appointment);
                    if (appointment) {
                        appointment.payment.status = 'completed';
                        await appointment.save();
                    }
                }
            } catch (stripeError) {
                console.error('Error retrieving Stripe session:', stripeError);
            }
        }

        res.status(200).json({
            payment,
            success: payment.status === 'succeeded'
        });
    } catch (error) {
        console.error('Error verifying session status:', error);
        res.status(500).json({ message: 'Failed to verify payment session' });
    }
};

/**
 * Process a refund for a payment
 * @param {String} paymentId - Payment ID to refund
 * @returns {Promise<Object>} Updated payment object
 */
exports.processRefund = async (paymentId) => {
    try {
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            throw new Error(`Payment with ID ${paymentId} not found`);
        }

        if (payment.status === 'refunded') {
            console.log(`Payment ${paymentId} is already refunded`);
            return payment;
        }

        if (payment.status !== 'succeeded') {
            console.log(`Payment ${paymentId} is not in succeeded status, current status: ${payment.status}`);
            return payment;
        }

        // If using Stripe, initiate Stripe refund
        if (payment.stripeSessionId) {
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: payment.stripePaymentIntentId,
                    reason: 'requested_by_customer'
                });

                payment.refundId = refund.id;
            } catch (stripeError) {
                console.error('Error processing Stripe refund:', stripeError);
                // Continue with status update even if Stripe refund fails
                // This allows manual handling of refunds if needed
            }
        }

        // Update payment status
        payment.status = 'refunded';
        payment.refundedAt = new Date();
        await payment.save();

        // Find related appointment
        const appointment = await Appointment.findById(payment.appointment);
        if (appointment) {
            appointment.payment.status = 'refunded';
            await appointment.save();
        }

        // Send notification
        await NotificationService.sendPaymentRefundNotification(payment);

        console.log(`Successfully processed refund for payment ${paymentId}`);
        return payment;
    } catch (error) {
        console.error(`Error processing refund for payment ${paymentId}:`, error);
        throw error;
    }
};

// Handle payment failure fallback
exports.handlePaymentFailure = async (appointmentId, error) => {
    try {
        console.log(`Handling payment failure for appointment ${appointmentId}:`, error);

        // Find appointment with populated data
        const appointment = await Appointment.findById(appointmentId)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName email specializations sessionFee');

        if (!appointment) {
            console.error('Appointment not found for payment failure handling');
            return false;
        }

        // Create or update payment record with failed status
        let payment = await Payment.findOne({ appointment: appointmentId });

        if (!payment) {
            payment = new Payment({
                appointment: appointmentId,
                client: appointment.client._id,
                provider: appointment.provider._id,
                amount: appointment.provider.sessionFee,
                currency: 'uzs',
                status: 'failed',
                failureReason: error,
                createdAt: new Date()
            });
        } else {
            payment.status = 'failed';
            payment.failureReason = error;
        }

        await payment.save();

        // Update appointment payment status
        appointment.payment = {
            amount: appointment.provider.sessionFee,
            status: 'failed',
            transactionId: payment._id
        };
        await appointment.save();

        // Create new checkout session for retry
        const retrySession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'uzs',
                    product_data: {
                        name: `Consultation with ${appointment.provider.firstName} ${appointment.provider.lastName}`,
                        description: `${appointment.type} session`
                    },
                    unit_amount: appointment.provider.sessionFee * 100 // Convert to cents
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?appointment_id=${appointmentId}`,
            metadata: {
                appointmentId: appointmentId.toString(),
                clientId: appointment.client._id.toString(),
                providerId: appointment.provider._id.toString(),
                isRetry: 'true'
            }
        });

        // Update payment with new session
        payment.stripeSessionId = retrySession.id;
        payment.checkoutUrl = retrySession.url;
        payment.status = 'pending';
        await payment.save();

        // Send payment failure email with retry link
        await NotificationService.sendPaymentFailureWithRetryEmail(appointment, retrySession.url, error);

        console.log('Payment failure handled successfully, retry link created');
        return {
            success: true,
            retryUrl: retrySession.url,
            paymentId: payment._id
        };

    } catch (err) {
        console.error('Error handling payment failure:', err);
        return false;
    }
};

// Get payment status for appointment page
exports.getAppointmentPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Find appointment
        const appointment = await Appointment.findById(appointmentId)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user access
        const userId = req.user.id;
        const isClient = appointment.client._id.toString() === userId;
        const isProvider = appointment.provider._id.toString() === userId;

        if (!isClient && !isProvider && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Find payment record
        const payment = await Payment.findOne({ appointment: appointmentId });

        let paymentInfo = {
            hasPayment: !!payment,
            status: payment?.status || 'no_payment',
            amount: payment?.amount || appointment.provider?.sessionFee,
            currency: payment?.currency || 'uzs',
            needsPayment: false,
            retryUrl: null
        };

        // Determine if payment is needed
        if (!payment || payment.status === 'failed' || payment.status === 'pending') {
            paymentInfo.needsPayment = true;

            // If there's a failed payment with retry URL, include it
            if (payment && payment.checkoutUrl && payment.status === 'pending') {
                paymentInfo.retryUrl = payment.checkoutUrl;
            } else if (payment && payment.status === 'failed') {
                // Create new checkout session for failed payment
                try {
                    const retryResult = await exports.handlePaymentFailure(appointmentId, 'Previous payment failed');
                    if (retryResult && retryResult.success) {
                        paymentInfo.retryUrl = retryResult.retryUrl;
                    }
                } catch (error) {
                    console.error('Error creating retry payment:', error);
                }
            }
        }

        res.status(200).json({
            appointment: {
                id: appointment._id,
                status: appointment.status,
                dateTime: appointment.dateTime
            },
            payment: paymentInfo
        });

    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({ message: 'Error retrieving payment status' });
    }
};