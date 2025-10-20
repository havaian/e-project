const Appointment = require('./model.js');
const User = require('../user/model.js');
const Payment = require('../payment/model.js');
const { validateAppointmentInput } = require('../utils/validators');
const { NotificationService } = require('../notification');
const emailService = require('../notification/emailService.js')(NotificationService);

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        const { providerId, dateTime, type = 'video', shortDescription = '' } = req.body;
        const clientId = req.user.id;

        console.log('Creating appointment with data:', { providerId, dateTime, type, shortDescription, clientId });

        // Validation with detailed error messages
        const validationErrors = [];

        if (!providerId) {
            validationErrors.push('Provider ID is required');
        }

        if (!dateTime) {
            validationErrors.push('Date and time are required');
        }

        if (!['video', 'phone', 'in-person'].includes(type)) {
            validationErrors.push('Invalid appointment type. Must be video, phone, or in-person');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors,
                fallbackSuggestion: 'Please check all required fields and try again'
            });
        }

        // Find and validate provider with comprehensive data
        const provider = await User.findById(providerId)
            .select('firstName lastName email specializations sessionFee availability isActive profileCompleted');

        if (!provider) {
            await logBookingFailure(clientId, providerId, dateTime, 'Provider not found');
            return res.status(404).json({
                message: 'Provider not found',
                fallbackSuggestion: 'Please select a different provider from the list'
            });
        }

        if (!provider.isActive) {
            await logBookingFailure(clientId, providerId, dateTime, 'Provider is not active');
            return res.status(400).json({
                message: 'Provider is not currently available for bookings',
                fallbackSuggestion: 'Please select an active provider'
            });
        }

        if (!provider.profileCompleted) {
            await logBookingFailure(clientId, providerId, dateTime, 'Provider profile incomplete');
            return res.status(400).json({
                message: 'Provider has not completed their profile setup',
                fallbackSuggestion: 'Please select a provider with a complete profile'
            });
        }

        if (!provider.sessionFee || provider.sessionFee <= 0) {
            await logBookingFailure(clientId, providerId, dateTime, 'Provider session fee not set');
            return res.status(400).json({
                message: 'Provider has not set their session fee',
                fallbackSuggestion: 'Please contact support or select a different provider'
            });
        }

        // Find and validate client
        const client = await User.findById(clientId)
            .select('firstName lastName email isActive');

        if (!client) {
            await logBookingFailure(clientId, providerId, dateTime, 'Client not found');
            return res.status(404).json({
                message: 'Client account not found',
                fallbackSuggestion: 'Please log in again'
            });
        }

        if (!client.isActive) {
            await logBookingFailure(clientId, providerId, dateTime, 'Client account inactive');
            return res.status(403).json({
                message: 'Your account is inactive. Please contact support.',
                fallbackSuggestion: 'Contact support to reactivate your account'
            });
        }

        // Validate appointment time
        const appointmentTime = new Date(dateTime);
        const currentTime = new Date();

        if (appointmentTime <= currentTime) {
            await logBookingFailure(clientId, providerId, dateTime, 'Appointment time in the past');
            return res.status(400).json({
                message: 'Appointment time must be in the future',
                fallbackSuggestion: 'Please select a future date and time'
            });
        }

        // Check provider availability with detailed validation
        const availabilityCheck = await checkProviderAvailability(provider, appointmentTime);
        if (!availabilityCheck.available) {
            await logBookingFailure(clientId, providerId, dateTime, `Provider not available: ${availabilityCheck.reason}`);
            return res.status(400).json({
                message: availabilityCheck.reason,
                fallbackSuggestion: 'Please select a different time slot or check provider availability'
            });
        }

        // Check for conflicting appointments
        const conflictingAppointment = await Appointment.findOne({
            provider: providerId,
            dateTime: {
                $gte: new Date(appointmentTime.getTime() - 30 * 60 * 1000), // 30 min before
                $lt: new Date(appointmentTime.getTime() + 30 * 60 * 1000)   // 30 min after
            },
            status: { $in: ['scheduled', 'pending-provider-confirmation', 'pending-payment'] }
        });

        if (conflictingAppointment) {
            await logBookingFailure(clientId, providerId, dateTime, 'Time slot already booked');
            return res.status(400).json({
                message: 'This time slot is no longer available',
                fallbackSuggestion: 'Please refresh the page and select a different time'
            });
        }

        // Create appointment with complete data and fallback values
        const appointmentData = {
            client: clientId,
            provider: providerId,
            dateTime: appointmentTime,
            type: type,
            shortDescription: shortDescription || `${type} consultation`,
            status: 'pending-payment',
            payment: {
                amount: provider.sessionFee,
                status: 'pending',
                transactionId: null
            },
            createdAt: new Date(),
            rescheduleCount: 0,
            rescheduleHistory: [],
            // Add fallback data in case of partial creation
            fallbackData: {
                clientName: `${client.firstName || 'Unknown'} ${client.lastName || 'Client'}`,
                providerName: `${provider.firstName || 'Unknown'} ${provider.lastName || 'Provider'}`,
                clientEmail: client.email,
                providerEmail: provider.email,
                sessionFee: provider.sessionFee,
                creationAttempt: new Date()
            }
        };

        console.log('Creating appointment with data:', appointmentData);

        // Create appointment with transaction safety
        let appointment;
        try {
            appointment = new Appointment(appointmentData);
            await appointment.save();
            console.log('Appointment created successfully:', appointment._id);
        } catch (createError) {
            console.error('Error creating appointment:', createError);

            // Attempt to create with minimal required data
            try {
                const minimalAppointment = new Appointment({
                    client: clientId,
                    provider: providerId,
                    dateTime: appointmentTime,
                    type: 'video', // default fallback
                    status: 'pending-payment',
                    payment: {
                        amount: provider.sessionFee || 50000, // fallback amount
                        status: 'pending'
                    },
                    shortDescription: 'Consultation booking (auto-generated)',
                    createdAt: new Date()
                });

                appointment = await minimalAppointment.save();
                console.log('Minimal appointment created as fallback:', appointment._id);

                // Log the fallback creation
                await logBookingFallback(appointment._id, createError.message, appointmentData);

            } catch (fallbackError) {
                console.error('Fallback appointment creation also failed:', fallbackError);
                await logBookingFailure(clientId, providerId, dateTime, `Creation failed: ${createError.message}, Fallback failed: ${fallbackError.message}`);

                return res.status(500).json({
                    message: 'Unable to create appointment. Please try again.',
                    error: 'BOOKING_CREATION_FAILED',
                    fallbackSuggestion: 'Please refresh the page and try booking again, or contact support if the issue persists',
                    supportEmail: process.env.VITE_SUPPORT_EMAIL || 'support@example.com'
                });
            }
        }

        // Populate appointment data for response
        await appointment.populate([
            { path: 'client', select: 'firstName lastName email' },
            { path: 'provider', select: 'firstName lastName email specializations sessionFee' }
        ]);

        // Send notifications with error handling
        try {
            await NotificationService.sendAppointmentBookingNotification(appointment);
        } catch (notificationError) {
            console.error('Failed to send booking notification:', notificationError);
            // Don't fail the request for notification errors
        }

        // Set confirmation deadline
        try {
            const confirmationDeadline = calculateProviderConfirmationDeadline(provider, appointmentTime);
            appointment.confirmationDeadline = confirmationDeadline;
            await appointment.save();
        } catch (deadlineError) {
            console.error('Failed to set confirmation deadline:', deadlineError);
            // Continue without deadline
        }

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: {
                id: appointment._id,
                dateTime: appointment.dateTime,
                type: appointment.type,
                status: appointment.status,
                provider: {
                    id: appointment.provider._id,
                    name: `${appointment.provider.firstName} ${appointment.provider.lastName}`,
                    specializations: appointment.provider.specializations
                },
                payment: {
                    amount: appointment.payment.amount,
                    status: appointment.payment.status,
                    required: true
                },
                nextSteps: [
                    'Complete payment to confirm your appointment',
                    'You will receive a confirmation email after payment',
                    'Provider will confirm availability within 24 hours'
                ]
            }
        });

    } catch (error) {
        console.error('Unexpected error creating appointment:', error);

        // Log the error with all available context
        await logBookingFailure(
            req.user?.id || 'unknown',
            req.body?.providerId || 'unknown',
            req.body?.dateTime || 'unknown',
            `Unexpected error: ${error.message}`
        );

        res.status(500).json({
            message: 'An unexpected error occurred while creating your appointment',
            error: 'UNEXPECTED_ERROR',
            fallbackSuggestion: 'Please try again in a few minutes, or contact support if the issue persists',
            supportEmail: process.env.VITE_SUPPORT_EMAIL || 'support@example.com'
        });
    }
};

