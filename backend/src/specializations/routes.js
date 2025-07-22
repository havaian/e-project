const express = require('express');
const router = express.Router();
const specializationController = require('./controller');

/**
 * @route GET /api/specializations
 * @desc Get all active specializations
 * @access Public
 */
router.get('/', specializationController.getActiveSpecializations);

/**
 * @route GET /api/specializations/:id
 * @desc Get specializations by ID
 * @access Public
 */
router.get('/:id', specializationController.getSpecializationById);

/**
 * @route GET /api/specializations/:id/providers
 * @desc Get providers by specializations
 * @access Public
 */
router.get('/:id/providers', specializationController.getProvidersBySpecialization);

module.exports = router;