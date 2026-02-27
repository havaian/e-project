// backend/src/earnings/routes.js
const express = require('express');
const router = express.Router();
const earningsController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');

// All earnings routes require authentication and provider role
router.use(authenticateUser, authorizeRoles(['provider']));

/**
 * @route GET /api/earnings
 * @desc Get earnings statistics with optional source and period filters
 * @access Private (Provider only)
 * @query {string} source - 'consultation', 'course', or 'all' (default: 'all')
 * @query {string} period - 'daily', 'weekly', 'monthly', 'yearly' (default: 'monthly')
 * @query {string} startDate - ISO date string (optional)
 * @query {string} endDate - ISO date string (optional)
 * @query {number} limit - Number of records (default: 12)
 */
router.get('/', earningsController.getEarnings);

/**
 * @route GET /api/earnings/summary
 * @desc Quick dashboard summary — current vs previous month per source
 * @access Private (Provider only)
 */
router.get('/summary', earningsController.getSummary);

/**
 * @route GET /api/earnings/export
 * @desc Export earnings data as CSV
 * @access Private (Provider only)
 * @query {string} format - 'csv' or 'json' (default: 'csv')
 * @query {string} source - 'consultation', 'course', or 'all' (default: 'all')
 * @query {string} period - 'daily', 'weekly', 'monthly', 'yearly' (default: 'monthly')
 * @query {string} startDate - ISO date string (optional)
 * @query {string} endDate - ISO date string (optional)
 */
router.get('/export', earningsController.exportEarnings);

module.exports = router;