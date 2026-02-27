const express = require('express');
const router = express.Router();
const paymentController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');

// Stripe webhook needs raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

/**
 * @route POST /api/payments/create-checkout
 * @desc Create a Stripe checkout session for payment
 * @access Private (client or admin)
 */
router.post(
    '/create-checkout',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    paymentController.createCheckoutSession
);

/**
 * @route GET /api/payments/my
 * @desc Get the authenticated client's payment history with summary
 * @access Private (client)
 * @query {string} status - Filter by status: pending, succeeded, failed, canceled (optional)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Results per page (default: 20)
 * @query {string} sort - Sort field with direction (default: '-createdAt')
 */
router.get(
    '/my',
    authenticateUser,
    authorizeRoles(['client']),
    paymentController.getMyPayments
);

/**
 * @route GET /api/payments/appointment/:appointmentId/status
 * @desc Get payment status for an appointment (client, provider, or admin)
 * @access Private
 */
router.get(
    '/appointment/:appointmentId/status',
    authenticateUser,
    paymentController.getAppointmentPaymentStatus
);

/**
 * @route GET /api/payments/session/:sessionId
 * @desc Verify payment session status
 * @access Public (needed for redirect after payment)
 */
router.get(
    '/session/:sessionId',
    paymentController.verifySessionStatus
);

module.exports = router;