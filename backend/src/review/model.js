// backend/src/review/model.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // ── Polymorphic fields ───────────────────────────────────────────────
    // What kind of thing is being reviewed
    reviewType: {
        type: String,
        enum: ['consultation', 'course'],
        required: true
    },

    // Direction of the review
    direction: {
        type: String,
        enum: ['client_to_provider', 'provider_to_client', 'client_to_course'],
        required: true
    },

    // Who wrote the review
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Who/what is being reviewed (user ref — for provider or client)
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // Not required because client_to_course reviews target a course, not a user
    },

    // ── Context refs (optional, depends on reviewType) ───────────────────
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
        // Present for consultation reviews
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
        // Present for course reviews
    },

    // ── Rating (for client_to_provider and client_to_course) ─────────────
    rating: {
        type: Number,
        min: 1,
        max: 5
        // Not required — provider_to_client reviews use tags instead
    },

    // Written review comment (for client_to_provider and client_to_course)
    comment: {
        type: String,
        maxlength: 1000
    },

    // ── Provider → Client review fields ──────────────────────────────────
    // Tags instead of numeric rating
    tags: [{
        type: String,
        enum: ['punctual', 'communicative', 'respectful', 'prepared']
    }],

    // Optional note from provider about the client
    note: {
        type: String,
        maxlength: 500
    },

    // ── Response (reviewee can respond to the review) ────────────────────
    providerResponse: {
        text: {
            type: String,
            maxlength: 500
        },
        respondedAt: {
            type: Date
        }
    },

    // ── Moderation ───────────────────────────────────────────────────────
    status: {
        type: String,
        enum: ['active', 'hidden', 'flagged'],
        default: 'active'
    },

    isVerified: {
        type: Boolean,
        default: true
    },

    helpfulVotes: {
        type: Number,
        default: 0
    },

    flagReason: {
        type: String,
        enum: ['inappropriate', 'spam', 'fake', 'offensive']
    }
}, {
    timestamps: true
});

// ── Indexes ──────────────────────────────────────────────────────────────────
// Query reviews by reviewee (provider profile page, client profile page)
reviewSchema.index({ reviewee: 1, direction: 1, status: 1, createdAt: -1 });
// Query reviews for a specific course
reviewSchema.index({ course: 1, direction: 1, status: 1, createdAt: -1 });
// Query reviews by reviewer (my reviews page)
reviewSchema.index({ reviewer: 1, createdAt: -1 });
// Prevent duplicate reviews per context
reviewSchema.index(
    { reviewer: 1, appointment: 1, direction: 1 },
    { unique: true, partialFilterExpression: { appointment: { $exists: true } } }
);
reviewSchema.index(
    { reviewer: 1, course: 1, direction: 1 },
    { unique: true, partialFilterExpression: { course: { $exists: true } } }
);

// ── Instance methods ─────────────────────────────────────────────────────────

reviewSchema.methods.respond = function (responseText) {
    this.providerResponse = {
        text: responseText,
        respondedAt: new Date()
    };
    return this.save();
};

reviewSchema.methods.flag = function (reason) {
    this.status = 'flagged';
    this.flagReason = reason;
    return this.save();
};

reviewSchema.methods.hide = function () {
    this.status = 'hidden';
    return this.save();
};

reviewSchema.methods.show = function () {
    this.status = 'active';
    this.flagReason = undefined;
    return this.save();
};

// ── Static methods ───────────────────────────────────────────────────────────

/**
 * Get average rating for a provider (from client_to_provider reviews)
 */
