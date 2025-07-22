// backend/src/review/model.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Reference to the appointment this review is for
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    
    // Client who wrote the review
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Provider being reviewed
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Rating from 1 to 5 stars
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    
    // Written review comment
    comment: {
        type: String,
        required: true,
        maxlength: 1000
    },
    
    // Provider's response to the review (optional)
    providerResponse: {
        text: {
            type: String,
            maxlength: 500
        },
        respondedAt: {
            type: Date
        }
    },
    
    // Review status
    status: {
        type: String,
        enum: ['active', 'hidden', 'flagged'],
        default: 'active'
    },
    
    // Metadata
    isVerified: {
        type: Boolean,
        default: true // Since reviews come from actual appointments
    },
    
    // Helpful votes (for future use)
    helpfulVotes: {
        type: Number,
        default: 0
    },
    
    // Flag reasons (if flagged)
    flagReason: {
        type: String,
        enum: ['inappropriate', 'spam', 'fake', 'offensive'],
        required: function() {
            return this.status === 'flagged';
        }
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ client: 1, appointment: 1 });
reviewSchema.index({ appointment: 1 }, { unique: true }); // One review per appointment

// Virtual for average rating calculation
reviewSchema.virtual('averageRating').get(function() {
    return this.rating;
});

// Instance methods
reviewSchema.methods.respond = function(responseText) {
    this.providerResponse = {
        text: responseText,
        respondedAt: new Date()
    };
    return this.save();
};

reviewSchema.methods.flag = function(reason) {
    this.status = 'flagged';
    this.flagReason = reason;
    return this.save();
};

reviewSchema.methods.hide = function() {
    this.status = 'hidden';
    return this.save();
};

reviewSchema.methods.show = function() {
    this.status = 'active';
    this.flagReason = undefined;
    return this.save();
};

// Static methods
reviewSchema.statics.getProviderAverageRating = async function(providerId) {
    const pipeline = [
        { $match: { provider: providerId, status: 'active' } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ];
    
    const result = await this.aggregate(pipeline);
    
    if (result.length === 0) {
        return { averageRating: 0, totalReviews: 0 };
    }
    
    return {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: result[0].totalReviews
    };
};

reviewSchema.statics.getProviderReviews = async function(providerId, options = {}) {
    const {
        limit = 10,
        skip = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = options;
    
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    return this.find({ 
        provider: providerId, 
        status: 'active' 
    })
    .populate('client', 'firstName lastName profilePicture')
    .populate('appointment', 'dateTime type')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to validate that client actually had appointment with provider
reviewSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Appointment = mongoose.model('Appointment');
        
        const appointment = await Appointment.findOne({
            _id: this.appointment,
            client: this.client,
            provider: this.provider,
            status: 'completed'
        });
        
        if (!appointment) {
            const error = new Error('Can only review completed appointments');
            error.name = 'ValidationError';
            return next(error);
        }
        
        // Check if review already exists for this appointment
        const existingReview = await this.constructor.findOne({
            appointment: this.appointment
        });
        
        if (existingReview) {
            const error = new Error('Review already exists for this appointment');
            error.name = 'ValidationError';
            return next(error);
        }
    }
    
    next();
});

module.exports = mongoose.model('Review', reviewSchema);