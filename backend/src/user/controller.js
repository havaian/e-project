const User = require('./model');
const { validateUserInput } = require('../utils/validators');
const { NotificationService } = require('../notification');
const crypto = require('crypto');

// Register a new user (client or provider)
exports.registerUser = async (req, res) => {
    try {
        // First, we need to preprocess the data to prevent validation issues with role-specific fields
        const userData = { ...req.body };
        
        // If the user is a client, explicitly remove all provider-specific fields before validation
        if (userData.role === 'client' || !userData.role) {
            delete userData.specializations;
            delete userData.licenseNumber;
            delete userData.experience;
            delete userData.sessionFee;
            delete userData.sessionDuration;
            delete userData.bio;
            delete userData.languages;
            delete userData.education;
            delete userData.certifications;
            delete userData.availability;
        }
        
        // Validate the processed data
        const { error } = validateUserInput(userData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password, firstName, lastName, phone, role, dateOfBirth, gender } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create new user with base fields
        const user = new User({
            email,
            password,
            firstName,
            lastName,
            phone,
            role: role || 'client',
            dateOfBirth,
            gender,
            verificationToken,
            isVerified: false
        });

        // Add role-specific fields
        if (role === 'provider') {
            // Handle specializations (array)
            if (userData.specializations) {
                user.specializations = userData.specializations;
            } else {
                user.specializations = [];
            }
            
            user.licenseNumber = userData.licenseNumber || '';
            user.experience = userData.experience || 0;
            user.bio = userData.bio ? decodeURIComponent(userData.bio) : '';
            user.languages = userData.languages || [];
            user.sessionFee = userData.sessionFee || 0;
            user.sessionDuration = userData.sessionDuration || 60; // Default 60 minutes
            user.education = userData.education || [];
            user.certifications = userData.certifications || [];

            // Default availability (can be updated later)
            user.availability = [
                { dayOfWeek: 1, isAvailable: true, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 2, isAvailable: true, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 3, isAvailable: true, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 4, isAvailable: true, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 5, isAvailable: true, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 6, isAvailable: false, startTime: '00:00', endTime: '00:00' },
                { dayOfWeek: 7, isAvailable: false, startTime: '00:00', endTime: '00:00' }
            ];

            // Set initial profile completion step
            user.profileSetupStep = 1; // Start at step 1 (Education)
        }
        else if (role === 'client' || !role) {            
            // Explicitly ensure provider-specific fields are unset for clients
            user.specializations = undefined;
            user.licenseNumber = undefined;
            user.experience = undefined;
            user.sessionFee = undefined;
            user.sessionDuration = undefined;
            user.bio = undefined;
            user.languages = undefined;
            user.education = undefined;
            user.certifications = undefined;
            user.availability = undefined;
        }

        // Initialize default achievements and clients array
        user.initializeDefaultAchievements();
        if (role === 'provider') {
            user.clients = [];
        }

        // Save user to database (this will trigger profile completion calculation for providers)
        await user.save();

        // Send verification email
        await NotificationService.sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email before logging in.',
            needsOnboarding: user.role === 'provider' ? user.needsOnboarding() : false
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    }
};

// Verify user email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'An error occurred while verifying email' });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user and explicitly include password
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in.' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Your account has been deactivated. Please contact support.' });
        }

        // Update last login time
        user.lastLoginAt = new Date();
        
        // For providers, check if profile completion calculation is needed
        if (user.role === 'provider') {
            user.calculateProfileCompletion();
        }
        
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        // Prepare response with onboarding info for providers
        const response = {
            token,
            user: user.getPublicProfile()
        };

        // Add onboarding status for providers
        if (user.role === 'provider') {
            response.needsOnboarding = user.needsOnboarding();
            response.profileCompletion = {
                percentage: user.profileCompletionPercentage,
                isComplete: user.isProfileComplete,
                currentStep: user.profileSetupStep
            };
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'An error occurred while logging in' });
    }
};


