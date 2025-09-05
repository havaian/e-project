const User = require('./model');
const { validateUserInput } = require('../utils/validators');
const { NotificationService } = require('../notification');
const fs = require('fs');
const path = require('path');
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
            'sessionFee', 'backgroundInfo', 'sessionDuration',
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
            specializations, // Updated to match frontend filter name
            minExperience,
            maxSessionFee,
            language,
            sortBy = 'experience',
            order = 'desc',
            page = 1,
            limit = 12,
            // New filter parameters for price range and name search
            name,
            minPrice,
            maxPrice,
            // New sorting parameters
            experience: experienceSort,
            price: priceSort,
            rating: ratingSort
        } = req.query;

        // Build filter query - ONLY complete profiles
        const filter = {
            role: 'provider',
            isActive: true,
            isVerified: true,
            isProfileComplete: true  // Only show complete profiles
        };

        // Updated filter logic
        if (specializations) {
            filter.specializations = { $in: [new RegExp(specializations, 'i')] };
        }

        if (name) {
            filter.$or = [
                { firstName: { $regex: name, $options: 'i' } },
                { lastName: { $regex: name, $options: 'i' } }
            ];
        }

        if (minExperience) {
            filter.experience = { $gte: parseInt(minExperience) };
        }

        // Updated price filtering to support both old and new parameter names
        const minPriceFilter = minPrice || maxSessionFee; // Support both parameter names for backward compatibility
        const maxPriceFilter = maxPrice;
        
        if (minPriceFilter || maxPriceFilter) {
            filter.sessionFee = {};
            if (minPriceFilter) {
                filter.sessionFee.$gte = parseFloat(minPriceFilter);
            }
            if (maxPriceFilter) {
                filter.sessionFee.$lte = parseFloat(maxPriceFilter);
            }
        }

        if (language) {
            filter.languages = { $in: [new RegExp(language, 'i')] };
        }

        // Build sort options - Updated to handle new sorting system
        const sortOptions = {};
        
        // Handle new individual sort parameters
        if (experienceSort) {
            sortOptions.experience = experienceSort === 'asc' ? 1 : -1;
        } else if (priceSort) {
            sortOptions.sessionFee = priceSort === 'asc' ? 1 : -1;
        } else if (ratingSort) {
            sortOptions.averageRating = ratingSort === 'asc' ? 1 : -1;
        } else {
            // Handle legacy sorting system
            const validSortFields = ['experience', 'sessionFee', 'createdAt', 'firstName'];
            
            if (validSortFields.includes(sortBy)) {
                sortOptions[sortBy] = order === 'asc' ? 1 : -1;
            } else {
                sortOptions.experience = -1; // Default sort
            }
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

        // Add review data for each provider
        const Review = require('../review/model'); // Import Review model
        
        const providersWithReviews = await Promise.all(
            providers.map(async (provider) => {
                try {
                    // Get review statistics for this provider
                    const reviewStats = await Review.getProviderAverageRating(provider._id);
                    
                    // Convert provider to object and add review data
                    const providerObj = provider.toObject();
                    providerObj.reviewStats = {
                        averageRating: reviewStats.averageRating || 0,
                        totalReviews: reviewStats.totalReviews || 0
                    };
                    
                    return providerObj;
                } catch (reviewError) {
                    console.error('Error fetching reviews for provider:', provider._id, reviewError);
                    // Return provider with default review stats if review fetch fails
                    const providerObj = provider.toObject();
                    providerObj.reviewStats = {
                        averageRating: 0,
                        totalReviews: 0
                    };
                    return providerObj;
                }
            })
        );

        // Sort by rating if rating sort is specified (since we added review data after the initial query)
        if (ratingSort) {
            providersWithReviews.sort((a, b) => {
                const aRating = a.reviewStats.averageRating;
                const bRating = b.reviewStats.averageRating;
                return ratingSort === 'asc' ? aRating - bRating : bRating - aRating;
            });
        }

        res.status(200).json({
            providers: providersWithReviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            filters: { 
                specializations, 
                minExperience, 
                maxSessionFee, 
                language, 
                sortBy, 
                order,
                // Include new filter parameters in response
                name,
                minPrice,
                maxPrice
            }
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

/**
 * Update provider availability (calendar-style)
 * @route PATCH /api/users/me/availability
 * @access Private (Provider only)
 */
exports.updateProviderAvailability = async (req, res) => {
    try {
        const { availability } = req.body;
        const userId = req.user.id;

        // Validate that user is a provider
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.role !== 'provider') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only providers can set availability' 
            });
        }

        // Validate availability data
        if (!Array.isArray(availability) || availability.length !== 7) {
            return res.status(400).json({ 
                success: false, 
                message: 'Availability must be an array of 7 days' 
            });
        }

        // Validate each day's data
        const daysOfWeek = [1, 2, 3, 4, 5, 6, 7]; // Monday to Sunday
        const processedAvailability = [];

        for (const dayData of availability) {
            const { dayOfWeek, isAvailable, timeSlots } = dayData;

            // Validate dayOfWeek
            if (!daysOfWeek.includes(dayOfWeek)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Invalid dayOfWeek: ${dayOfWeek}. Must be 1-7 (Monday-Sunday)` 
                });
            }

            // Process day data
            const processedDay = {
                dayOfWeek,
                isAvailable: Boolean(isAvailable)
            };

            if (isAvailable && Array.isArray(timeSlots) && timeSlots.length > 0) {
                // Validate and process time slots
                processedDay.timeSlots = [];

                for (const slot of timeSlots) {
                    const { startTime, endTime } = slot;

                    // Validate time format (HH:MM)
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Invalid time format. Use HH:MM (24-hour format)' 
                        });
                    }

                    // Validate that end time is after start time
                    const [startHour, startMinute] = startTime.split(':').map(Number);
                    const [endHour, endMinute] = endTime.split(':').map(Number);

                    const startMinutes = startHour * 60 + startMinute;
                    const endMinutes = endHour * 60 + endMinute;

                    if (endMinutes <= startMinutes) {
                        return res.status(400).json({ 
                            success: false, 
                            message: `End time must be after start time for ${getDayName(dayOfWeek)}` 
                        });
                    }

                    // Minimum slot duration check (15 minutes)
                    if (endMinutes - startMinutes < 15) {
                        return res.status(400).json({ 
                            success: false, 
                            message: `Minimum time slot duration is 15 minutes for ${getDayName(dayOfWeek)}` 
                        });
                    }

                    processedDay.timeSlots.push({
                        startTime,
                        endTime
                    });
                }

                // Sort time slots by start time
                processedDay.timeSlots.sort((a, b) => {
                    const aMinutes = convertTimeToMinutes(a.startTime);
                    const bMinutes = convertTimeToMinutes(b.startTime);
                    return aMinutes - bMinutes;
                });

                // Check for overlapping time slots
                for (let i = 0; i < processedDay.timeSlots.length - 1; i++) {
                    const current = processedDay.timeSlots[i];
                    const next = processedDay.timeSlots[i + 1];
                    
                    const currentEnd = convertTimeToMinutes(current.endTime);
                    const nextStart = convertTimeToMinutes(next.startTime);

                    if (currentEnd > nextStart) {
                        return res.status(400).json({ 
                            success: false, 
                            message: `Overlapping time slots detected for ${getDayName(dayOfWeek)}` 
                        });
                    }
                }
            } else {
                // No time slots for unavailable days
                processedDay.timeSlots = [];
            }

            processedAvailability.push(processedDay);
        }

        // Sort availability by dayOfWeek
        processedAvailability.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

        // Update user's availability
        user.availability = processedAvailability;
        
        // Update profile completion if this improves it
        await user.calculateProfileCompletion();
        await user.save();

        // Log the update for audit purposes
        console.log(`Provider ${user.firstName} ${user.lastName} (${user._id}) updated availability:`, 
            processedAvailability);

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully',
            availability: processedAvailability,
            profileCompletionPercentage: user.profileCompletionPercentage
        });

    } catch (error) {
        console.error('Error updating provider availability:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while updating availability',
            error: error.message 
        });
    }
};

/**
 * Get provider availability for calendar view
 * @route GET /api/users/me/availability
 * @access Private (Provider only)
 */
exports.getProviderAvailability = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.role !== 'provider') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only providers have availability settings' 
            });
        }

        // Return availability with default structure if not set
        const availability = user.availability || getDefaultAvailability();

        res.status(200).json({
            success: true,
            availability,
            totalWeeklyHours: calculateTotalWeeklyHours(availability)
        });

    } catch (error) {
        console.error('Error fetching provider availability:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while fetching availability',
            error: error.message 
        });
    }
};

// Helper functions
const getDayName = (dayOfWeek) => {
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayNames[dayOfWeek] || 'Unknown';
};

const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

const getDefaultAvailability = () => {
    return [
        { dayOfWeek: 1, isAvailable: false, timeSlots: [] }, // Monday
        { dayOfWeek: 2, isAvailable: false, timeSlots: [] }, // Tuesday
        { dayOfWeek: 3, isAvailable: false, timeSlots: [] }, // Wednesday
        { dayOfWeek: 4, isAvailable: false, timeSlots: [] }, // Thursday
        { dayOfWeek: 5, isAvailable: false, timeSlots: [] }, // Friday
        { dayOfWeek: 6, isAvailable: false, timeSlots: [] }, // Saturday
        { dayOfWeek: 7, isAvailable: false, timeSlots: [] }  // Sunday
    ];
};

const calculateTotalWeeklyHours = (availability) => {
    let totalMinutes = 0;
    
    availability.forEach(day => {
        if (day.isAvailable && day.timeSlots) {
            day.timeSlots.forEach(slot => {
                const startMinutes = convertTimeToMinutes(slot.startTime);
                const endMinutes = convertTimeToMinutes(slot.endTime);
                totalMinutes += (endMinutes - startMinutes);
            });
        }
    });
    
    return Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal place
};