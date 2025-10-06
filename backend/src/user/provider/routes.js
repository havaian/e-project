const express = require('express');
const router = express.Router();
const providerDashboardController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../../auth');

// Apply authentication and provider role authorization to all routes
router.use(authenticateUser, authorizeRoles(['provider']));

/**
 * @route GET /api/users/providers/dashboard/earnings
 * @desc Get provider earnings statistics with optional date range and period
 * @access Private (Provider only)
 * @query {string} period - daily, weekly, monthly, yearly (default: monthly)
 * @query {string} startDate - ISO date string (optional)
 * @query {string} endDate - ISO date string (optional)
 * @query {number} limit - Number of records to return (default: 12)
 */
router.get('/dashboard/earnings', providerDashboardController.getEarnings);

/**
 * @route GET /api/users/providers/dashboard/analytics
 * @desc Get provider profile and appointment analytics
 * @access Private (Provider only)
 */
router.get('/dashboard/analytics', providerDashboardController.getAnalytics);

/**
 * @route GET /api/users/providers/dashboard/summary
 * @desc Get provider dashboard summary with key metrics
 * @access Private (Provider only)
 */
router.get('/dashboard/summary', providerDashboardController.getDashboardSummary);

/**
 * @route GET /api/users/providers/profile/completion-status
 * @desc Get provider profile completion status and next steps
 * @access Private (Provider only)
 */
router.get('/profile/completion-status', providerDashboardController.getProfileCompletionStatus);

/**
 * @route PATCH /api/users/providers/profile/setup-step
 * @desc Update provider onboarding step
 * @access Private (Provider only)
 * @body {number} step - Current step (1-6)
 */
router.patch('/profile/setup-step', providerDashboardController.updateSetupStep);

/**
 * @route GET /api/users/providers/availability/calendar
 * @desc Get provider availability in calendar format
 * @access Private (Provider only)
 * @query {string} startDate - ISO date string (default: current week)
 * @query {string} endDate - ISO date string (default: 4 weeks from start)
 */
router.get('/availability/calendar', providerDashboardController.getAvailabilityCalendar);

/**
 * @route PATCH /api/users/providers/availability/calendar
 * @desc Update provider availability
 * @access Private (Provider only)
 * @body {Array} availability - Array of availability objects
 */
router.patch('/availability/calendar', providerDashboardController.updateAvailability);

/**
 * @route GET /api/users/providers/earnings/export
 * @desc Export earnings data as CSV/PDF
 * @access Private (Provider only)
 * @query {string} format - csv or pdf (default: csv)
 * @query {string} period - daily, weekly, monthly, yearly (default: monthly)
 * @query {string} startDate - ISO date string
 * @query {string} endDate - ISO date string
 */
router.get('/earnings/export', providerDashboardController.exportEarnings);

/**
 * @route GET /api/users/providers/appointments/stats
 * @desc Get detailed appointment statistics
 * @access Private (Provider only)
 * @query {string} period - period for stats (default: monthly)
 * @query {number} limit - Number of periods to include (default: 6)
 */
router.get('/appointments/stats', providerDashboardController.getAppointmentStats);

/**
 * @route PATCH /api/users/providers/session-settings
 * @desc Update provider session settings (duration, fee)
 * @access Private (Provider only)
 * @body {number} sessionDuration - 15, 30, 45, or 60 minutes
 * @body {number} sessionFee - session fee amount
 */
router.patch('/session-settings', providerDashboardController.updateSessionSettings);

module.exports = router;