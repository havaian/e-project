const User = require('../model');
const Appointment = require('../../appointment/model');
const Payment = require('../../payment/model');
const ProviderEarnings = require('./model');
const { startOfWeek, endOfWeek, format, subMonths, startOfMonth, endOfMonth } = require('date-fns');

/**
 * Get provider earnings statistics
 */
exports.getEarnings = async (req, res) => {
    try {
        const providerId = req.user.id;
        const {
            period = 'monthly',
            startDate,
            endDate,
            limit = 12
        } = req.query;

        // Validate period
        if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
            return res.status(400).json({ message: 'Invalid period specified' });
        }

        let earnings;

        if (startDate && endDate) {
            earnings = await ProviderEarnings.getEarningsForPeriod(
                providerId,
                period,
                new Date(startDate),
                new Date(endDate)
            );
        } else {
            earnings = await ProviderEarnings.getEarningsSummary(
                providerId,
                period,
                parseInt(limit)
            );
        }

        // Calculate totals
        const totals = earnings.reduce((acc, record) => {
            acc.totalEarnings += record.totalEarnings;
            acc.netEarnings += record.netEarnings;
            acc.totalAppointments += record.totalAppointments;
            acc.completedAppointments += record.completedAppointments;
            return acc;
        }, {
            totalEarnings: 0,
            netEarnings: 0,
            totalAppointments: 0,
            completedAppointments: 0
        });

        // Calculate average earnings per appointment
        totals.averageEarningsPerAppointment = totals.completedAppointments > 0
            ? totals.totalEarnings / totals.completedAppointments
            : 0;

        res.status(200).json({
            earnings,
            totals,
            period,
            count: earnings.length
        });
    } catch (error) {
        console.error('Error fetching provider earnings:', error);
        res.status(500).json({ message: 'An error occurred while fetching earnings data' });
    }
};

/**
 * Get provider analytics and profile data
 */
exports.getAnalytics = async (req, res) => {
    try {
        const providerId = req.user.id;

        // Get provider profile
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Get recent appointments for analytics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAppointments = await Appointment.find({
            provider: providerId,
            dateTime: { $gte: thirtyDaysAgo }
        }).populate('client', 'firstName lastName');

        // Calculate analytics
        const analytics = {
            profileCompletion: {
                percentage: provider.profileCompletionPercentage,
                isComplete: provider.isProfileComplete,
                currentStep: provider.profileSetupStep,
                completedAt: provider.profileCompletedAt
            },
            appointments: {
                total: recentAppointments.length,
                completed: recentAppointments.filter(apt => apt.status === 'completed').length,
                canceled: recentAppointments.filter(apt => apt.status === 'canceled').length,
                upcoming: recentAppointments.filter(apt =>
                    apt.status === 'scheduled' && new Date(apt.dateTime) > new Date()
                ).length
            },
            clients: {
                unique: [...new Set(recentAppointments.map(apt => apt.client._id.toString()))].length,
                returning: 0 // Calculate returning clients
            },
            sessionSettings: {
                duration: provider.sessionDuration,
                fee: provider.sessionFee
            }
        };

        // Calculate returning clients
        const clientAppointmentCounts = {};
        recentAppointments.forEach(apt => {
            const clientId = apt.client._id.toString();
            clientAppointmentCounts[clientId] = (clientAppointmentCounts[clientId] || 0) + 1;
        });
        analytics.clients.returning = Object.values(clientAppointmentCounts)
            .filter(count => count > 1).length;

        res.status(200).json({ analytics });
    } catch (error) {
        console.error('Error fetching provider analytics:', error);
        res.status(500).json({ message: 'An error occurred while fetching analytics' });
    }
};