// Helper function to calculate provider confirmation deadline
function calculateProviderConfirmationDeadline(provider, appointmentDate) {
    // Get the day of the appointment
    const appointmentDay = appointmentDate.getDay(); // 0 is Sunday, 1 is Monday
    const dayIndex = appointmentDay === 0 ? 6 : appointmentDay - 1; // Convert to 0-based (Monday = 0, Sunday = 6)

    // Find provider's working hours for this day
    const workingHours = provider.availability.find(a => a.dayOfWeek === dayIndex);

    if (!workingHours || !workingHours.isAvailable) {
        // Fallback: If no working hours defined, set deadline to 1 hour from now
        return new Date(Date.now() + 60 * 60 * 1000);
    }

    // Get first time slot for the day or use the default startTime
    let startTime;
    if (Array.isArray(workingHours.timeSlots) && workingHours.timeSlots.length > 0) {
        startTime = workingHours.timeSlots[0].startTime;
    } else {
        startTime = workingHours.startTime;
    }

    const [hours, minutes] = startTime.split(':').map(Number);

    // Create a deadline Date object for the appointment day
    const deadline = new Date(appointmentDate);
    deadline.setHours(hours + 1, minutes, 0, 0); // 1 hour after start of working day

    // If appointment is within 24 hours, set deadline to 1 hour from now
    const now = new Date();
    if (appointmentDate - now < 24 * 60 * 60 * 1000) {
        return new Date(now.getTime() + 60 * 60 * 1000);
    }

    return deadline;
}

// Helper function to check provider availability
async function checkProviderAvailability(provider, appointmentTime) {
    try {
        const dayOfWeek = appointmentTime.getUTCDay();
        const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;
        
        const dayAvailability = provider.availability?.find(a => a.dayOfWeek === dayIndex);
        
        if (!dayAvailability || !dayAvailability.isAvailable) {
            return { 
                available: false, 
                reason: 'Provider is not available on this day' 
            };
        }

        // Check time slots if available
        if (Array.isArray(dayAvailability.timeSlots) && dayAvailability.timeSlots.length > 0) {
            const appointmentHour = appointmentTime.getUTCHours();
            const appointmentMinute = appointmentTime.getUTCMinutes();
            const appointmentMinutes = appointmentHour * 60 + appointmentMinute;

            for (const slot of dayAvailability.timeSlots) {
                const [startHour, startMinute] = slot.startTime.split(':').map(Number);
                const [endHour, endMinute] = slot.endTime.split(':').map(Number);
                
                const slotStartMinutes = startHour * 60 + startMinute;
                const slotEndMinutes = endHour * 60 + endMinute;

                if (appointmentMinutes >= slotStartMinutes && appointmentMinutes < slotEndMinutes) {
                    return { available: true };
                }
            }
            
            return { 
                available: false, 
                reason: 'Appointment time is outside provider working hours' 
            };
        }

        return { available: true };
    } catch (error) {
        console.error('Error checking provider availability:', error);
        return { 
            available: false, 
            reason: 'Unable to verify provider availability' 
        };
    }
}

