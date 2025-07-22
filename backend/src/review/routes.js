// backend/src/review/routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');

/**
 * @route POST /api/reviews
 * @desc Create a new review for a completed appointment
 * @access Private (Client only)
 */
router.post('/',
    authenticateUser,
    authorizeRoles(['client']),
    reviewController.createReview
);

/**
 * @route GET /api/reviews/provider/:providerId
 * @desc Get all reviews for a specific provider
 * @access Public
 */
router.get('/provider/:providerId',
    reviewController.getProviderReviews
);

/**
 * @route GET /api/reviews/provider/:providerId/statistics
 * @desc Get review statistics for a provider (rating distribution, averages)
 * @access Public
 */
router.get('/provider/:providerId/statistics',
    reviewController.getReviewStatistics
);

/**
 * @route GET /api/reviews/client/:clientId
 * @desc Get all reviews written by a specific client
 * @access Private (Client can only see own reviews, providers/admins can see all)
 */
router.get('/client/:clientId',
    authenticateUser,
    reviewController.getClientReviews
);

/**
 * @route PUT /api/reviews/:reviewId
 * @desc Update a review (only by the client who wrote it, within 24 hours)
 * @access Private (Client only)
 */
router.put('/:reviewId',
    authenticateUser,
    authorizeRoles(['client']),
    reviewController.updateReview
);

/**
 * @route POST /api/reviews/:reviewId/respond
 * @desc Provider responds to a review
 * @access Private (Provider only)
 */
router.post('/:reviewId/respond',
    authenticateUser,
    authorizeRoles(['provider']),
    reviewController.respondToReview
);

/**
 * @route POST /api/reviews/:reviewId/flag
 * @desc Flag a review for inappropriate content
 * @access Private (Any authenticated user)
 */
router.post('/:reviewId/flag',
    authenticateUser,
    reviewController.flagReview
);

/**
 * @route POST /api/reviews/:reviewId/moderate
 * @desc Admin: Moderate a flagged review (approve, hide, or delete)
 * @access Private (Admin only)
 */
router.post('/:reviewId/moderate',
    authenticateUser,
    authorizeRoles(['admin']),
    reviewController.moderateReview
);

module.exports = router;