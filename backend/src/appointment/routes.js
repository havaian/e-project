const express = require('express');
const router = express.Router();
const appointmentController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');
const upload = require('../utils/multerConfig');

/**
 * @route POST /api/appointments
 * @desc Create a new appointment
 * @access Private (client or admin)
 */
router.post(
    '/',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    appointmentController.createAppointment
);

/**
 * @route GET /api/appointments/client
 * @desc Get all appointments for the current client
 * @access Private (client or admin)
 */
router.get(
    '/client',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    appointmentController.getClientAppointments
);

/**
 * @route GET /api/appointments/client/:clientId
 * @desc Get all appointments for a specific client by ID
 * @access Private (client or admin)
 */
router.get(
    '/client/:clientId',
    authenticateUser,
    authorizeRoles(['client', 'provider', 'admin']),
    appointmentController.getClientAppointmentsById
);

/**
 * @route GET /api/appointments/client/:clientId/stats
 * @desc Get appointment statistics for a specific client
 * @access Private (client or admin)
 */
router.get(
    '/client/:clientId/stats',
    authenticateUser,
    authorizeRoles(['client', 'provider', 'admin']),
    appointmentController.getClientStats
);

/**
 * @route GET /api/appointments/provider
 * @desc Get all appointments for the current provider
 * @access Private (provider or admin)
 */
router.get(
    '/provider',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    appointmentController.getProviderAppointments
);

/**
 * @route GET /api/appointments/provider/:providerId
 * @desc Get all appointments for a specific provider by ID
 * @access Private (provider or admin)
 */
router.get(
    '/provider/:providerId',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    appointmentController.getProviderAppointmentsById
);

/**
 * @route GET /api/appointments/all
 * @desc Get all appointments for the current user (minimal data for calendar)
 * @access Private
 */
router.get(
    '/all',
    authenticateUser,
    appointmentController.getAllUserAppointments
);

/**
 * @route GET /api/appointments/calendar
 * @desc Get appointments in calendar format
 * @access Private
 */
router.get(
    '/calendar',
    authenticateUser,
    appointmentController.getCalendarAppointments
);

/**
 * @route GET /api/appointments/availability/:providerId
 * @desc Get provider's available time slots for a specific date
 * @access Private (client or admin)
 */
router.get(
    '/availability/:providerId',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    appointmentController.getProviderAvailability
);

/**
 * @route GET /api/appointments/provider/:providerId/pending-confirmations
 * @desc Get appointments pending provider confirmation
 * @access Private (provider or admin)
 */
router.get(
    '/provider/:providerId/pending-confirmations',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    appointmentController.getPendingConfirmations
);

/**
 * @route GET /api/appointments/provider/:providerId/stats
 * @desc Get provider statistics (public)
 * @access Public
 */
router.get(
    '/provider/:providerId/stats',
    appointmentController.getProviderStats
);

/**
 * @route GET /api/appointments/client/:clientId/pending-follow-ups
 * @desc Get pending follow-up appointments for a client
 * @access Private (client or admin)
 */
router.get(
    '/client/:clientId/pending-follow-ups',
    authenticateUser,
    authorizeRoles(['client', 'admin']),
    appointmentController.getPendingFollowUps
);

/**
 * @route PATCH /api/appointments/:id/status
 * @desc Update appointment status
 * @access Private
 */
router.patch(
    '/:id/status',
    authenticateUser,
    appointmentController.updateAppointmentStatus
);

/**
 * @route GET /api/appointments/:id
 * @desc Get a specific appointment by ID
 * @access Private
 */
router.get(
    '/:id',
    authenticateUser,
    appointmentController.getAppointmentById
);

/**
 * @route PATCH /api/appointments/:id
 * @desc Update appointment (limited fields only)
 * @access Private
 */
router.patch(
    '/:id',
    authenticateUser,
    appointmentController.updateAppointment
);

/**
 * @route POST /api/appointments/:id/reschedule
 * @desc Request to reschedule an appointment (client only)
 * @access Private (client)
 */
router.post(
    '/:id/reschedule',
    authenticateUser,
    authorizeRoles(['client']),
    appointmentController.rescheduleAppointment
);

/**
 * @route POST /api/appointments/:id/confirm-reschedule
 * @desc Confirm or reject reschedule request (provider only)
 * @access Private (provider)
 */
router.post(
    '/:id/confirm-reschedule',
    authenticateUser,
    authorizeRoles(['provider']),
    appointmentController.confirmReschedule
);

/**
 * @route POST /api/appointments/:id/confirm
 * @desc Confirm appointment (provider only)
 * @access Private (provider or admin)
 */
router.post(
    '/:id/confirm',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    appointmentController.confirmAppointment
);

/**
 * @route POST /api/appointments/:id/recommendations
 * @desc Add recommendations to appointment
 * @access Private (provider or admin)
 */
router.post(
    '/:id/recommendations',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    appointmentController.updateRecommendations
);

/**
 * @route POST /api/appointments/:id/follow-up
 * @desc Schedule follow-up appointment
 * @access Private (provider or admin)
 */
router.post(
    '/:id/follow-up',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    appointmentController.scheduleFollowUp
);

/**
 * @route POST /api/appointments/:id/session-results
 * @desc Update session results and recommendations
 * @access Private (provider or admin)
 */
router.post(
    '/:id/session-results',
    authenticateUser,
    authorizeRoles(['provider', 'admin']),
    appointmentController.updateSessionResults
);

/**
 * @route POST /api/appointments/:id/upload-document
 * @desc Upload document for appointment
 * @access Private (client, provider, or admin)
 */
router.post(
    '/:id/upload-document',
    authenticateUser,
    upload.single('document'),
    appointmentController.uploadDocument
);

/**
 * @route GET /api/appointments/:id/documents
 * @desc Get documents for appointment
 * @access Private
 */
router.get(
    '/:id/documents',
    authenticateUser,
    appointmentController.getDocuments
);

/**
 * @route GET /api/appointments/:id/payment-status
 * @desc Get payment status for appointment
 * @access Private
 */
router.get(
    '/:id/payment-status',
    authenticateUser,
    appointmentController.getAppointmentPaymentStatus
);

module.exports = router;