// Helper function to log booking failures
async function logBookingFailure(clientId, providerId, dateTime, reason) {
    try {
        // You can implement this to log to database, file, or external service
        console.error('BOOKING_FAILURE_LOG:', {
            clientId,
            providerId,
            dateTime,
            reason,
            timestamp: new Date()
        });

        // Optional: Create a BookingFailureLog model and save to database
        // const BookingFailureLog = require('./BookingFailureLog');
        // await BookingFailureLog.create({
        //     clientId,
        //     providerId,
        //     dateTime,
        //     reason,
        //     timestamp: new Date()
        // });
    } catch (error) {
        console.error('Failed to log booking failure:', error);
    }
}

// Helper function to log fallback bookings
async function logBookingFallback(appointmentId, originalError, originalData) {
    try {
        console.warn('BOOKING_FALLBACK_LOG:', {
            appointmentId,
            originalError,
            originalData,
            timestamp: new Date()
        });

        // Optional: Save to database for monitoring
        // const BookingFallbackLog = require('./BookingFallbackLog');
        // await BookingFallbackLog.create({
        //     appointmentId,
        //     originalError,
        //     originalData,
        //     timestamp: new Date()
        // });
    } catch (error) {
        console.error('Failed to log booking fallback:', error);
    }
}

// Get all appointments for a client
exports.getClientAppointments = async (req, res) => {
    try {
        const { clientId } = req.params || req.user.id;
        const { status, limit = 10, skip = 0, view = 'list' } = req.query;

        const query = { client: clientId };
        if (status) {
            query.status = status;
        }

        // Additional date filtering for calendar view
        if (view === 'calendar') {
            const { startDate, endDate } = req.query;
            if (startDate && endDate) {
                query.dateTime = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
        }

        const appointments = await Appointment.find(query)
            .sort({ dateTime: view === 'calendar' ? 1 : -1 }) // Ascending for calendar, descending for list
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('provider', 'firstName lastName specializations profilePicture');

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            appointments,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        console.error('Error fetching client appointments:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointments' });
    }
};

// Get all appointments for a provider
exports.getProviderAppointments = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { status, date, limit = 10, skip = 0, view = 'list' } = req.query;

        const query = { provider: providerId };
        if (status) {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.dateTime = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Additional date filtering for calendar view
        if (view === 'calendar') {
            const { startDate, endDate } = req.query;
            if (startDate && endDate) {
                query.dateTime = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
        }

        const appointments = await Appointment.find(query)
            .sort({ dateTime: view === 'calendar' ? 1 : -1 }) // Ascending for calendar, descending for list
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('client', 'firstName lastName profilePicture dateOfBirth');

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            appointments,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        console.error('Error fetching provider appointments:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointments' });
    }
};

// Provider confirms appointment
exports.confirmAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.user.id;

        const appointment = await Appointment.findById(id)
            .populate('client')
            .populate('provider');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify provider is assigned to this appointment
        if (appointment.provider._id.toString() !== providerId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to confirm this appointment' });
        }

        // Check appointment status
        if (appointment.status !== 'pending-provider-confirmation') {
            return res.status(400).json({ message: `Cannot confirm appointment with status "${appointment.status}"` });
        }

        // Check confirmation deadline
        if (appointment.providerConfirmationExpires && new Date() > new Date(appointment.providerConfirmationExpires)) {
            // Auto-cancel appointment if deadline passed
            appointment.status = 'canceled';
            appointment.cancellationReason = 'Provider did not confirm in time';
            await appointment.save();

            // Refund payment if any
            if (appointment.payment && appointment.payment.transactionId) {
                const payment = await Payment.findById(appointment.payment.transactionId);
                if (payment && payment.status !== 'refunded') {
                    payment.status = 'refunded';
                    await payment.save();
                }
            }

            // Notify client
            await NotificationService.sendAppointmentCancellationNotification(appointment, 'system');

            return res.status(400).json({
                message: 'Confirmation deadline has passed. Appointment has been automatically canceled.'
            });
        }

        // Update status to scheduled
        appointment.status = 'scheduled';
        await appointment.save();

        // Notify client of confirmed appointment
        await NotificationService.sendAppointmentConfirmedNotification(appointment);

        res.status(200).json({
            message: 'Appointment confirmed successfully',
            appointment
        });
    } catch (error) {
        console.error('Error confirming appointment:', error);
        res.status(500).json({ message: 'An error occurred while confirming the appointment' });
    }
};

// Update appointment status
exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { dateTime, type, shortDescription } = req.body;

        // Find appointment
        const appointment = await Appointment.findById(id)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user is involved in the appointment
        const isClient = appointment.client._id.toString() === userId;
        const isProvider = appointment.provider._id.toString() === userId;

        if (!isClient && !isProvider && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update this appointment' });
        }

        // For clients: Only allow rescheduling through the reschedule endpoint
        if (isClient && dateTime && dateTime !== appointment.dateTime.toISOString()) {
            return res.status(400).json({
                message: 'Please use the reschedule feature to change appointment date/time'
            });
        }

        // Update allowed fields only
        if (type && ['video', 'phone', 'in-person'].includes(type)) {
            appointment.type = type;
        }

        if (shortDescription !== undefined) {
            appointment.shortDescription = shortDescription;
        }

        await appointment.save();

        res.status(200).json({
            message: 'Appointment updated successfully',
            appointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'An error occurred while updating the appointment' });
    }
};

// Get a specific appointment by ID
exports.getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id)
            .populate('provider', 'firstName lastName specializations profilePicture email phone')
            .populate('client', 'firstName lastName profilePicture dateOfBirth email phone');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ appointment });
    } catch (error) {
        console.error('Error fetching appointment details:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointment details' });
    }
};