/**
 * Get provider dashboard summary
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const providerId = req.user.id;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Get current month earnings
        const currentMonthEarnings = await ProviderEarnings.findOne({
            provider: providerId,
            period: 'monthly',
            year: currentYear,
            month: currentMonth
        });

        // Get previous month for comparison
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const previousMonthEarnings = await ProviderEarnings.findOne({
            provider: providerId,
            period: 'monthly',
            year: prevYear,
            month: prevMonth
        });

        // Get upcoming appointments
        const upcomingAppointments = await Appointment.find({
            provider: providerId,
            dateTime: { $gte: now },
            status: 'scheduled'
        }).sort({ dateTime: 1 }).limit(5).populate('client', 'firstName lastName');

        // Get pending confirmations
        const pendingConfirmations = await Appointment.find({
            provider: providerId,
            status: 'pending-provider-confirmation',
            providerConfirmationExpires: { $gt: now }
        }).populate('client', 'firstName lastName');

        // Calculate growth
        const currentEarnings = currentMonthEarnings?.totalEarnings || 0;
        const previousEarnings = previousMonthEarnings?.totalEarnings || 0;
        const earningsGrowth = previousEarnings > 0
            ? ((currentEarnings - previousEarnings) / previousEarnings) * 100
            : 0;

        const summary = {
            currentMonth: {
                earnings: currentEarnings,
                appointments: currentMonthEarnings?.totalAppointments || 0,
                growth: earningsGrowth
            },
            upcomingAppointments,
            pendingConfirmations,
            quickStats: {
                totalEarningsThisMonth: currentEarnings,
                completedAppointments: currentMonthEarnings?.completedAppointments || 0,
                upcomingCount: upcomingAppointments.length,
                pendingCount: pendingConfirmations.length
            }
        };

        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'An error occurred while fetching dashboard summary' });
    }
};

/**
 * Get profile completion status
 */
exports.getProfileCompletionStatus = async (req, res) => {
    try {
        const providerId = req.user.id;
        const provider = await User.findById(providerId);

        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Recalculate profile completion
        provider.calculateProfileCompletion();
        await provider.save();

        const completionStatus = {
            percentage: provider.profileCompletionPercentage,
            isComplete: provider.isProfileComplete,
            currentStep: provider.profileSetupStep,
            needsOnboarding: provider.needsOnboarding(),
            completedAt: provider.profileCompletedAt,
            missingFields: []
        };

        // Identify missing fields
        if (!provider.bio || provider.bio.length < 50) {
            completionStatus.missingFields.push('bio');
        }
        if (!provider.education || provider.education.length === 0) {
            completionStatus.missingFields.push('education');
        }
        if (!provider.availability || !provider.availability.some(day => day.isAvailable)) {
            completionStatus.missingFields.push('availability');
        }
        if (!provider.sessionFee || provider.sessionFee <= 0) {
            completionStatus.missingFields.push('sessionFee');
        }

        res.status(200).json({ completionStatus });
    } catch (error) {
        console.error('Error fetching profile completion status:', error);
        res.status(500).json({ message: 'An error occurred while fetching profile status' });
    }
};

/**
 * Update provider setup step
 */
exports.updateSetupStep = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { step } = req.body;

        if (!step || step < 0 || step > 6) {
            return res.status(400).json({ message: 'Invalid step number' });
        }

        const provider = await User.findByIdAndUpdate(
            providerId,
            {
                profileSetupStep: step,
                ...(step === 6 && { onboardingCompleted: true })
            },
            { new: true }
        );

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.status(200).json({
            step,
            onboardingCompleted: provider.onboardingCompleted
        });
    } catch (error) {
        console.error('Error updating setup step:', error);
        res.status(500).json({ message: 'An error occurred while updating setup step' });
    }
};

/**
 * Get availability calendar data
 */
exports.getAvailabilityCalendar = async (req, res) => {
    try {
        const providerId = req.user.id;
        const provider = await User.findById(providerId);

        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Get existing appointments for the period
        const { startDate, endDate } = req.query;
        const start = startDate ? new Date(startDate) : startOfWeek(new Date());
        const end = endDate ? new Date(endDate) : endOfWeek(start, { weekStartsOn: 1 });

        const appointments = await Appointment.find({
            provider: providerId,
            dateTime: { $gte: start, $lte: end },
            status: { $in: ['scheduled', 'completed'] }
        });

        const calendarData = {
            availability: provider.availability,
            appointments: appointments.map(apt => ({
                id: apt._id,
                dateTime: apt.dateTime,
                duration: apt.duration || provider.sessionDuration,
                status: apt.status,
                client: apt.client
            })),
            sessionDuration: provider.sessionDuration
        };

        res.status(200).json({ calendarData });
    } catch (error) {
        console.error('Error fetching availability calendar:', error);
        res.status(500).json({ message: 'An error occurred while fetching calendar data' });
    }
};