// Get current user profile
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('clients', 'firstName lastName profilePicture role')
            .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -jwtSecret');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const response = user.getPublicProfile();

        // Add provider-specific information
        if (user.role === 'provider') {
            response.needsOnboarding = user.needsOnboarding();
            response.profileCompletion = {
                percentage: user.profileCompletionPercentage,
                isComplete: user.isProfileComplete,
                currentStep: user.profileSetupStep
            };
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'An error occurred while fetching user profile' });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const allowedUpdates = [
            'firstName', 'lastName', 'phone', 'profilePicture', 'bio', 'languages', 'availability',
            'sessionFee', 'backgroundInfo', 'emergencyContact', 'sessionDuration',
            'specializations', 'education', 'certifications', 'experience'
        ];

        const updates = {};

        // Filter only allowed fields
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // Decode bio if present
        if (updates.bio) {
            updates.bio = decodeURIComponent(updates.bio);
        }

        // Validate session duration if provided
        if (updates.sessionDuration && ![15, 30, 45, 60, 75, 90, 105, 120].includes(updates.sessionDuration)) {
            return res.status(400).json({ 
                message: 'Session duration must be 15, 30, 45, 60, 75, 90, 105, or 120 minutes' 
            });
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Recalculate profile completion for providers
        if (user.role === 'provider') {
            user.calculateProfileCompletion();
            await user.save();
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: user.getPublicProfile(),
            ...(user.role === 'provider' && {
                profileCompletion: {
                    percentage: user.profileCompletionPercentage,
                    isComplete: user.isProfileComplete,
                    currentStep: user.profileSetupStep
                }
            })
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'An error occurred while updating profile' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'An error occurred while changing password' });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide your email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save();

        // Send password reset email
        await NotificationService.sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error sending password reset email:', error);
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const resetPasswordToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

        if (!password) {
            return res.status(400).json({ message: 'Please provide a new password' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Find user with the token and check if token is still valid
        const user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update password and clear reset token fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'An error occurred while resetting password' });
    }
};

// Get all providers (with optional filters)
exports.getProviders = async (req, res) => {
    try {
        const {
            specialization,
            minExperience,
            maxSessionFee,
            language,
            sortBy = 'experience',
            order = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Build filter query - ONLY complete profiles
        const filter = {
            role: 'provider',
            isActive: true,
            isVerified: true,
            isProfileComplete: true  // NEW: Only show complete profiles
        };

        if (specialization) {
            filter.specializations = { $in: [new RegExp(specialization, 'i')] };
        }

        if (minExperience) {
            filter.experience = { $gte: parseInt(minExperience) };
        }

        if (maxSessionFee) {
            filter.sessionFee = { $lte: parseFloat(maxSessionFee) };
        }

        if (language) {
            filter.languages = { $in: [new RegExp(language, 'i')] };
        }

        // Build sort options
        const sortOptions = {};
        const validSortFields = ['experience', 'sessionFee', 'createdAt', 'firstName'];
        
        if (validSortFields.includes(sortBy)) {
            sortOptions[sortBy] = order === 'asc' ? 1 : -1;
        } else {
            sortOptions.experience = -1; // Default sort
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [providers, total] = await Promise.all([
            User.find(filter)
                .select('firstName lastName specializations experience sessionFee languages profilePicture bio profileCompletionPercentage')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            providers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            filters: { specialization, minExperience, maxSessionFee, language, sortBy, order }
        });
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ message: 'An error occurred while fetching providers' });
    }
};

// Get provider by ID
exports.getProviderById = async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await User.findOne({
            _id: id,
            role: 'provider',
            isActive: true,
            isVerified: true,
            isProfileComplete: true
        }).select('firstName lastName specializations experience sessionFee sessionDuration languages profilePicture bio education certifications availability profileCompletionPercentage');

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.status(200).json({ provider });
    } catch (error) {
        console.error('Error fetching provider details:', error);
        res.status(500).json({ message: 'An error occurred while fetching provider details' });
    }
};

