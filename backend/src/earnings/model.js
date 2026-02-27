// backend/src/earnings/model.js
//
// Universal earnings aggregation model.
// Replaces the old ProviderEarnings model with a source-aware design
// that supports both consultation and course revenue streams,
// and can be extended for future earning sources.

const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Revenue source — allows filtering and combined views
    source: {
        type: String,
        enum: ['consultation', 'course'],
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
        type: Number, // Week number in year
        required: function () { return this.period === 'weekly'; }
    },
    day: {
        type: Number, // Day of month
        required: function () { return this.period === 'daily'; }
    },

    // ── Core financial data ──────────────────────────────────────────────
    totalEarnings: {
        type: Number,
        default: 0
    },
    platformFee: {
        type: Number,
        default: 0
    },
    netEarnings: {
        type: Number,
        default: 0
    },

    // ── Transaction statistics (generic names, meaning depends on source) ─
    // For consultations: appointments. For courses: enrollments/sales.
    totalTransactions: {
        type: Number,
        default: 0
    },
    completedTransactions: {
        type: Number,
        default: 0
    },
    canceledTransactions: {
        type: Number,
        default: 0
    },

    // ── Payment breakdown ────────────────────────────────────────────────
    paymentBreakdown: {
        cash: { type: Number, default: 0 },
        card: { type: Number, default: 0 },
        bankTransfer: { type: Number, default: 0 },
        free: { type: Number, default: 0 }  // Free course enrollments
    },

    // ── Client analytics ─────────────────────────────────────────────────
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

    // ── Rating analytics ─────────────────────────────────────────────────
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },

    // ── Source-specific metadata (optional, for detailed breakdowns) ─────
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // For consultations: { averageSessionDuration, totalSessionMinutes, noShowCount }
        // For courses: { coursesWithSales, freeEnrollments, paidEnrollments }
    },

    // ── Growth indicators (compared to previous period) ──────────────────
    growthMetrics: {
        earningsGrowth: { type: Number, default: 0 },
        transactionGrowth: { type: Number, default: 0 },
        clientGrowth: { type: Number, default: 0 }
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ── Indexes ──────────────────────────────────────────────────────────────────

// Primary query pattern: provider + source + period + date fields
earningsSchema.index({ provider: 1, source: 1, period: 1, year: -1, month: -1 });
earningsSchema.index({ provider: 1, source: 1, period: 1, year: -1, week: -1 });
earningsSchema.index({ provider: 1, source: 1, period: 1, year: -1, month: -1, day: -1 });

// Combined views (all sources for a provider)
earningsSchema.index({ provider: 1, period: 1, year: -1, month: -1 });

// Unique constraint to prevent duplicate aggregations
earningsSchema.index(
    { provider: 1, source: 1, period: 1, year: 1, month: 1, week: 1, day: 1 },
    { unique: true, sparse: true }
);

// ── Static methods ───────────────────────────────────────────────────────────

/**
 * Get earnings for a date range, optionally filtered by source.
 */
earningsSchema.statics.getEarningsForPeriod = function (providerId, period, startDate, endDate, source = null) {
    const query = { provider: providerId, period };

    if (source) {
        query.source = source;
    }

    if (period === 'monthly' || period === 'daily') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        query.year = { $gte: start.getFullYear(), $lte: end.getFullYear() };
        query.month = { $gte: start.getMonth() + 1, $lte: end.getMonth() + 1 };
    }

    return this.find(query).sort({ year: -1, month: -1, week: -1, day: -1 });
};

/**
 * Get earnings summary, optionally filtered by source.
 * When source is null, returns all sources (for "All" tab).
 */
earningsSchema.statics.getEarningsSummary = async function (providerId, period = 'monthly', limit = 12, source = null) {
    const query = { provider: providerId, period };

    if (source) {
        query.source = source;
    }

    return this.find(query)
        .sort({ year: -1, month: -1, week: -1, day: -1 })
        .limit(limit);
};

/**
 * Get combined earnings across all sources, aggregated by period.
 * Used for the "All" tab — merges consultation + course records for same period.
 */
earningsSchema.statics.getCombinedEarnings = async function (providerId, period = 'monthly', limit = 12) {
    const groupFields = { provider: '$provider', period: '$period', year: '$year' };

    if (period !== 'yearly') groupFields.month = '$month';
    if (period === 'weekly') groupFields.week = '$week';
    if (period === 'daily') groupFields.day = '$day';

    const pipeline = [
        { $match: { provider: new mongoose.Types.ObjectId(providerId), period } },
        {
            $group: {
                _id: groupFields,
                totalEarnings: { $sum: '$totalEarnings' },
                platformFee: { $sum: '$platformFee' },
                netEarnings: { $sum: '$netEarnings' },
                totalTransactions: { $sum: '$totalTransactions' },
                completedTransactions: { $sum: '$completedTransactions' },
                canceledTransactions: { $sum: '$canceledTransactions' },
                uniqueClients: { $sum: '$uniqueClients' },
                // Collect sources present in this period
                sources: { $addToSet: '$source' }
            }
        },
        {
            $project: {
                _id: 0,
                year: '$_id.year',
                month: '$_id.month',
                week: '$_id.week',
                day: '$_id.day',
                period: '$_id.period',
                source: 'all',
                totalEarnings: 1,
                platformFee: 1,
                netEarnings: 1,
                totalTransactions: 1,
                completedTransactions: 1,
                canceledTransactions: 1,
                uniqueClients: 1,
                sources: 1
            }
        },
        { $sort: { year: -1, month: -1, week: -1, day: -1 } },
        { $limit: limit }
    ];

    return this.aggregate(pipeline);
};