// Add/update recommendations for an appointment
exports.updateRecommendations = async (req, res) => {
    try {
        const { id } = req.params;
        const { recommendations } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only allow providers to update recommendations for completed appointments
        if (appointment.status !== 'completed') {
            return res.status(400).json({
                message: 'Recommendations can only be added to completed appointments'
            });
        }

        // Validate provider is assigned to this appointment
        if (req.user.role === 'provider' && appointment.provider.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update recommendations for this appointment' });
        }

        // Add new recommendations (preserve existing ones)
        const existingRecommendations = appointment.recommendations || [];
        appointment.recommendations = [...existingRecommendations, ...recommendations];

        await appointment.save();

        // Notify client about new recommendations
        await NotificationService.sendRecommendationNotification(appointment);

        res.status(200).json({
            message: 'Recommendations updated successfully',
            appointment
        });
    } catch (error) {
        console.error('Error updating recommendations:', error);
        res.status(500).json({ message: 'An error occurred while updating recommendations' });
    }
};

// Schedule a follow-up appointment
exports.scheduleFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const { followUpDate, notes, duration = 30 } = req.body;

        // Validate duration is a multiple of 15 minutes
        if (duration % 15 !== 0 || duration < 15 || duration > 120) {
            return res.status(400).json({
                message: 'Duration must be a multiple of 15 minutes (15, 30, 45, 60, etc.) and between 15-120 minutes'
            });
        }

        const appointment = await Appointment.findById(id)
            .populate('provider')
            .populate('client');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update follow-up information
        appointment.followUp = {
            recommended: true,
            date: new Date(followUpDate),
            notes: notes || ''
        };

        await appointment.save();

        // Calculate end time
        const followUpDateObj = new Date(followUpDate);
        const endTime = new Date(followUpDateObj.getTime() + duration * 60000);

        // Create a new appointment for the follow-up with pending-payment status
        const followUpAppointment = new Appointment({
            client: appointment.client._id,
            provider: appointment.provider._id,
            dateTime: followUpDateObj,
            endTime: endTime,
            duration: duration,
            type: appointment.type,
            shortDescription: `Follow-up to appointment on ${appointment.dateTime.toLocaleDateString()} - ${notes || 'No notes provided'}`,
            status: 'pending-payment',
            payment: {
                amount: appointment.provider.sessionFee,
                status: 'pending'
            }
        });

        await followUpAppointment.save();

        // Notify about follow-up
        await NotificationService.sendFollowUpNotification(followUpAppointment);

        res.status(200).json({
            message: 'Follow-up scheduled successfully',
            followUpAppointment
        });
    } catch (error) {
        console.error('Error scheduling follow-up:', error);
        res.status(500).json({ message: 'An error occurred while scheduling follow-up' });
    }
};

exports.getPendingFollowUps = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Find all pending-payment follow-up appointments for the client
        const appointments = await Appointment.find({
            client: clientId,
            status: 'pending-payment',
            shortDescription: { $regex: 'Follow-up to appointment on', $options: 'i' }
        })
            .populate('provider', 'firstName lastName specializations profilePicture email')
            .sort({ dateTime: 1 });

        res.status(200).json({
            appointments,
            pagination: {
                total: appointments.length,
                limit: appointments.length,
                skip: 0
            }
        });
    } catch (error) {
        console.error('Error fetching pending follow-ups:', error);
        res.status(500).json({ message: 'An error occurred while fetching pending follow-ups' });
    }
};

// Get provider's availability slots
exports.getProviderAvailability = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        // Get provider's working hours
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Parse the date exactly as received from frontend (YYYY-MM-DD)
        // Don't add timezone offset, just parse as-is
        const requestedDate = new Date(date + 'T00:00:00.000Z');

        // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = requestedDate.getUTCDay();

        // Convert to backend's day indexing: Monday=1, Tuesday=2, ..., Sunday=7
        const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;

        console.log(`Requested date: ${date}, Day of week: ${dayOfWeek}, Day index: ${dayIndex}`);

        const dayAvailability = provider.availability.find(a => a.dayOfWeek === dayIndex);
        if (!dayAvailability || !dayAvailability.isAvailable) {
            return res.status(200).json({
                message: 'Provider is not available on this day',
                availableSlots: []
            });
        }

        let availableSlots = [];

        // Check if the provider has time slots defined
        if (Array.isArray(dayAvailability.timeSlots) && dayAvailability.timeSlots.length > 0) {
            // For each time slot, generate available appointment slots
            for (const timeSlot of dayAvailability.timeSlots) {
                const slots = await generateTimeSlots(
                    requestedDate,
                    timeSlot.startTime,
                    timeSlot.endTime,
                    providerId
                );
                availableSlots = [...availableSlots, ...slots];
            }
        } else {
            // Fallback to old format
            availableSlots = await generateTimeSlots(
                requestedDate,
                dayAvailability.startTime,
                dayAvailability.endTime,
                providerId
            );
        }

        res.status(200).json({
            availableSlots,
            workingHours: Array.isArray(dayAvailability.timeSlots) ?
                dayAvailability.timeSlots :
                { start: dayAvailability.startTime, end: dayAvailability.endTime }
        });
    } catch (error) {
        console.error('Error fetching provider availability:', error);
        res.status(500).json({ message: 'An error occurred while fetching provider availability' });
    }
};

