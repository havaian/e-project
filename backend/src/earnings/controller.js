// backend/src/earnings/controller.js
//
// Unified earnings controller. Supports filtering by source (consultation/course)
// and combined views. Replaces the earnings-specific parts of the old
// provider dashboard controller.

const Earnings = require('./model');

/**
 * GET /api/earnings
 * Get earnings statistics with optional source filter.
 *
 * Query params:
 *   source   - 'consultation', 'course', or 'all' (default: 'all')
 *   period   - 'daily', 'weekly', 'monthly', 'yearly' (default: 'monthly')
 *   startDate, endDate - ISO date strings for range queries
 *   limit    - number of records (default: 12)
 */
exports.getEarnings = async (req, res) => {
    try {
        const providerId = req.user.id;
        const {
            source = 'all',
            period = 'monthly',
            startDate,
            endDate,
            limit = 12
        } = req.query;

        // Validate inputs
        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
            return res.status(400).json({ message: 'Invalid period. Must be daily, weekly, monthly, or yearly.' });
        }

        if (!['consultation', 'course', 'all'].includes(source)) {
            return res.status(400).json({ message: 'Invalid source. Must be consultation, course, or all.' });
        }

        let earnings;
        const sourceFilter = source === 'all' ? null : source;

        if (source === 'all' && !startDate && !endDate) {
            // Combined aggregation for "All" tab
            earnings = await Earnings.getCombinedEarnings(providerId, period, parseInt(limit));
        } else if (startDate && endDate) {
            earnings = await Earnings.getEarningsForPeriod(
                providerId, period, new Date(startDate), new Date(endDate), sourceFilter
            );
        } else {
            earnings = await Earnings.getEarningsSummary(providerId, period, parseInt(limit), sourceFilter);
        }

        // Calculate totals
        const totals = earnings.reduce((acc, record) => {
            acc.totalEarnings += record.totalEarnings || 0;
            acc.netEarnings += record.netEarnings || 0;
            acc.platformFee += record.platformFee || 0;
            acc.totalTransactions += record.totalTransactions || 0;
            acc.completedTransactions += record.completedTransactions || 0;
            return acc;
        }, {
            totalEarnings: 0,
            netEarnings: 0,
            platformFee: 0,
            totalTransactions: 0,
            completedTransactions: 0
        });

        totals.averagePerTransaction = totals.completedTransactions > 0
            ? totals.totalEarnings / totals.completedTransactions
            : 0;

        res.status(200).json({
            earnings,
            totals,
            period,
            source,
            count: earnings.length
        });
    } catch (error) {
        console.error('Error fetching earnings:', error);
        res.status(500).json({ message: 'An error occurred while fetching earnings data' });
    }
};

/**
 * GET /api/earnings/summary
 * Quick dashboard summary — current month vs previous month for each source.
 */
exports.getSummary = async (req, res) => {
    try {
        const providerId = req.user.id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        // Get current and previous month for each source
        const [currentConsultation, prevConsultation, currentCourse, prevCourse] = await Promise.all([
            Earnings.findOne({ provider: providerId, source: 'consultation', period: 'monthly', year: currentYear, month: currentMonth }),
            Earnings.findOne({ provider: providerId, source: 'consultation', period: 'monthly', year: prevYear, month: prevMonth }),
            Earnings.findOne({ provider: providerId, source: 'course', period: 'monthly', year: currentYear, month: currentMonth }),
            Earnings.findOne({ provider: providerId, source: 'course', period: 'monthly', year: prevYear, month: prevMonth }),
        ]);

        const calcGrowth = (current, previous) => {
            const curr = current?.totalEarnings || 0;
            const prev = previous?.totalEarnings || 0;
            return prev > 0 ? ((curr - prev) / prev) * 100 : 0;
        };

        const summary = {
            consultation: {
                currentMonth: currentConsultation?.totalEarnings || 0,
                previousMonth: prevConsultation?.totalEarnings || 0,
                growth: calcGrowth(currentConsultation, prevConsultation),
                transactions: currentConsultation?.completedTransactions || 0
            },
            course: {
                currentMonth: currentCourse?.totalEarnings || 0,
                previousMonth: prevCourse?.totalEarnings || 0,
                growth: calcGrowth(currentCourse, prevCourse),
                transactions: currentCourse?.completedTransactions || 0
            },
            combined: {
                currentMonth: (currentConsultation?.totalEarnings || 0) + (currentCourse?.totalEarnings || 0),
                previousMonth: (prevConsultation?.totalEarnings || 0) + (prevCourse?.totalEarnings || 0),
                growth: calcGrowth(
                    { totalEarnings: (currentConsultation?.totalEarnings || 0) + (currentCourse?.totalEarnings || 0) },
                    { totalEarnings: (prevConsultation?.totalEarnings || 0) + (prevCourse?.totalEarnings || 0) }
                )
            }
        };

        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error fetching earnings summary:', error);
        res.status(500).json({ message: 'An error occurred while fetching earnings summary' });
    }
};

/**
 * GET /api/earnings/export
 * Export earnings data as CSV.
 */
exports.exportEarnings = async (req, res) => {
    try {
        const providerId = req.user.id;
        const {
            format: exportFormat = 'csv',
            source = 'all',
            period = 'monthly',
            startDate,
            endDate
        } = req.query;

        const sourceFilter = source === 'all' ? null : source;

        let earnings;
        if (startDate && endDate) {
            earnings = await Earnings.getEarningsForPeriod(
                providerId, period, new Date(startDate), new Date(endDate), sourceFilter
            );
        } else if (source === 'all') {
            earnings = await Earnings.getCombinedEarnings(providerId, period, 50);
        } else {
            earnings = await Earnings.getEarningsSummary(providerId, period, 50, sourceFilter);
        }

        if (exportFormat === 'csv') {
            const csvHeader = 'Period,Source,Total Earnings,Platform Fee,Net Earnings,Transactions,Completed,Canceled\n';
            const csvRows = earnings.map(record => {
                let periodStr;
                if (period === 'monthly') {
                    periodStr = `${record.year}-${String(record.month).padStart(2, '0')}`;
                } else if (period === 'daily') {
                    periodStr = `${record.year}-${String(record.month).padStart(2, '0')}-${String(record.day).padStart(2, '0')}`;
                } else {
                    periodStr = String(record.year);
                }

                const src = record.source || source;
                return `${periodStr},${src},${record.totalEarnings},${record.platformFee},${record.netEarnings},${record.totalTransactions},${record.completedTransactions},${record.canceledTransactions || 0}`;
            }).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=earnings-${source}-${period}-${Date.now()}.csv`);
            res.status(200).send(csvHeader + csvRows);
        } else {
            res.status(200).json({ earnings });
        }
    } catch (error) {
        console.error('Error exporting earnings:', error);
        res.status(500).json({ message: 'An error occurred while exporting earnings data' });
    }
};

module.exports = exports;