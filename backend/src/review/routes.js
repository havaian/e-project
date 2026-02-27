// backend/src/review/routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('./controller');
const { authenticateUser, authorizeRoles } = require('../auth');

/**
 * @route POST /api/reviews
 * @desc Create a review (unified — direction determined by body params)
 * @access Private (authenticated users)
 * @body Client → Provider: { appointmentId, rating, comment }
 * @body Client → Course:   { courseId, rating, comment }
 * @body Provider → Client:  { appointmentId, tags, note? }
 */
router.post('/',
    authenticateUser,
    reviewController.createReview
);

/**
 * @route GET /api/reviews/can-review
 * @desc Check if the user can review a given appointment or course
 * @access Private (authenticated users)
 * @query appointmentId or courseId
 */
router.get('/can-review',
    authenticateUser,
    reviewController.canReview
);

/**
 * @route GET /api/reviews/my-reviews
 * @desc Get all reviews written by the authenticated user
 * @access Private
 * @query direction — optional filter (client_to_provider, provider_to_client, client_to_course)
 * @query limit, skip — pagination
 */
router.get('/my-reviews',
    authenticateUser,
    reviewController.getMyReviews
);

/**
 * @route GET /api/reviews/provider/:providerId
 * @desc Get all reviews about a provider (client_to_provider)
 * @access Public
 */
router.get('/provider/:providerId',
    reviewController.getProviderReviews
);

/**
 * @route GET /api/reviews/provider/:providerId/statistics
 * @desc Get rating distribution for a provider
 * @access Public
 */
router.get('/provider/:providerId/statistics',
    reviewController.getProviderStatistics
);

/**
 * @route GET /api/reviews/course/:courseId
 * @desc Get all reviews for a course (client_to_course)
 * @access Public
 */
router.get('/course/:courseId',
    reviewController.getCourseReviews
);

/**
 * @route GET /api/reviews/course/:courseId/statistics
 * @desc Get rating distribution for a course
 * @access Public
 */
router.get('/course/:courseId/statistics',
    reviewController.getCourseStatistics
);

/**
 * @route GET /api/reviews/client/:clientId
 * @desc Get reviews about a client (provider_to_client)
 * @access Private (client can see own; providers/admins can see all)
 */
router.get('/client/:clientId',
    authenticateUser,
    reviewController.getClientReviews
);

/**
 * @route PUT /api/reviews/:reviewId
 * @desc Edit a review (only by reviewer, within 24 hours)
 * @access Private
 */
router.put('/:reviewId',
    authenticateUser,
    reviewController.updateReview
);

/**
 * @route POST /api/reviews/:reviewId/respond
 * @desc Provider responds to a client_to_provider review
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
 * @access Private (any authenticated user)
 */
router.post('/:reviewId/flag',
    authenticateUser,
    reviewController.flagReview
);

/**
 * @route POST /api/reviews/:reviewId/moderate
 * @desc Admin: moderate a flagged review (approve, hide, delete)
 * @access Private (Admin only)
 */
router.post('/:reviewId/moderate',
    authenticateUser,
    authorizeRoles(['admin']),
    reviewController.moderateReview
);

module.exports = router;