/**
 * Get appointments pending provider confirmation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPendingConfirmations = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { limit = 10, skip = 0 } = req.query;

        // Find appointments that are pending provider confirmation for this provider
        const query = {
            provider: providerId,
            status: 'pending-provider-confirmation',
            // Only include appointments that haven't expired yet
            providerConfirmationExpires: { $gt: new Date() }
        };

        const appointments = await Appointment.find(query)
            .sort({ providerConfirmationExpires: 1 }) // Sort by expiration time (most urgent first)
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('client', 'firstName lastName profilePicture dateOfBirth email phone')
            .populate('provider', 'firstName lastName specializations');

        const total = await Appointment.countDocuments(query);

        // Calculate time remaining for each appointment
        const appointmentsWithTimeRemaining = appointments.map(appointment => {
            const now = new Date();
            const expiresAt = new Date(appointment.providerConfirmationExpires);
            const timeRemainingMs = expiresAt - now;
            const timeRemainingHours = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60)));
            const timeRemainingMinutes = Math.max(0, Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60)));

            return {
                ...appointment.toObject(),
                timeRemaining: {
                    hours: timeRemainingHours,
                    minutes: timeRemainingMinutes,
                    totalMinutes: Math.max(0, Math.floor(timeRemainingMs / (1000 * 60)))
                }
            };
        });

        res.status(200).json({
            success: true,
            appointments: appointmentsWithTimeRemaining,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching pending confirmations:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching pending confirmations',
            error: error.message
        });
    }
};

// Helper function to generate time slots
async function generateTimeSlots(date, startTimeStr, endTimeStr, providerId) {
    console.log(`Generating slots for date: ${date}, start: ${startTimeStr}, end: ${endTimeStr}`);

    // Parse start and end times
    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);

    // Create times in UTC for the requested date
    const startTime = new Date(date);
    startTime.setUTCHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setUTCHours(endHour, endMinute, 0, 0);

    console.log(`Start time: ${startTime.toISOString()}, End time: ${endTime.toISOString()}`);

    // Generate slots at 30-minute intervals
    const slots = [];
    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
        const slotEnd = new Date(currentSlot);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30); // Default 30-min slots

        if (slotEnd <= endTime) {
            slots.push({
                start: new Date(currentSlot),
                end: new Date(slotEnd)
            });
        }

        currentSlot.setMinutes(currentSlot.getMinutes() + 30); // Move to next 30-min interval
    }

    // Get current time in UTC+5 and convert to UTC for comparison
    const nowUTC5 = new Date();
    nowUTC5.setHours(nowUTC5.getHours() + 5); // Add 5 hours to get UTC+5
    const nowUTC = new Date(nowUTC5.getTime() - (5 * 60 * 60 * 1000)); // Convert back to UTC

    console.log(`Current time UTC+5: ${nowUTC5.toISOString()}, Current time UTC: ${nowUTC.toISOString()}`);

    // Remove slots that already have appointments
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
        provider: providerId,
        dateTime: {
            $gte: startOfDay,
            $lt: endOfDay
        },
        status: { $in: ['scheduled', 'pending-provider-confirmation'] }
    });

    console.log(`Found ${bookedAppointments.length} booked appointments for this day`);

    // Filter out past slots and conflicting slots
    const futureSlots = slots.filter(slot => {
        // Check if slot is in the future
        const isPastSlot = slot.start <= nowUTC;

        if (isPastSlot) {
            console.log(`Filtering out past slot: ${slot.start.toISOString()}`);
            return false;
        }

        // Check for conflicts with existing appointments
        const hasConflict = bookedAppointments.some(appointment => {
            const apptStart = new Date(appointment.dateTime);
            const apptEnd = appointment.endTime || new Date(apptStart.getTime() + (appointment.duration || 30) * 60000);

            // Check if there's an overlap
            return (
                (slot.start < apptEnd && slot.end > apptStart) || // Slot overlaps with appointment
                (apptStart < slot.end && apptEnd > slot.start)    // Appointment overlaps with slot
            );
        });

        if (hasConflict) {
            console.log(`Filtering out conflicting slot: ${slot.start.toISOString()}`);
        }

        return !hasConflict;
    });

    console.log(`Generated ${slots.length} total slots, ${futureSlots.length} future slots`);
    return futureSlots;
}

// Clean up expired pending appointments
exports.cleanupExpiredAppointments = async () => {
    try {
        // Find appointments past their confirmation deadline
        const expiredAppointments = await Appointment.find({
            status: 'pending-provider-confirmation',
            providerConfirmationExpires: { $lt: new Date() }
        }).populate('client').populate('provider');

        for (const appointment of expiredAppointments) {
            // Update status to canceled
            appointment.status = 'canceled';
            appointment.cancellationReason = 'Provider did not confirm in time';
            await appointment.save();

            // Process refund if payment exists
            if (appointment.payment && appointment.payment.transactionId) {
                const payment = await Payment.findById(appointment.payment.transactionId);
                if (payment && payment.status !== 'refunded') {
                    payment.status = 'refunded';
                    await payment.save();
                    await NotificationService.sendPaymentRefundNotification(payment);
                }
            }

            // Notify users
            await NotificationService.sendAppointmentCancellationNotification(appointment, 'system');
        }

        console.log(`Cleaned up ${expiredAppointments.length} expired pending appointments`);
    } catch (error) {
        console.error('Error cleaning up expired appointments:', error);
    }
};

/**
 * Update session summary and add new recommendations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateSessionResults = async (req, res) => {
    try {
        const { id } = req.params;
        const { sessionSummary, recommendations, followUp } = req.body;
        const providerId = req.user.id;

        // Find the appointment
        const appointment = await Appointment.findById(id)
            .populate('client', 'firstName lastName email telegramId')
            .populate('provider', 'firstName lastName email telegramId');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify provider is assigned to this appointment
        if (appointment.provider._id.toString() !== providerId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this session' });
        }

        // Verify appointment is completed
        if (appointment.status !== 'completed') {
            return res.status(400).json({ message: 'Can only update completed sessions' });
        }

        // Update session summary if provided
        if (sessionSummary) {
            appointment.sessionSummary = sessionSummary;
        }

        // Add new recommendations if provided (don't replace existing ones)
        if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
            // Filter out invalid recommendations
            const validRecommendations = recommendations.filter(recommendation => {
                return recommendation.title && recommendation.description &&
                    recommendation.frequency && recommendation.duration;
            });

            // Add timestamp to each new recommendation
            const timestampedRecommendations = validRecommendations.map(recommendation => ({
                ...recommendation,
                createdAt: Date.now()
            }));

            // If appointment already has recommendations, append new ones
            if (appointment.recommendations && Array.isArray(appointment.recommendations)) {
                appointment.recommendations = [...appointment.recommendations, ...timestampedRecommendations];
            } else {
                appointment.recommendations = timestampedRecommendations;
            }

            // Send recommendation notification
            if (timestampedRecommendations.length > 0) {
                await NotificationService.sendRecommendationNotification(appointment);
            }
        }

        // Update follow-up recommendation if provided
        if (followUp && followUp.recommended) {
            appointment.followUp = {
                recommended: true,
                date: new Date(followUp.date),
                notes: followUp.notes || ''
            };

            // If creating a follow-up appointment was requested
            if (followUp.createAppointment) {
                // Calculate end time
                const followUpDateObj = new Date(followUp.date);
                const duration = followUp.duration || 30;
                const endTime = new Date(followUpDateObj.getTime() + duration * 60000);

                // Create a new appointment for the follow-up with pending-payment status
                const followUpAppointment = new Appointment({
                    client: appointment.client._id,
                    provider: appointment.provider._id,
                    dateTime: followUpDateObj,
                    endTime: endTime,
                    duration: duration,
                    type: appointment.type,
                    shortDescription: `Follow-up to appointment on ${appointment.dateTime.toLocaleDateString()} - ${followUp.notes || 'No notes provided'}`,
                    status: 'pending-payment',
                    payment: {
                        amount: appointment.provider.sessionFee,
                        status: 'pending'
                    }
                });

                await followUpAppointment.save();

                // Notify about follow-up
                await NotificationService.sendFollowUpNotification(followUpAppointment);
            }
        }

        // Save changes
        await appointment.save();

        res.status(200).json({
            message: 'Session results updated successfully',
            appointment
        });

    } catch (error) {
        console.error('Error updating session results:', error);
        res.status(500).json({ message: 'An error occurred while updating session results' });
    }
};

/**
 * Upload documents for an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Find appointment
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Determine who is uploading (client or provider)
        const isProvider = req.user.role === 'provider' && appointment.provider.toString() === userId;
        const isClient = req.user.role === 'client' && appointment.client.toString() === userId;

        if (!isProvider && !isClient) {
            // Remove uploaded file if user is not authorized
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(403).json({ message: 'You are not authorized to upload documents for this appointment' });
        }

        // Add document to appointment
        const document = {
            name: req.file.originalname,
            fileUrl: `/uploads/documents/${req.file.filename}`,
            fileType: req.file.mimetype,
            uploadedBy: isProvider ? 'provider' : 'client',
            uploadedAt: Date.now()
        };

        if (!appointment.documents) {
            appointment.documents = [];
        }

        appointment.documents.push(document);
        await appointment.save();

        // Notify the other party about the new document
        const recipient = isProvider ? appointment.client : appointment.provider;
        await NotificationService.sendDocumentUploadNotification(appointment, document, recipient);

        res.status(201).json({
            message: 'Document uploaded successfully',
            document
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'An error occurred while uploading document' });
    }
};

/**
 * Get documents for an appointment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find appointment
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user is involved in the appointment
        const isProvider = req.user.role === 'provider' && appointment.provider.toString() === userId;
        const isClient = req.user.role === 'client' && appointment.client.toString() === userId;

        if (!isProvider && !isClient && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to access documents for this appointment' });
        }

        // Return documents
        res.status(200).json({
            documents: appointment.documents || []
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'An error occurred while fetching documents' });
    }
};

/**
 * Get appointments in calendar format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCalendarAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { startDate, endDate, view = 'month' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required for calendar view' });
        }

        // Set up query based on user role
        const query = {};

        if (userRole === 'provider') {
            query.provider = userId;
        } else if (userRole === 'client') {
            query.client = userId;
        } else if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access to calendar' });
        }

        // Add date range to query
        query.dateTime = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };

        // Get appointments
        const appointments = await Appointment.find(query)
            .populate('provider', 'firstName lastName specializations')
            .populate('client', 'firstName lastName')
            .sort({ dateTime: 1 });

        // Format appointments for calendar view
        const calendarEvents = appointments.map(appointment => {
            const eventColor = getStatusColor(appointment.status);

            return {
                id: appointment._id,
                title: userRole === 'provider'
                    ? `${appointment.client.firstName} ${appointment.client.lastName}`
                    : `${appointment.provider.firstName} ${appointment.provider.lastName}`,
                start: appointment.dateTime,
                end: appointment.endTime,
                backgroundColor: eventColor,
                borderColor: eventColor,
                extendedProps: {
                    status: appointment.status,
                    type: appointment.type,
                    shortDescription: appointment.shortDescription,
                    appointmentId: appointment._id
                }
            };
        });

        // Helper function to get color based on status
        function getStatusColor(status) {
            switch (status) {
                case 'scheduled':
                    return '#4a90e2'; // Blue
                case 'completed':
                    return '#2ecc71'; // Green
                case 'canceled':
                    return '#e74c3c'; // Red
                case 'pending-payment':
                    return '#f39c12'; // Orange
                case 'pending-provider-confirmation':
                    return '#9b59b6'; // Purple
                case 'no-show':
                    return '#95a5a6'; // Gray
                default:
                    return '#3498db'; // Default blue
            }
        }

        res.status(200).json({
            calendarEvents,
            totalAppointments: appointments.length,
            dateRange: {
                start: startDate,
                end: endDate
            }
        });
    } catch (error) {
        console.error('Error fetching calendar appointments:', error);
        res.status(500).json({ message: 'An error occurred while fetching calendar appointments' });
    }
};

/**
 * Get provider statistics for public display
 * @route GET /api/appointments/provider/:providerId/stats
 * @access Public
 */
