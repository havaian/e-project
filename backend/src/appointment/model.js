const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the chat message schema
const chatMessageSchema = new Schema({
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const appointmentSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: function () {
            return this.dateTime !== undefined;
        },
        default: function () {
            return this.dateTime ? new Date(this.dateTime.getTime() + 30 * 60000) : undefined;
        }
    },
    duration: {
        type: Number,
        default: 30, // Duration in minutes, must be a multiple of 15
        min: 15,
        max: 120,
        validate: {
            validator: function (value) {
                return value % 15 === 0;
            },
            message: 'Duration must be a multiple of 15 minutes'
        }
    },
    status: {
        type: String,
        enum: ['pending-payment', 'pending-provider-confirmation', 'scheduled', 'completed', 'canceled', 'no-show'],
        default: 'pending-provider-confirmation'
    },
    type: {
        type: String,
        enum: ['video', 'audio', 'chat'],
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    sessionSummary: {
        type: String
    },
    // Added chatLog field to store messages
    chatLog: [chatMessageSchema],
    recommendations: [{
        title: String,
        description: String,
        frequency: String,
        duration: String,
        instructions: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    followUp: {
        recommended: Boolean,
        date: Date,
        notes: String
    },
    payment: {
        amount: Number,
        status: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending'
        },
        transactionId: String
    },
    documents: [{
        name: String,
        fileUrl: String,
        fileType: String,
        uploadedBy: {
            type: String,
            enum: ['client', 'provider']
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    cancellationReason: {
        type: String
    },
    providerConfirmationExpires: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ client: 1, dateTime: -1 });
appointmentSchema.index({ provider: 1, dateTime: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ providerConfirmationExpires: 1 }, { expireAfterSeconds: 0 }); // For TTL index

// Middleware to update the updatedAt field
appointmentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Set endTime based on dateTime and duration if not explicitly set
    if (this.dateTime && this.duration && !this.isModified('endTime')) {
        this.endTime = new Date(this.dateTime.getTime() + this.duration * 60000);
    }

    next();
});

// Instance methods
appointmentSchema.methods.cancel = function (reason) {
    this.status = 'canceled';
    if (reason) {
        this.cancellationReason = reason;
    }
    return this.save();
};

appointmentSchema.methods.complete = function (summary) {
    this.status = 'completed';
    if (summary) {
        this.sessionSummary = summary;
    }
    return this.save();
};

appointmentSchema.methods.confirmProvider = function () {
    if (this.status === 'pending-provider-confirmation') {
        this.status = 'scheduled';
    }
    return this.save();
};

// Static methods
appointmentSchema.statics.findUpcomingForClient = function (clientId) {
    return this.find({
        client: clientId,
        dateTime: { $gte: new Date() },
        status: 'scheduled'
    }).sort({ dateTime: 1 }).populate('provider');
};

appointmentSchema.statics.findUpcomingForProvider = function (providerId) {
    return this.find({
        provider: providerId,
        dateTime: { $gte: new Date() },
        status: 'scheduled'
    }).sort({ dateTime: 1 }).populate('client');
};

// Add method to find pending-payment follow-ups for a client
appointmentSchema.statics.findPendingFollowUpsForClient = function (clientId) {
    return this.find({
        client: clientId,
        status: 'pending-payment'
    }).sort({ dateTime: 1 }).populate('provider');
};

// Find appointments pending provider confirmation
appointmentSchema.statics.findPendingProviderConfirmation = function (providerId) {
    return this.find({
        provider: providerId,
        status: 'pending-provider-confirmation',
        providerConfirmationExpires: { $gt: new Date() }
    }).sort({ providerConfirmationExpires: 1 }).populate('client');
};

// Find expired provider confirmation appointments
appointmentSchema.statics.findExpiredProviderConfirmation = function () {
    return this.find({
        status: 'pending-provider-confirmation',
        providerConfirmationExpires: { $lte: new Date() }
    }).populate('client').populate('provider');
};

// Find appointments for calendar view
appointmentSchema.statics.findForCalendar = function (userId, userRole, startDate, endDate) {
    const query = {};

    if (userRole === 'client') {
        query.client = userId;
    } else if (userRole === 'provider') {
        query.provider = userId;
    }

    if (startDate && endDate) {
        query.dateTime = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    return this.find(query)
        .sort({ dateTime: 1 })
        .populate(userRole === 'client' ? 'provider' : 'client');
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;