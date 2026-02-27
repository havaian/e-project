// backend/src/review/controller.js
const Review = require('./model');
const Appointment = require('../appointment/model');
const User = require('../user/model');
const { NotificationService } = require('../notification');

// ═══════════════════════════════════════════════════════════════════════════
//  CREATE — unified endpoint, direction determined by body params
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/reviews
 * Body for client → provider (consultation):
 *   { appointmentId, rating, comment }
 *
 * Body for client → course:
 *   { courseId, rating, comment }
 *
 * Body for provider → client (consultation):
 *   { appointmentId, tags, note? }
 */
exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const { appointmentId, courseId, rating, comment, tags, note } = req.body;

        let reviewData = { reviewer: userId };

        // ── Determine direction & populate reviewData ─────────────────────
        if (appointmentId && userRole === 'client') {
            // Client reviewing provider after consultation
            const appointment = await Appointment.findById(appointmentId)
                .populate('provider', 'firstName lastName email')
                .populate('client', 'firstName lastName');

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            if (appointment.client._id.toString() !== userId) {
                return res.status(403).json({ message: 'You can only review your own appointments' });
            }
            if (appointment.status !== 'completed') {
                return res.status(400).json({ message: 'You can only review completed appointments' });
            }

            // Check duplicate
            const existing = await Review.findOne({
                reviewer: userId,
                appointment: appointmentId,
                direction: 'client_to_provider'
            });
            if (existing) {
                return res.status(409).json({ message: 'You have already reviewed this appointment' });
            }

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            if (!comment || comment.trim().length < 10 || comment.length > 1000) {
                return res.status(400).json({ message: 'Comment must be between 10 and 1000 characters' });
            }

            reviewData = {
                ...reviewData,
                reviewType: 'consultation',
                direction: 'client_to_provider',
                reviewee: appointment.provider._id,
                appointment: appointmentId,
                rating,
                comment: comment.trim()
            };

        } else if (appointmentId && userRole === 'provider') {
            // Provider reviewing client after consultation
            const appointment = await Appointment.findById(appointmentId)
                .populate('provider', 'firstName lastName')
                .populate('client', 'firstName lastName email');

            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            if (appointment.provider._id.toString() !== userId) {
                return res.status(403).json({ message: 'You can only review clients from your own appointments' });
            }
            if (appointment.status !== 'completed') {
                return res.status(400).json({ message: 'You can only review completed appointments' });
            }

            // Check duplicate
            const existing = await Review.findOne({
                reviewer: userId,
                appointment: appointmentId,
                direction: 'provider_to_client'
            });
            if (existing) {
                return res.status(409).json({ message: 'You have already reviewed this client for this appointment' });
            }

            if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ message: 'At least one tag is required' });
            }

            const validTags = ['punctual', 'communicative', 'respectful', 'prepared'];
            const invalidTags = tags.filter(t => !validTags.includes(t));
            if (invalidTags.length > 0) {
                return res.status(400).json({
                    message: `Invalid tags: ${invalidTags.join(', ')}`,
                    validTags
                });
            }

            if (note && note.length > 500) {
                return res.status(400).json({ message: 'Note cannot exceed 500 characters' });
            }

            reviewData = {
                ...reviewData,
                reviewType: 'consultation',
                direction: 'provider_to_client',
                reviewee: appointment.client._id,
                appointment: appointmentId,
                tags,
                note: note?.trim() || undefined
            };

        } else if (courseId) {
            // Client reviewing a course
            if (userRole !== 'client') {
                return res.status(403).json({ message: 'Only clients can review courses' });
            }

            const { Enrollment } = require('../course/model');
            const Course = require('../course/model').Course || mongoose.model('Course');

            const enrollment = await Enrollment.findOne({
                course: courseId,
                client: userId,
                'payment.status': { $in: ['succeeded', 'free'] }
            });

            if (!enrollment) {
                return res.status(403).json({ message: 'You must be enrolled in this course to review it' });
            }

            if (enrollment.status !== 'completed' && (enrollment.progress?.percentComplete || 0) < 100) {
                return res.status(400).json({ message: 'Complete the course before leaving a review' });
            }

            // Check duplicate
            const existing = await Review.findOne({
                reviewer: userId,
                course: courseId,
                direction: 'client_to_course'
            });
            if (existing) {
                return res.status(409).json({ message: 'You have already reviewed this course' });
            }

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            if (!comment || comment.trim().length < 10 || comment.length > 1000) {
                return res.status(400).json({ message: 'Comment must be between 10 and 1000 characters' });
            }

            reviewData = {
                ...reviewData,
                reviewType: 'course',
                direction: 'client_to_course',
                course: courseId,
                rating,
                comment: comment.trim()
            };

        } else {
            return res.status(400).json({
                message: 'Provide either appointmentId or courseId'
            });
        }

        // ── Create & populate ────────────────────────────────────────────
        const review = new Review(reviewData);
        await review.save();

        await review.populate('reviewer', 'firstName lastName profilePicture');
        if (review.reviewee) {
            await review.populate('reviewee', 'firstName lastName profilePicture');
        }
        if (review.appointment) {
            await review.populate('appointment', 'dateTime type');
        }
        if (review.course) {
            await review.populate('course', 'title thumbnail');
        }

        // ── Notify ───────────────────────────────────────────────────────
        try {
            // Reuse existing notification methods when applicable
            if (review.direction === 'client_to_provider') {
                await NotificationService.sendNewReviewNotification(review);
            }
            // Future: add notifications for other directions
        } catch (notificationError) {
            console.error('Error sending review notification:', notificationError);
            // Don't fail the request if notification fails
        }

        res.status(201).json({
            message: 'Review created successfully',
            review
        });
    } catch (error) {
        console.error('Error creating review:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({
            message: 'An error occurred while creating the review'
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  READ — provider reviews
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/reviews/provider/:providerId
 * Returns reviews about a provider (client_to_provider direction)
 */
exports.getProviderReviews = async (req, res) => {
    try {
        const { providerId } = req.params;
        const {
            limit = 10,
            skip = 0,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        const reviews = await Review.getProviderReviews(providerId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sortBy,
            sortOrder
        });

        const { averageRating, totalReviews } = await Review.getProviderAverageRating(providerId);

        const totalCount = await Review.countDocuments({
            reviewee: providerId,
            direction: 'client_to_provider',
            status: 'active'
        });

        res.status(200).json({
            reviews,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                skip: parseInt(skip),
                pages: Math.ceil(totalCount / parseInt(limit))
            },
            statistics: {
                averageRating,
                totalReviews
            }
        });
    } catch (error) {
        console.error('Error fetching provider reviews:', error);
        res.status(500).json({ message: 'An error occurred while fetching reviews' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  READ — course reviews
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/reviews/course/:courseId
 * Returns reviews for a course (client_to_course direction)
 */
exports.getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;
        const {
            limit = 10,
            skip = 0,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const reviews = await Review.getCourseReviews(courseId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sortBy,
            sortOrder
        });

        const { averageRating, totalReviews } = await Review.getCourseAverageRating(courseId);

        const totalCount = await Review.countDocuments({
            course: courseId,
            direction: 'client_to_course',
            status: 'active'
        });

        res.status(200).json({
            reviews,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                skip: parseInt(skip),
                pages: Math.ceil(totalCount / parseInt(limit))
            },
            statistics: {
                averageRating,
                totalReviews
            }
        });
    } catch (error) {
        console.error('Error fetching course reviews:', error);
        res.status(500).json({ message: 'An error occurred while fetching reviews' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  READ — client reviews (reviews about a client, from providers)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/reviews/client/:clientId
 * Returns reviews about a client (provider_to_client direction)
 */
exports.getClientReviews = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { limit = 10, skip = 0 } = req.query;

        // Access control: clients can see their own, providers and admins can see all
        if (req.user.role === 'client' && req.user.id.toString() !== clientId) {
            return res.status(403).json({ message: 'You can only view your own reviews' });
        }

        const reviews = await Review.getClientReviews(clientId, {
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        const tagsSummary = await Review.getClientTagsSummary(clientId);

        const totalCount = await Review.countDocuments({
            reviewee: clientId,
            direction: 'provider_to_client',
            status: 'active'
        });

        res.status(200).json({
            reviews,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                skip: parseInt(skip),
                pages: Math.ceil(totalCount / parseInt(limit))
            },
            tagsSummary
        });
    } catch (error) {
        console.error('Error fetching client reviews:', error);
        res.status(500).json({ message: 'An error occurred while fetching reviews' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  READ — reviews written by the current user
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/reviews/my-reviews
 * Returns all reviews written by the authenticated user
 */
exports.getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10, skip = 0, direction } = req.query;

        const filter = {
            reviewer: userId,
            status: { $in: ['active', 'hidden'] }
        };

        if (direction) {
            filter.direction = direction;
        }

        const reviews = await Review.find(filter)
            .populate('reviewee', 'firstName lastName profilePicture specializations')
            .populate('appointment', 'dateTime type')
            .populate('course', 'title thumbnail')
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const totalCount = await Review.countDocuments(filter);

        res.status(200).json({
            reviews,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                skip: parseInt(skip),
                pages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching my reviews:', error);
        res.status(500).json({ message: 'An error occurred while fetching reviews' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  READ — review statistics
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/reviews/provider/:providerId/statistics
 * Rating distribution for a provider
 */
exports.getProviderStatistics = async (req, res) => {
    try {
        const { providerId } = req.params;

        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        const ratingDistribution = await Review.aggregate([
            {
                $match: {
                    reviewee: new (require('mongoose').Types.ObjectId)(providerId),
                    direction: 'client_to_provider',
                    status: 'active'
                }
            },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        const { averageRating, totalReviews } = await Review.getProviderAverageRating(providerId);

        const distribution = {};
        for (let i = 1; i <= 5; i++) {
            distribution[i] = 0;
        }
        ratingDistribution.forEach(item => {
            distribution[item._id] = item.count;
        });

        res.status(200).json({
            averageRating,
            totalReviews,
            ratingDistribution: distribution
        });
    } catch (error) {
        console.error('Error fetching provider review statistics:', error);
        res.status(500).json({ message: 'An error occurred while fetching review statistics' });
    }
};

/**
 * GET /api/reviews/course/:courseId/statistics
 * Rating distribution for a course
 */
exports.getCourseStatistics = async (req, res) => {
    try {
        const { courseId } = req.params;

        const ratingDistribution = await Review.aggregate([
            {
                $match: {
                    course: new (require('mongoose').Types.ObjectId)(courseId),
                    direction: 'client_to_course',
                    status: 'active'
                }
            },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        const { averageRating, totalReviews } = await Review.getCourseAverageRating(courseId);

        const distribution = {};
        for (let i = 1; i <= 5; i++) {
            distribution[i] = 0;
        }
        ratingDistribution.forEach(item => {
            distribution[item._id] = item.count;
        });

        res.status(200).json({
            averageRating,
            totalReviews,
            ratingDistribution: distribution
        });
    } catch (error) {
        console.error('Error fetching course review statistics:', error);
        res.status(500).json({ message: 'An error occurred while fetching review statistics' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  UPDATE — edit review (within 24 hours)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PUT /api/reviews/:reviewId
 */
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, tags, note } = req.body;
        const userId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.reviewer.toString() !== userId) {
            return res.status(403).json({ message: 'You can only edit your own reviews' });
        }

        // 24-hour edit window
        const hoursSinceCreation = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation > 24) {
            return res.status(400).json({ message: 'Reviews can only be edited within 24 hours of creation' });
        }

        // Update based on direction
        if (review.direction === 'client_to_provider' || review.direction === 'client_to_course') {
            if (rating !== undefined) {
                if (rating < 1 || rating > 5) {
                    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
                }
                review.rating = rating;
            }
            if (comment !== undefined) {
                if (comment.trim().length < 10 || comment.length > 1000) {
                    return res.status(400).json({ message: 'Comment must be between 10 and 1000 characters' });
                }
                review.comment = comment.trim();
            }
        } else if (review.direction === 'provider_to_client') {
            if (tags !== undefined) {
                const validTags = ['punctual', 'communicative', 'respectful', 'prepared'];
                const invalidTags = tags.filter(t => !validTags.includes(t));
                if (invalidTags.length > 0) {
                    return res.status(400).json({ message: `Invalid tags: ${invalidTags.join(', ')}` });
                }
                if (tags.length === 0) {
                    return res.status(400).json({ message: 'At least one tag is required' });
                }
                review.tags = tags;
            }
            if (note !== undefined) {
                if (note.length > 500) {
                    return res.status(400).json({ message: 'Note cannot exceed 500 characters' });
                }
                review.note = note.trim();
            }
        }

        await review.save();

        res.status(200).json({
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'An error occurred while updating the review' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  RESPOND — provider responds to a client_to_provider review
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/reviews/:reviewId/respond
 */
exports.respondToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { responseText } = req.body;
        const providerId = req.user.id;

        if (!responseText || responseText.trim().length < 10) {
            return res.status(400).json({ message: 'Response must be at least 10 characters long' });
        }
        if (responseText.length > 500) {
            return res.status(400).json({ message: 'Response cannot exceed 500 characters' });
        }

        const review = await Review.findById(reviewId)
            .populate('reviewer', 'firstName lastName email')
            .populate('reviewee', 'firstName lastName');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.direction !== 'client_to_provider') {
            return res.status(400).json({ message: 'Can only respond to client reviews' });
        }

        if (review.reviewee._id.toString() !== providerId) {
            return res.status(403).json({ message: 'You can only respond to reviews about you' });
        }

        if (review.providerResponse && review.providerResponse.text) {
            return res.status(409).json({ message: 'You have already responded to this review' });
        }

        await review.respond(responseText.trim());

        // Notify reviewer about the response
        try {
            await NotificationService.sendReviewResponseNotification(review);
        } catch (notificationError) {
            console.error('Error sending response notification:', notificationError);
        }

        res.status(200).json({
            message: 'Response added successfully',
            review
        });
    } catch (error) {
        console.error('Error responding to review:', error);
        res.status(500).json({ message: 'An error occurred while responding to the review' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  MODERATION — flag / moderate
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/reviews/:reviewId/flag
 */
exports.flagReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;

        const validReasons = ['inappropriate', 'spam', 'fake', 'offensive'];
        if (!reason || !validReasons.includes(reason)) {
            return res.status(400).json({ message: 'Valid flag reason is required', validReasons });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.flag(reason);

        res.status(200).json({ message: 'Review flagged successfully' });
    } catch (error) {
        console.error('Error flagging review:', error);
        res.status(500).json({ message: 'An error occurred while flagging the review' });
    }
};

/**
 * POST /api/reviews/:reviewId/moderate
 * Admin only — approve, hide, or delete
 */
exports.moderateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { action } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        switch (action) {
            case 'approve':
                await review.show();
                break;
            case 'hide':
                await review.hide();
                break;
            case 'delete':
                await review.deleteOne();
                return res.status(200).json({ message: 'Review deleted successfully' });
            default:
                return res.status(400).json({ message: 'Invalid action. Use approve, hide, or delete' });
        }

        res.status(200).json({
            message: `Review ${action}d successfully`,
            review
        });
    } catch (error) {
        console.error('Error moderating review:', error);
        res.status(500).json({ message: 'An error occurred while moderating the review' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  CHECK — can the user review this appointment/course?
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/reviews/can-review?appointmentId=...&courseId=...
 * Returns { canReview: true/false, reason?: string, existingReview?: {...} }
 */
exports.canReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { appointmentId, courseId } = req.query;

        if (appointmentId) {
            const direction = userRole === 'provider' ? 'provider_to_client' : 'client_to_provider';

            const existing = await Review.findOne({
                reviewer: userId,
                appointment: appointmentId,
                direction
            });

            if (existing) {
                return res.status(200).json({
                    canReview: false,
                    reason: 'already_reviewed',
                    existingReview: existing
                });
            }

            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(200).json({ canReview: false, reason: 'appointment_not_found' });
            }
            if (appointment.status !== 'completed') {
                return res.status(200).json({ canReview: false, reason: 'appointment_not_completed' });
            }

            // Verify participant
            const isParticipant = userRole === 'client'
                ? appointment.client.toString() === userId
                : appointment.provider.toString() === userId;

            if (!isParticipant) {
                return res.status(200).json({ canReview: false, reason: 'not_participant' });
            }

            return res.status(200).json({ canReview: true });

        } else if (courseId) {
            const existing = await Review.findOne({
                reviewer: userId,
                course: courseId,
                direction: 'client_to_course'
            });

            if (existing) {
                return res.status(200).json({
                    canReview: false,
                    reason: 'already_reviewed',
                    existingReview: existing
                });
            }

            const { Enrollment } = require('../course/model');
            const enrollment = await Enrollment.findOne({
                course: courseId,
                client: userId,
                'payment.status': { $in: ['succeeded', 'free'] }
            });

            if (!enrollment) {
                return res.status(200).json({ canReview: false, reason: 'not_enrolled' });
            }

            if (enrollment.status !== 'completed' && (enrollment.progress?.percentComplete || 0) < 100) {
                return res.status(200).json({ canReview: false, reason: 'course_not_completed' });
            }

            return res.status(200).json({ canReview: true });
        }

        return res.status(400).json({ message: 'Provide appointmentId or courseId' });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
};