exports.getProviderStats = async (req, res) => {
    try {
        const { providerId } = req.params;

        // Validate provider exists and is a provider
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        // Get all appointments for this provider
        const appointments = await Appointment.find({ provider: providerId });

        // Calculate completed sessions
        const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;

        // Calculate response rate (simplified version)
        // For now, we'll use: appointments not canceled by provider / total appointments
        const totalAppointments = appointments.length;
        let responseRate = 95; // Default fallback value

        if (totalAppointments > 0) {
            // Count appointments that were NOT canceled by the provider
            const respondedAppointments = appointments.filter(apt =>
                apt.status !== 'canceled' || apt.canceledBy !== 'provider'
            ).length;

            responseRate = Math.round((respondedAppointments / totalAppointments) * 100);

            // Ensure response rate is within reasonable bounds (0-100)
            responseRate = Math.max(0, Math.min(100, responseRate));

            // If no data to calculate from, keep default
            if (totalAppointments < 5) {
                responseRate = 95; // Keep default for new providers
            }
        }

        res.status(200).json({
            success: true,
            completedAppointments,
            responseRate
        });

    } catch (error) {
        console.error('Error fetching provider stats:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching provider statistics',
            completedAppointments: 0,
            responseRate: 95
        });
    }
};

// Get all appointments for the current user (minimal data for calendar display)
exports.getAllUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};

        // Build query based on user role
        if (userRole === 'client') {
            query.client = userId;
        } else if (userRole === 'provider') {
            query.provider = userId;
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Fetch appointments with minimal populated data for calendar display
        const appointments = await Appointment.find(query)
            .populate('client', 'firstName lastName')
            .populate('provider', 'firstName lastName')
            .select('dateTime status type client provider')
            .sort({ dateTime: 1 }); // Sort by date ascending

        // Transform to minimal format for frontend
        const calendarAppointments = appointments.map(appointment => ({
            _id: appointment._id,
            dateTime: appointment.dateTime,
            status: appointment.status,
            type: appointment.type,
            client: appointment.client ? {
                firstName: appointment.client.firstName,
                lastName: appointment.client.lastName
            } : null,
            provider: appointment.provider ? {
                firstName: appointment.provider.firstName,
                lastName: appointment.provider.lastName
            } : null
        }));

        res.json({
            success: true,
            appointments: calendarAppointments,
            count: calendarAppointments.length
        });

    } catch (error) {
        console.error('Error fetching all user appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments'
        });
    }
};

