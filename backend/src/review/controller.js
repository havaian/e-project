// backend/src/review/controller.js
const Review = require('./model');
const Appointment = require('../appointment/model');
const User = require('../user/model');
const { NotificationService } = require('../notification');

/**
 * Create a new review for a completed appointment
 */
exports.createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        const clientId = req.user.id;

        // Validate input
        if (!appointmentId || !rating || !comment) {
            return res.status(400).json({
                message: 'Appointment ID, rating, and comment are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: 'Rating must be between 1 and 5'
            });
        }

        if (comment.length < 10 || comment.length > 1000) {
            return res.status(400).json({
                message: 'Comment must be between 10 and 1000 characters'
            });
        }

        // Find the appointment and verify it's completed
        const appointment = await Appointment.findById(appointmentId)
            .populate('provider', 'firstName lastName email')
            .populate('client', 'firstName lastName');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.client._id.toString() !== clientId) {
            return res.status(403).json({
                message: 'You can only review your own appointments'
            });
        }

        if (appointment.status !== 'completed') {
            return res.status(400).json({
                message: 'You can only review completed appointments'
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ appointment: appointmentId });
        if (existingReview) {
            return res.status(409).json({
                message: 'You have already reviewed this appointment'
            });
        }

        // Create the review
        const review = new Review({
            appointment: appointmentId,
            client: clientId,
            provider: appointment.provider._id,
            rating,
            comment: comment.trim()
        });

        await review.save();

        // Populate the review for response
        await review.populate('client', 'firstName lastName profilePicture');
        await review.populate('provider', 'firstName lastName');
        await review.populate('appointment', 'dateTime type');

        // Notify provider about new review
        try {
            await NotificationService.sendNewReviewNotification(review);
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

/**
 * Get all reviews for a specific provider
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

        // Verify provider exists
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Get reviews
        const reviews = await Review.getProviderReviews(providerId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sortBy,
            sortOrder
        });

        // Get provider's average rating and total reviews
        const { averageRating, totalReviews } = await Review.getProviderAverageRating(providerId);

        // Get total count for pagination
        const totalCount = await Review.countDocuments({
            provider: providerId,
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
        res.status(500).json({
            message: 'An error occurred while fetching reviews'
        });
    }
};

/**
 * Get reviews written by a specific client
 */
exports.getClientReviews = async (req, res) => {
    try {
        const { clientId } = req.params;
        const { limit = 10, skip = 0 } = req.query;

        // Verify access (clients can only see their own reviews, providers/admins can see all)
        if (req.user.role === 'client' && req.user.id.toString() !== clientId) {
            return res.status(403).json({
                message: 'You can only view your own reviews'
            });
        }

        const reviews = await Review.find({
            client: clientId,
            status: { $in: ['active', 'hidden'] } // Include hidden reviews for the client
        })
            .populate('provider', 'firstName lastName profilePicture specializations')
            .populate('appointment', 'dateTime type')
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const totalCount = await Review.countDocuments({
            client: clientId,
            status: { $in: ['active', 'hidden'] }
        });

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
        console.error('Error fetching client reviews:', error);
        res.status(500).json({
            message: 'An error occurred while fetching reviews'
        });
    }
};

/**
 * Provider responds to a review
 */
exports.respondToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { responseText } = req.body;
        const providerId = req.user.id;

        if (!responseText || responseText.trim().length < 10) {
            return res.status(400).json({
                message: 'Response must be at least 10 characters long'
            });
        }

        if (responseText.length > 500) {
            return res.status(400).json({
                message: 'Response cannot exceed 500 characters'
            });
        }

        // Find the review and verify provider ownership
        const review = await Review.findById(reviewId)
            .populate('client', 'firstName lastName email')
            .populate('provider', 'firstName lastName');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.provider._id.toString() !== providerId) {
            return res.status(403).json({
                message: 'You can only respond to reviews about you'
            });
        }

        if (review.providerResponse && review.providerResponse.text) {
            return res.status(409).json({
                message: 'You have already responded to this review'
            });
        }

        // Add the response
        await review.respond(responseText.trim());

        // Notify client about provider's response
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
        res.status(500).json({
            message: 'An error occurred while responding to the review'
        });
    }
};

/**
 * Update a review (only by the client who wrote it, within 24 hours)
 */
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const clientId = req.user.id;

        // Find the review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify ownership
        if (review.client.toString() !== clientId) {
            return res.status(403).json({
                message: 'You can only edit your own reviews'
            });
        }

        // Check if review is still editable (within 24 hours)
        const hoursSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60);
        if (hoursSinceCreation > 24) {
            return res.status(400).json({
                message: 'Reviews can only be edited within 24 hours of creation'
            });
        }

        // Validate new values
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                message: 'Rating must be between 1 and 5'
            });
        }

        if (comment && (comment.length < 10 || comment.length > 1000)) {
            return res.status(400).json({
                message: 'Comment must be between 10 and 1000 characters'
            });
        }

        // Update the review
        if (rating) review.rating = rating;
        if (comment) review.comment = comment.trim();

        await review.save();
        await review.populate('client', 'firstName lastName profilePicture');

        res.status(200).json({
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            message: 'An error occurred while updating the review'
        });
    }
};

/**
 * Flag a review for inappropriate content
 */
exports.flagReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;

        const validReasons = ['inappropriate', 'spam', 'fake', 'offensive'];
        if (!reason || !validReasons.includes(reason)) {
            return res.status(400).json({
                message: 'Valid flag reason is required',
                validReasons
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.flag(reason);

        res.status(200).json({
            message: 'Review flagged successfully'
        });
    } catch (error) {
        console.error('Error flagging review:', error);
        res.status(500).json({
            message: 'An error occurred while flagging the review'
        });
    }
};

/**
 * Admin: Moderate flagged reviews
 */
exports.moderateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { action } = req.body; // 'approve', 'hide', 'delete'

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
                return res.status(400).json({
                    message: 'Invalid action. Use approve, hide, or delete'
                });
        }

        res.status(200).json({
            message: `Review ${action}d successfully`,
            review
        });
    } catch (error) {
        console.error('Error moderating review:', error);
        res.status(500).json({
            message: 'An error occurred while moderating the review'
        });
    }
};

/**
 * Get review statistics for a provider
 */
exports.getReviewStatistics = async (req, res) => {
    try {
        const { providerId } = req.params;

        // Verify provider exists
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Get rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { provider: providerId, status: 'active' } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        // Get average rating and total reviews
        const { averageRating, totalReviews } = await Review.getProviderAverageRating(providerId);

        // Create distribution object
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
        console.error('Error fetching review statistics:', error);
        res.status(500).json({
            message: 'An error occurred while fetching review statistics'
        });
    }
};