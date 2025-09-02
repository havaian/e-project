const express = require('express');
const router = express.Router();
const userController = require('./controller');
const { authenticateUser, authorizeRoles, preventProviderRegistration, ensureTermsAccepted } = require('../auth');
// Import the avatar upload configuration
const avatarUpload = require('../utils/avatarConfig');

if (process.env.VITE_MODULE_ACHIEVEMENTS_ENABLED === 'true') {
    /**
     * @route GET /api/users/achievements
     * @desc Get current user's achievements
     * @access Private
     */
    router.get('/achievements', authenticateUser, userController.getUserAchievements);

    /**
     * @route POST /api/users/achievements
     * @desc Add achievement to current user
     * @access Private
     */
    router.post('/achievements', authenticateUser, userController.addAchievement);

    /**
     * @route POST /api/users/achievements/:achievementId/earn
     * @desc Mark achievement as earned for current user
     * @access Private
     */
    router.post('/achievements/:achievementId/earn', authenticateUser, userController.earnAchievement);
}

/**
 * @route POST /api/users/upload-photo
 * @desc Upload profile photo (for providers primarily, but available to all users)
 * @access Private
 */
router.post('/upload-photo', 
    authenticateUser, 
    avatarUpload.single('photo'), // Use 'photo' as the field name to match frontend
    userController.uploadProfilePhoto
);

/**
 * @route POST /api/users/generate-avatar  
 * @desc Generate avatar for client using initials/external service
 * @access Private
 */
router.post('/generate-avatar',
    authenticateUser,
    userController.generateAvatar
);

/**
 * @route GET /api/users/avatars/:filename
 * @desc Serve avatar/profile picture files
 * @access Public (no authentication required for viewing avatars)
 * @security File validation, path traversal protection
 */
router.get('/avatars/:filename', userController.getAvatar);

/**
 * @route POST /api/users/register
 * @desc Register a new user (client or provider)
 * @access Public
 */
router.post('/register', preventProviderRegistration, ensureTermsAccepted, userController.registerUser);

/**
 * @route GET /api/users/verify/:token
 * @desc Verify user email
 * @access Public
 */
router.get('/verify/:token', userController.verifyEmail);

/**
 * @route POST /api/users/login
 * @desc Login user
 * @access Public
 */
router.post('/login', userController.loginUser);

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticateUser, userController.getCurrentUser);

/**
 * @route PATCH /api/users/me
 * @desc Update user profile
 * @access Private
 */
router.patch('/me', authenticateUser, userController.updateUserProfile);

/**
 * @route POST /api/users/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', authenticateUser, userController.changePassword);

/**
 * @route POST /api/users/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', userController.forgotPassword);

/**
 * @route POST /api/users/reset-password/:token
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password/:token', userController.resetPassword);

/**
 * @route POST /api/users/link-telegram
 * @desc Link Telegram account
 * @access Private
 */
router.post('/link-telegram', authenticateUser, userController.linkTelegramAccount);

/**
 * @route POST /api/users/deactivate
 * @desc Deactivate user account
 * @access Private
 */
router.post('/deactivate', authenticateUser, userController.deactivateAccount);

// ===== SPECIFIC ROUTES (MUST COME BEFORE GENERIC /:id ROUTES) =====

/**
 * @route GET /api/users/providers
 * @desc Get all providers with optional filters - UPDATED to only show complete profiles
 * @access Public
 */
router.get('/providers', userController.getProviders);

/**
 * @route GET /api/users/providers/:id
 * @desc Get provider by ID
 * @access Public
 */
router.get('/providers/:id', userController.getProviderById);

// Client Management Routes (Provider only) - MOVED BEFORE /:id

/**
 * @route POST /api/users/clients
 * @desc Add client to provider's list
 * @access Private (Provider only)
 */
router.post('/clients', 
    authenticateUser, 
    authorizeRoles(['provider']), 
    userController.addClient
);

/**
 * @route GET /api/users/clients
 * @desc Get current provider's clients
 * @access Private (Provider only)
 */
router.get('/clients', 
    authenticateUser, 
    authorizeRoles(['provider']), 
    userController.getProviderClients
);

/**
 * @route DELETE /api/users/clients/:clientId
 * @desc Remove client from provider's list
 * @access Private (Provider only)
 */
router.delete('/clients/:clientId', 
    authenticateUser, 
    authorizeRoles(['provider']), 
    userController.removeClient
);

// Include provider dashboard routes BEFORE generic /:id routes
router.use('/providers', require('./provider/routes'));

// ===== GENERIC ROUTES (MUST COME AFTER SPECIFIC ROUTES) =====

/**
 * @route GET /api/users/:id
 * @desc Get user profile by ID with proper visibility controls
 * @access Private
 */
router.get('/:id', authenticateUser, userController.getProfileById);

/**
 * @route GET /api/users/:id/achievements
 * @desc Get achievements for specific user
 * @access Private
 */
router.get('/:id/achievements', authenticateUser, userController.getUserAchievements);

/**
 * @route GET /api/users/:id/clients
 * @desc Get clients for specific provider
 * @access Private (Provider or Admin only)
 */
router.get('/:id/clients', 
    authenticateUser, 
    authorizeRoles(['provider', 'admin']), 
    userController.getProviderClients
);

module.exports = router;