// Handle appointment rescheduling
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { newDateTime, reason } = req.body;
        const userId = req.user.id;

        if (!newDateTime) {
            return res.status(400).json({ message: 'New date and time are required' });
        }

        // Find appointment
        const appointment = await Appointment.findById(id)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user is the client of this appointment
        if (appointment.client._id.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to reschedule this appointment' });
        }

        // Check if appointment can be rescheduled
        if (appointment.status !== 'scheduled') {
            return res.status(400).json({
                message: 'Only scheduled appointments can be rescheduled'
            });
        }

        // Check if appointment has already been rescheduled
        if (appointment.rescheduleCount >= 1) {
            return res.status(400).json({
                message: 'This appointment has already been rescheduled. Only one reschedule is allowed.'
            });
        }

        // Check if reschedule is within 12 hours of appointment
        const appointmentTime = new Date(appointment.dateTime);
        const currentTime = new Date();
        const twelveHoursBeforeAppointment = new Date(appointmentTime.getTime() - (12 * 60 * 60 * 1000));

        if (currentTime > twelveHoursBeforeAppointment) {
            return res.status(400).json({
                message: 'Cannot reschedule appointment less than 12 hours before the scheduled time'
            });
        }

        // Validate new date/time is in the future
        const newAppointmentTime = new Date(newDateTime);
        if (newAppointmentTime <= currentTime) {
            return res.status(400).json({ message: 'New appointment time must be in the future' });
        }

        // Check provider availability for new time slot
        const providerId = appointment.provider._id;
        const requestedDate = newAppointmentTime.toISOString().split('T')[0];

        // Get provider availability
        const provider = await User.findById(providerId);
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Check if provider is available on the requested day and time
        const dayOfWeek = newAppointmentTime.getUTCDay();
        const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;

        const dayAvailability = provider.availability.find(a => a.dayOfWeek === dayIndex);
        if (!dayAvailability || !dayAvailability.isAvailable) {
            return res.status(400).json({
                message: 'Provider is not available on the requested day'
            });
        }

        // Check if there's a conflicting appointment
        const conflictingAppointment = await Appointment.findOne({
            provider: providerId,
            dateTime: {
                $gte: new Date(newAppointmentTime.getTime() - 30 * 60 * 1000), // 30 min before
                $lt: new Date(newAppointmentTime.getTime() + 30 * 60 * 1000)   // 30 min after
            },
            status: { $in: ['scheduled', 'pending-provider-confirmation'] },
            _id: { $ne: id } // Exclude current appointment
        });

        if (conflictingAppointment) {
            return res.status(400).json({
                message: 'Provider is not available at the requested time'
            });
        }

        // Store original appointment details for audit
        const originalDateTime = appointment.dateTime;

        // Update appointment
        appointment.dateTime = newAppointmentTime;
        appointment.status = 'pending-provider-confirmation'; // Requires provider confirmation
        appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1;
        appointment.rescheduleHistory = appointment.rescheduleHistory || [];
        appointment.rescheduleHistory.push({
            originalDateTime,
            newDateTime: newAppointmentTime,
            reason: reason || 'Client requested reschedule',
            rescheduledAt: new Date(),
            rescheduledBy: userId
        });

        await appointment.save();

        // Send notifications
        await NotificationService.sendRescheduleRequestNotification(appointment, reason);

        res.status(200).json({
            message: 'Reschedule request sent. Waiting for provider confirmation.',
            appointment: {
                id: appointment._id,
                dateTime: appointment.dateTime,
                status: appointment.status,
                rescheduleCount: appointment.rescheduleCount
            }
        });
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ message: 'An error occurred while rescheduling the appointment' });
    }
};