/**
 * Update or create an earnings record for a consultation (appointment).
 * Called when an appointment is completed, canceled, etc.
 */
earningsSchema.statics.recordConsultationEarning = async function (providerId, appointment, operation = 'add') {
    const appointmentDate = new Date(appointment.dateTime);
    const year = appointmentDate.getFullYear();
    const month = appointmentDate.getMonth() + 1;
    const day = appointmentDate.getDate();

    // Week number calculation
    const startOfYear = new Date(year, 0, 1);
    const weekNumber = Math.ceil((((appointmentDate - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);

    const earnings = appointment.provider?.sessionFee || appointment.sessionFee || 0;
    const platformFeeRate = 0.1; // 10% platform fee
    const platformFee = earnings * platformFeeRate;
    const netEarnings = earnings - platformFee;

    const multiplier = operation === 'add' ? 1 : -1;

    const statusField = appointment.status === 'completed' ? 'completedTransactions'
        : appointment.status === 'canceled' ? 'canceledTransactions'
            : 'totalTransactions';

    const periods = [
        { period: 'daily', year, month, day },
        { period: 'monthly', year, month },
        { period: 'yearly', year }
    ];

    for (const periodData of periods) {
        const filter = { provider: providerId, source: 'consultation', ...periodData };

        const update = {
            $inc: {
                totalEarnings: earnings * multiplier,
                platformFee: platformFee * multiplier,
                netEarnings: netEarnings * multiplier,
                totalTransactions: multiplier,
                [statusField]: multiplier
            },
            $set: { lastUpdated: new Date() }
        };

        await this.findOneAndUpdate(filter, update, { upsert: true });
    }
};

/**
 * Update or create an earnings record for a course enrollment.
 * Called when a course enrollment payment succeeds.
 */
earningsSchema.statics.recordCourseEarning = async function (providerId, enrollment, operation = 'add') {
    const enrollmentDate = new Date(enrollment.payment?.paidAt || enrollment.enrolledAt || Date.now());
    const year = enrollmentDate.getFullYear();
    const month = enrollmentDate.getMonth() + 1;
    const day = enrollmentDate.getDate();

    const startOfYear = new Date(year, 0, 1);
    const weekNumber = Math.ceil((((enrollmentDate - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);

    const earnings = enrollment.payment?.amount || 0;
    const platformFeeRate = 0.1; // 10% platform fee
    const platformFee = earnings * platformFeeRate;
    const netEarnings = earnings - platformFee;

    const multiplier = operation === 'add' ? 1 : -1;

    const isFree = enrollment.payment?.status === 'free';
    const paymentField = isFree ? 'paymentBreakdown.free' : 'paymentBreakdown.card';

    const periods = [
        { period: 'daily', year, month, day },
        { period: 'monthly', year, month },
        { period: 'yearly', year }
    ];

    for (const periodData of periods) {
        const filter = { provider: providerId, source: 'course', ...periodData };

        const update = {
            $inc: {
                totalEarnings: earnings * multiplier,
                platformFee: platformFee * multiplier,
                netEarnings: netEarnings * multiplier,
                totalTransactions: multiplier,
                completedTransactions: multiplier,
                [paymentField]: multiplier
            },
            $set: { lastUpdated: new Date() }
        };

        await this.findOneAndUpdate(filter, update, { upsert: true });
    }
};

/**
 * Calculate growth compared to previous period.
 */
earningsSchema.methods.calculateGrowth = async function () {
    let previousPeriodFilter = { provider: this.provider, source: this.source };

    if (this.period === 'monthly') {
        const prevMonth = this.month === 1 ? 12 : this.month - 1;
        const prevYear = this.month === 1 ? this.year - 1 : this.year;
        previousPeriodFilter.period = 'monthly';
        previousPeriodFilter.year = prevYear;
        previousPeriodFilter.month = prevMonth;
    } else if (this.period === 'yearly') {
        previousPeriodFilter.period = 'yearly';
        previousPeriodFilter.year = this.year - 1;
    }

    const previousRecord = await this.constructor.findOne(previousPeriodFilter);

    if (previousRecord && previousRecord.totalEarnings > 0) {
        this.growthMetrics.earningsGrowth =
            ((this.totalEarnings - previousRecord.totalEarnings) / previousRecord.totalEarnings) * 100;
        this.growthMetrics.transactionGrowth = previousRecord.totalTransactions > 0
            ? ((this.totalTransactions - previousRecord.totalTransactions) / previousRecord.totalTransactions) * 100
            : 0;
        this.growthMetrics.clientGrowth = previousRecord.uniqueClients > 0
            ? ((this.uniqueClients - previousRecord.uniqueClients) / previousRecord.uniqueClients) * 100
            : 0;
    }

    return this.save();
};

const Earnings = mongoose.model('Earnings', earningsSchema);

module.exports = Earnings;