/**
 * Update provider availability
 */
exports.updateAvailability = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { availability } = req.body;

        if (!Array.isArray(availability)) {
            return res.status(400).json({ message: 'Availability must be an array' });
        }

        const provider = await User.findByIdAndUpdate(
            providerId,
            { availability },
            { new: true, runValidators: true }
        );

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.status(200).json({
            message: 'Availability updated successfully',
            availability: provider.availability
        });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ message: 'An error occurred while updating availability' });
    }
};

/**
 * Update session settings
 */
exports.updateSessionSettings = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { sessionDuration, sessionFee } = req.body;

        const updateData = {};

        if (sessionDuration !== undefined) {
            if (![15, 30, 45, 60].includes(sessionDuration)) {
                return res.status(400).json({
                    message: 'Session duration must be 15, 30, 45, or 60 minutes'
                });
            }
            updateData.sessionDuration = sessionDuration;
        }

        if (sessionFee !== undefined) {
            if (sessionFee <= 0) {
                return res.status(400).json({ message: 'Session fee must be positive' });
            }
            updateData.sessionFee = sessionFee;
        }

        const provider = await User.findByIdAndUpdate(
            providerId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.status(200).json({
            message: 'Session settings updated successfully',
            sessionDuration: provider.sessionDuration,
            sessionFee: provider.sessionFee
        });
    } catch (error) {
        console.error('Error updating session settings:', error);
        res.status(500).json({ message: 'An error occurred while updating session settings' });
    }
};

/**
 * Get appointment statistics
 */
exports.getAppointmentStats = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { period = 'monthly', limit = 6 } = req.query;

        const stats = await ProviderEarnings.find({
            provider: providerId,
            period
        })
            .sort({ year: -1, month: -1 })
            .limit(parseInt(limit));

        const formattedStats = stats.map(stat => ({
            period: period === 'monthly' ? `${stat.year}-${stat.month.toString().padStart(2, '0')}` : stat.year,
            totalAppointments: stat.totalAppointments,
            completedAppointments: stat.completedAppointments,
            canceledAppointments: stat.canceledAppointments,
            completionRate: stat.totalAppointments > 0
                ? (stat.completedAppointments / stat.totalAppointments) * 100
                : 0,
            earnings: stat.totalEarnings
        }));

        res.status(200).json({ stats: formattedStats });
    } catch (error) {
        console.error('Error fetching appointment stats:', error);
        res.status(500).json({ message: 'An error occurred while fetching appointment statistics' });
    }
};

/**
 * Export earnings data
 */
exports.exportEarnings = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { format = 'csv', period = 'monthly', startDate, endDate } = req.query;

        let earnings;
        if (startDate && endDate) {
            earnings = await ProviderEarnings.getEarningsForPeriod(
                providerId,
                period,
                new Date(startDate),
                new Date(endDate)
            );
        } else {
            earnings = await ProviderEarnings.getEarningsSummary(providerId, period, 50);
        }

        if (format === 'csv') {
            // Generate CSV
            const csvHeader = 'Period,Total earnings,Net earnings,Appointments,Completed,Canceled\n';
            const csvRows = earnings.map(record => {
                const periodStr = period === 'monthly'
                    ? `${record.year}-${record.month.toString().padStart(2, '0')}`
                    : record.year;
                return `${periodStr},${record.totalEarnings},${record.netEarnings},${record.totalAppointments},${record.completedAppointments},${record.canceledAppointments}`;
            }).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=earnings-${period}-${Date.now()}.csv`);
            res.status(200).send(csvHeader + csvRows);
        } else {
            // For now, return JSON (PDF generation would require additional libraries)
            res.status(200).json({ earnings });
        }
    } catch (error) {
        console.error('Error exporting earnings:', error);
        res.status(500).json({ message: 'An error occurred while exporting earnings data' });
    }
};

module.exports = exports;