// Get user profile by ID with proper visibility controls
exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const viewerId = req.user ? req.user.id : null;

        const user = await User.findById(id)
            .populate('clients', 'firstName lastName profilePicture role')
            .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -jwtSecret');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get profile with proper visibility controls
        const profile = await user.getProfileForViewer(req.user?.role, viewerId);

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'An error occurred while fetching user profile' });
    }
};

// Link Telegram account
exports.linkTelegramAccount = async (req, res) => {
    try {
        const { telegramId, verificationCode } = req.body;

        // Verify the code
        const user = await User.findOne({
            telegramVerificationCode: verificationCode,
            telegramVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Link Telegram account
        user.telegramId = telegramId;
        user.telegramVerificationCode = undefined;
        user.telegramVerificationExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Telegram account linked successfully' });
    } catch (error) {
        console.error('Error linking Telegram account:', error);
        res.status(500).json({ message: 'An error occurred while linking Telegram account' });
    }
};

// Deactivate account
exports.deactivateAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
        console.error('Error deactivating account:', error);
        res.status(500).json({ message: 'An error occurred while deactivating account' });
    }
};

// Get provider's availability slots
exports.getProviderAvailability = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        // Get provider's working hours
        const provider = await User.findById(providerId);
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Parse date and get working hours for that day of week
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-based (Monday = 0, Sunday = 6)

        const dayAvailability = provider.availability.find(a => a.dayOfWeek === dayIndex);
        if (!dayAvailability || !dayAvailability.isAvailable) {
            return res.status(200).json({
                message: 'Provider is not available on this day',
                availableSlots: []
            });
        }

        let availableSlots = [];

        // Check if the provider has time slots defined
        if (Array.isArray(dayAvailability.timeSlots) && dayAvailability.timeSlots.length > 0) {
            // For each time slot, generate available appointment slots
            for (const timeSlot of dayAvailability.timeSlots) {
                const slots = await generateTimeSlots(
                    requestedDate,
                    timeSlot.startTime,
                    timeSlot.endTime,
                    providerId
                );
                availableSlots = [...availableSlots, ...slots];
            }
        } else {
            // Fallback to old format
            availableSlots = await generateTimeSlots(
                requestedDate,
                dayAvailability.startTime,
                dayAvailability.endTime,
                providerId
            );
        }

        res.status(200).json({
            availableSlots,
            workingHours: Array.isArray(dayAvailability.timeSlots) ?
                dayAvailability.timeSlots :
                { start: dayAvailability.startTime, end: dayAvailability.endTime }
        });
    } catch (error) {
        console.error('Error fetching provider availability:', error);
        res.status(500).json({ message: 'An error occurred while fetching provider availability' });
    }
};

// Helper function to generate time slots
async function generateTimeSlots(date, startTimeStr, endTimeStr, providerId) {
    // Parse start and end times
    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Generate slots at 15-minute intervals
    const slots = [];
    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
        const slotEnd = new Date(currentSlot);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30); // Default 30-min slots

        if (slotEnd <= endTime) {
            slots.push({
                start: new Date(currentSlot),
                end: new Date(slotEnd)
            });
        }

        currentSlot.setMinutes(currentSlot.getMinutes() + 15); // Move to next 15-min interval
    }

    // Remove slots that already have appointments
    const bookedAppointments = await Appointment.find({
        provider: providerId,
        dateTime: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999))
        },
        status: { $in: ['scheduled', 'pending-provider-confirmation'] }
    });

    // Check for conflicts with each potential slot
    return slots.filter(slot => {
        return !bookedAppointments.some(appointment => {
            const apptStart = new Date(appointment.dateTime);
            const apptEnd = appointment.endTime ||
                new Date(apptStart.getTime() + (appointment.duration || 30) * 60000);

            // Check if there's an overlap
            return (
                (slot.start < apptEnd && slot.end > apptStart) || // Slot overlaps with appointment
                (apptStart < slot.end && apptEnd > slot.start)    // Appointment overlaps with slot
            );
        });
    });
}