reviewSchema.statics.getProviderAverageRating = async function (providerId) {
    const result = await this.aggregate([
        {
            $match: {
                reviewee: new mongoose.Types.ObjectId(providerId),
                direction: 'client_to_provider',
                status: 'active',
                rating: { $exists: true }
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (result.length === 0) {
        return { averageRating: 0, totalReviews: 0 };
    }

    return {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews
    };
};

/**
 * Get average rating for a course (from client_to_course reviews)
 */
reviewSchema.statics.getCourseAverageRating = async function (courseId) {
    const result = await this.aggregate([
        {
            $match: {
                course: new mongoose.Types.ObjectId(courseId),
                direction: 'client_to_course',
                status: 'active',
                rating: { $exists: true }
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (result.length === 0) {
        return { averageRating: 0, totalReviews: 0 };
    }

    return {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews
    };
};

/**
 * Get client tags summary (from provider_to_client reviews)
 */
reviewSchema.statics.getClientTagsSummary = async function (clientId) {
    const result = await this.aggregate([
        {
            $match: {
                reviewee: new mongoose.Types.ObjectId(clientId),
                direction: 'provider_to_client',
                status: 'active'
            }
        },
        { $unwind: '$tags' },
        {
            $group: {
                _id: '$tags',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    const totalReviews = await this.countDocuments({
        reviewee: new mongoose.Types.ObjectId(clientId),
        direction: 'provider_to_client',
        status: 'active'
    });

    return {
        tags: result.map(r => ({ tag: r._id, count: r.count })),
        totalReviews
    };
};

/**
 * Get reviews for a provider (paginated)
 */
reviewSchema.statics.getProviderReviews = async function (providerId, options = {}) {
    const {
        limit = 10,
        skip = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find({
        reviewee: providerId,
        direction: 'client_to_provider',
        status: 'active'
    })
        .populate('reviewer', 'firstName lastName profilePicture')
        .populate('appointment', 'dateTime type')
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
};

/**
 * Get reviews for a course (paginated)
 */
reviewSchema.statics.getCourseReviews = async function (courseId, options = {}) {
    const {
        limit = 10,
        skip = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find({
        course: courseId,
        direction: 'client_to_course',
        status: 'active'
    })
        .populate('reviewer', 'firstName lastName profilePicture')
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
};

/**
 * Get reviews about a client (from providers, paginated)
 */
reviewSchema.statics.getClientReviews = async function (clientId, options = {}) {
    const {
        limit = 10,
        skip = 0
    } = options;

    return this.find({
        reviewee: clientId,
        direction: 'provider_to_client',
        status: 'active'
    })
        .populate('reviewer', 'firstName lastName profilePicture specializations')
        .populate('appointment', 'dateTime type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// ── Pre-save validation ─────────────────────────────────────────────────────

reviewSchema.pre('save', async function (next) {
    if (!this.isNew) return next();

    const direction = this.direction;

    // Validate required fields based on direction
    if (direction === 'client_to_provider' || direction === 'client_to_course') {
        if (!this.rating) {
            return next(Object.assign(new Error('Rating is required for this review type'), { name: 'ValidationError' }));
        }
        if (!this.comment || this.comment.trim().length < 10) {
            return next(Object.assign(new Error('Comment must be at least 10 characters'), { name: 'ValidationError' }));
        }
    }

    if (direction === 'provider_to_client') {
        if (!this.tags || this.tags.length === 0) {
            return next(Object.assign(new Error('At least one tag is required for client reviews'), { name: 'ValidationError' }));
        }
    }

    // Validate context ref
    if (this.reviewType === 'consultation' && !this.appointment) {
        return next(Object.assign(new Error('Appointment reference is required for consultation reviews'), { name: 'ValidationError' }));
    }

    if (direction === 'client_to_course' && !this.course) {
        return next(Object.assign(new Error('Course reference is required for course reviews'), { name: 'ValidationError' }));
    }

    // Validate consultation review: appointment must be completed
    if (this.reviewType === 'consultation' && this.appointment) {
        const Appointment = mongoose.model('Appointment');
        const appointment = await Appointment.findById(this.appointment);

        if (!appointment || appointment.status !== 'completed') {
            return next(Object.assign(new Error('Can only review completed appointments'), { name: 'ValidationError' }));
        }

        // Verify reviewer is actually a participant
        const reviewerId = this.reviewer.toString();
        const clientId = appointment.client.toString();
        const providerId = appointment.provider.toString();

        if (direction === 'client_to_provider' && reviewerId !== clientId) {
            return next(Object.assign(new Error('Only the client of this appointment can write this review'), { name: 'ValidationError' }));
        }
        if (direction === 'provider_to_client' && reviewerId !== providerId) {
            return next(Object.assign(new Error('Only the provider of this appointment can write this review'), { name: 'ValidationError' }));
        }
    }

    // Validate course review: client must have completed the course (or 100% progress)
    if (direction === 'client_to_course' && this.course) {
        const { Enrollment } = require('../course/model');
        const enrollment = await Enrollment.findOne({
            course: this.course,
            client: this.reviewer,
            'payment.status': { $in: ['succeeded', 'free'] }
        });

        if (!enrollment) {
            return next(Object.assign(new Error('Must be enrolled in the course to review it'), { name: 'ValidationError' }));
        }

        // Require completion (100% or status === 'completed')
        if (enrollment.status !== 'completed' && (enrollment.progress?.percentComplete || 0) < 100) {
            return next(Object.assign(new Error('Complete the course before leaving a review'), { name: 'ValidationError' }));
        }
    }

    next();
});

module.exports = mongoose.model('Review', reviewSchema);