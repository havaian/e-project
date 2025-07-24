const mongoose = require('mongoose');

const providerEarningsSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Time period
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },

    // Date identifiers
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number, // 1-12, null for yearly aggregation
        required: function () { return this.period !== 'yearly'; }
    },
    week: {
        type: Number, // Week number in year, null for monthly/yearly
        required: function () { return this.period === 'weekly'; }
    },
    day: {
        type: Number, // Day of month, null for weekly/monthly/yearly
        required: function () { return this.period === 'daily'; }
    },

    // Core earnings data
    totalEarnings: {
        type: Number,
        default: 0
    },
    platformFee: {
        type: Number,
        default: 0 // Amount kept by platform
    },
    netEarnings: {
        type: Number,
        default: 0 // Amount paid to provider
    },

    // Appointment statistics
    totalAppointments: {
        type: Number,
        default: 0
    },
    completedAppointments: {
        type: Number,
        default: 0
    },
    canceledAppointments: {
        type: Number,
        default: 0
    },
    noShowAppointments: {
        type: Number,
        default: 0
    },

    // Financial breakdown
    paymentBreakdown: {
        cash: { type: Number, default: 0 },
        card: { type: Number, default: 0 },
        bankTransfer: { type: Number, default: 0 }
    },

    // Session analytics
    averageSessionDuration: {
        type: Number,
        default: 0 // in minutes
    },
    totalSessionMinutes: {
        type: Number,
        default: 0
    },

    // Client analytics
    uniqueClients: {
        type: Number,
        default: 0
    },
    returningClients: {
        type: Number,
        default: 0
    },
    newClients: {
        type: Number,
        default: 0
    },

    // Rating analytics
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },

    // Growth indicators (compared to previous period)
    growthMetrics: {
        earningsGrowth: { type: Number, default: 0 }, // percentage
        appointmentGrowth: { type: Number, default: 0 }, // percentage
        clientGrowth: { type: Number, default: 0 } // percentage
    },

    // Last update timestamp
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
providerEarningsSchema.index({ provider: 1, period: 1, year: 1, month: 1 });
providerEarningsSchema.index({ provider: 1, period: 1, year: 1, week: 1 });
providerEarningsSchema.index({ provider: 1, period: 1, year: 1, month: 1, day: 1 });

// Unique constraint to prevent duplicate aggregations
providerEarningsSchema.index(
    { provider: 1, period: 1, year: 1, month: 1, week: 1, day: 1 },
    { unique: true, sparse: true }
);

// Static method to get earnings for a date range
providerEarningsSchema.statics.getEarningsForPeriod = function (providerId, period, startDate, endDate) {
    const query = { provider: providerId, period };

    if (period === 'monthly') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        query.year = { $gte: start.getFullYear(), $lte: end.getFullYear() };
        query.month = { $gte: start.getMonth() + 1, $lte: end.getMonth() + 1 };
    } else if (period === 'daily') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        query.year = { $gte: start.getFullYear(), $lte: end.getFullYear() };
        query.month = { $gte: start.getMonth() + 1, $lte: end.getMonth() + 1 };
    }

    return this.find(query).sort({ year: -1, month: -1, week: -1, day: -1 });
};

// Static method to get earnings summary
providerEarningsSchema.statics.getEarningsSummary = async function (providerId, period = 'monthly', limit = 12) {
    return this.find({ provider: providerId, period })
        .sort({ year: -1, month: -1, week: -1, day: -1 })
        .limit(limit);
};

// Static method to update or create earnings record
providerEarningsSchema.statics.updateEarnings = async function (providerId, appointment, operation = 'add') {
    const appointmentDate = new Date(appointment.dateTime);
    const year = appointmentDate.getFullYear();
    const month = appointmentDate.getMonth() + 1;
    const day = appointmentDate.getDate();

    // Get week number
    const startOfYear = new Date(year, 0, 1);
    const weekNumber = Math.ceil((((appointmentDate - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);

    const earnings = appointment.provider.sessionFee || 0;
    const platformFeeRate = 0.1; // 10% platform fee
    const platformFee = earnings * platformFeeRate;
    const netEarnings = earnings - platformFee;

    const multiplier = operation === 'add' ? 1 : -1;

    // Update records for different periods
    const periods = [
        { period: 'daily', year, month, day },
        { period: 'monthly', year, month },
        { period: 'yearly', year }
    ];

    for (const periodData of periods) {
        const filter = { provider: providerId, ...periodData };

        const update = {
            $inc: {
                totalEarnings: earnings * multiplier,
                platformFee: platformFee * multiplier,
                netEarnings: netEarnings * multiplier,
                totalAppointments: multiplier,
                [appointment.status === 'completed' ? 'completedAppointments' :
                    appointment.status === 'canceled' ? 'canceledAppointments' :
                        'totalAppointments']: multiplier
            },
            $set: {
                lastUpdated: new Date()
            }
        };

        await this.findOneAndUpdate(filter, update, { upsert: true });
    }
};

// Instance method to calculate growth compared to previous period
providerEarningsSchema.methods.calculateGrowth = async function () {
    let previousPeriodFilter = {};

    if (this.period === 'monthly') {
        const prevMonth = this.month === 1 ? 12 : this.month - 1;
        const prevYear = this.month === 1 ? this.year - 1 : this.year;
        previousPeriodFilter = {
            provider: this.provider,
            period: 'monthly',
            year: prevYear,
            month: prevMonth
        };
    } else if (this.period === 'yearly') {
        previousPeriodFilter = {
            provider: this.provider,
            period: 'yearly',
            year: this.year - 1
        };
    }

    const previousRecord = await this.constructor.findOne(previousPeriodFilter);

    if (previousRecord && previousRecord.totalEarnings > 0) {
        this.growthMetrics.earningsGrowth =
            ((this.totalEarnings - previousRecord.totalEarnings) / previousRecord.totalEarnings) * 100;
        this.growthMetrics.appointmentGrowth =
            ((this.totalAppointments - previousRecord.totalAppointments) / previousRecord.totalAppointments) * 100;
        this.growthMetrics.clientGrowth =
            ((this.uniqueClients - previousRecord.uniqueClients) / previousRecord.uniqueClients) * 100;
    }

    return this.save();
};

const ProviderEarnings = mongoose.model('ProviderEarnings', providerEarningsSchema);

module.exports = ProviderEarnings;