// Add achievement to user
exports.addAchievement = async (req, res) => {
    try {
        const { achievementData } = req.body;
        
        if (!achievementData || !achievementData.id || !achievementData.name) {
            return res.status(400).json({ message: 'Achievement data is required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const added = user.addAchievement(achievementData);
        if (!added) {
            return res.status(409).json({ message: 'Achievement already exists' });
        }

        await user.save();

        res.status(200).json({
            message: 'Achievement added successfully',
            achievements: user.achievements
        });
    } catch (error) {
        console.error('Error adding achievement:', error);
        res.status(500).json({ message: 'An error occurred while adding achievement' });
    }
};

// Earn achievement
exports.earnAchievement = async (req, res) => {
    try {
        const { achievementId } = req.params;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const earned = user.earnAchievement(achievementId);
        if (!earned) {
            return res.status(400).json({ message: 'Achievement not found or already earned' });
        }

        await user.save();

        res.status(200).json({
            message: 'Achievement earned successfully',
            achievement: user.achievements.find(a => a.id === achievementId)
        });
    } catch (error) {
        console.error('Error earning achievement:', error);
        res.status(500).json({ message: 'An error occurred while earning achievement' });
    }
};

// Get user achievements
exports.getUserAchievements = async (req, res) => {
    try {
        const { id } = req.params;
        const targetUserId = id || req.user.id;
        
        const user = await User.findById(targetUserId).select('achievements firstName lastName role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            achievements: {
                all: user.achievements,
                earned: user.getEarnedAchievements(),
                unearned: user.getUnEarnedAchievements()
            }
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ message: 'An error occurred while fetching achievements' });
    }
};

// Add client to provider
exports.addClient = async (req, res) => {
    try {
        const { clientId } = req.body;
        
        if (!clientId) {
            return res.status(400).json({ message: 'Client ID is required' });
        }

        const provider = await User.findById(req.user.id);
        if (!provider || provider.role !== 'provider') {
            return res.status(403).json({ message: 'Only providers can add clients' });
        }

        // Verify client exists
        const client = await User.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const added = provider.addClient(clientId);
        if (!added) {
            return res.status(409).json({ message: 'Client already exists or invalid operation' });
        }

        await provider.save();

        // Award mentor achievement if this is the first client
        if (provider.clients.length === 1) {
            provider.earnAchievement('first_client');
            await provider.save();
        }

        res.status(200).json({
            message: 'Client added successfully',
            clients: provider.clients
        });
    } catch (error) {
        console.error('Error adding client:', error);
        res.status(500).json({ message: 'An error occurred while adding client' });
    }
};

// Remove client from provider
exports.removeClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        
        const provider = await User.findById(req.user.id);
        if (!provider || provider.role !== 'provider') {
            return res.status(403).json({ message: 'Only providers can remove clients' });
        }

        const removed = provider.removeClient(clientId);
        if (!removed) {
            return res.status(404).json({ message: 'Client not found in your list' });
        }

        await provider.save();

        res.status(200).json({
            message: 'Client removed successfully',
            clients: provider.clients
        });
    } catch (error) {
        console.error('Error removing client:', error);
        res.status(500).json({ message: 'An error occurred while removing client' });
    }
};

// Get provider's clients
exports.getProviderClients = async (req, res) => {
    try {
        const { id } = req.params;
        const targetProviderId = id || req.user.id;
        
        const provider = await User.findById(targetProviderId)
            .populate('clients', 'firstName lastName profilePicture email phone')
            .select('firstName lastName clients role');
            
        if (!provider || provider.role !== 'provider') {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Only allow providers to see their own clients, or admins
        if (req.user.role !== 'admin' && req.user.id !== targetProviderId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json({
            provider: {
                id: provider._id,
                firstName: provider.firstName,
                lastName: provider.lastName
            },
            clients: provider.clients
        });
    } catch (error) {
        console.error('Error fetching provider clients:', error);
        res.status(500).json({ message: 'An error occurred while fetching clients' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'An error occurred while changing password' });
    }
};