// Provider to confirm reschedule
exports.confirmReschedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved, reason } = req.body;
        const providerId = req.user.id;

        // Find appointment
        const appointment = await Appointment.findById(id)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify user is the provider
        if (appointment.provider._id.toString() !== providerId) {
            return res.status(403).json({ message: 'You are not authorized to confirm this reschedule' });
        }

        // Check if appointment is pending reschedule confirmation
        if (appointment.status !== 'pending-provider-confirmation') {
            return res.status(400).json({
                message: 'This appointment is not pending reschedule confirmation'
            });
        }

        if (approved) {
            // Approve reschedule
            appointment.status = 'scheduled';

            // Send confirmation to client
            await NotificationService.sendRescheduleApprovedNotification(appointment);
        } else {
            // Reject reschedule - revert to original time if available in history
            const lastReschedule = appointment.rescheduleHistory[appointment.rescheduleHistory.length - 1];
            if (lastReschedule) {
                appointment.dateTime = lastReschedule.originalDateTime;
                appointment.rescheduleCount = Math.max(0, appointment.rescheduleCount - 1);
            }
            appointment.status = 'scheduled';

            // Send rejection notification
            await NotificationService.sendRescheduleRejectedNotification(appointment, reason);
        }

        await appointment.save();

        res.status(200).json({
            message: approved ? 'Reschedule approved successfully' : 'Reschedule rejected',
            appointment
        });
    } catch (error) {
        console.error('Error confirming reschedule:', error);
        res.status(500).json({ message: 'An error occurred while processing the reschedule request' });
    }
};

// Get payment status for appointment
exports.getAppointmentPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Find appointment
        const appointment = await Appointment.findById(id)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName email sessionFee');

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
        const Payment = require('../payment/model');
        const payment = await Payment.findOne({ appointment: id });

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

/**
 * Get all appointments for a specific client by ID
 * @route GET /api/appointments/client/:clientId
 * @access Private (client, provider, or admin)
 */
exports.getClientAppointmentsById = async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        // Authorization check: client can only see their own, providers/admins can see any
        if (currentUserRole === 'client' && currentUserId.toString() !== clientId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own appointments.'
            });
        }

        // Validate that the client exists
        const client = await User.findById(clientId);
        if (!client || client.role !== 'client') {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const appointments = await Appointment.find({ client: clientId })
            .populate('provider', 'firstName lastName email profilePicture specializations')
            .populate('client', 'firstName lastName email')
            .sort({ dateTime: -1 });

        res.status(200).json({
            success: true,
            appointments,
            count: appointments.length
        });

    } catch (error) {
        console.error('Error fetching client appointments by ID:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching appointments'
        });
    }
};

/**
 * Get appointment statistics for a specific client
 * @route GET /api/appointments/client/:clientId/stats
 * @access Private (client, provider, or admin)
 */
exports.getClientStats = async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        // Authorization check
        if (currentUserRole === 'client' && currentUserId.toString() !== clientId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Validate that the client exists
        const client = await User.findById(clientId);
        if (!client || client.role !== 'client') {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Get all appointments for this client
        const appointments = await Appointment.find({ client: clientId });

        // Calculate stats
        const now = new Date();
        const stats = {
            totalAppointments: appointments.length,
            completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
            upcomingAppointments: appointments.filter(apt => 
                apt.status === 'scheduled' && new Date(apt.dateTime) > now
            ).length,
            canceledAppointments: appointments.filter(apt => apt.status === 'canceled').length,
            totalHours: 0,
            uniqueProviders: new Set(),
            firstAppointment: null,
            lastAppointment: null
        };

        // Calculate additional stats
        if (appointments.length > 0) {
            // Sort appointments by date
            const sortedAppointments = appointments.sort((a, b) => 
                new Date(a.dateTime) - new Date(b.dateTime)
            );
            
            stats.firstAppointment = sortedAppointments[0].dateTime;
            stats.lastAppointment = sortedAppointments[sortedAppointments.length - 1].dateTime;

            // Calculate total hours and unique providers
            appointments.forEach(apt => {
                if (apt.status === 'completed') {
                    stats.totalHours += (apt.duration || 60) / 60; // Default 60 minutes
                }
                if (apt.provider) {
                    stats.uniqueProviders.add(apt.provider.toString());
                }
            });

            stats.uniqueProviders = stats.uniqueProviders.size;
        }

        res.status(200).json({
            success: true,
            ...stats
        });

    } catch (error) {
        console.error('Error fetching client stats:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching client statistics'
        });
    }
};

/**
 * Get all appointments for a specific provider by ID
 * @route GET /api/appointments/provider/:providerId
 * @access Private (provider or admin)
 */
exports.getProviderAppointmentsById = async (req, res) => {
    try {
        const { providerId } = req.params;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        // Authorization check: provider can only see their own, admins can see any
        if (currentUserRole === 'provider' && currentUserId.toString() !== providerId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own appointments.'
            });
        }

        // Validate that the provider exists
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({
                success: false,
                message: 'Provider not found'
            });
        }

        const appointments = await Appointment.find({ provider: providerId })
            .populate('client', 'firstName lastName email profilePicture dateOfBirth')
            .populate('provider', 'firstName lastName email')
            .sort({ dateTime: -1 });

        res.status(200).json({
            success: true,
            appointments,
            count: appointments.length
        });

    } catch (error) {
        console.error('Error fetching provider appointments by ID:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching appointments'
        });
    }
};

/**
 * Update appointment status
 * @route PATCH /api/appointments/:id/status
 * @access Private
 */
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const currentUserId = req.user.id;
        const currentUserRole = req.user.role;

        // Validate status
        const validStatuses = ['scheduled', 'completed', 'canceled', 'no-show', 'pending-payment'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided'
            });
        }

        // Find the appointment
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Authorization check
        const isAuthorized = currentUserRole === 'admin' ||
            appointment.client.toString() === currentUserId ||
            appointment.provider.toString() === currentUserId;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Business rules for status changes
        if (status === 'completed' && currentUserRole !== 'provider' && currentUserRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only providers can mark appointments as completed'
            });
        }

        // Update appointment
        appointment.status = status;
        appointment.updatedAt = new Date();

        // Add metadata about who changed the status
        if (status === 'canceled') {
            appointment.canceledBy = currentUserRole;
            appointment.canceledAt = new Date();
        }

        await appointment.save();

        // Populate for response
        await appointment.populate('client', 'firstName lastName email');
        await appointment.populate('provider', 'firstName lastName email');

        res.status(200).json({
            success: true,
            appointment,
            message: `Appointment status updated to ${status}`
        });

    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating appointment status'
        });
    }
};