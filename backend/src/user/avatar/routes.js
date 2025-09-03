const express = require('express');
const router = express.Router();
const avatarController = require('./controller');
const { authenticateUser } = require('../../auth');
// Import the avatar upload configuration
const avatarUpload = require('../../utils/avatarConfig');

/**
 * @route POST /api/users/avatars/upload-photo
 * @desc Upload profile photo using user ID as filename
 * @access Private
 */
router.post('/upload-photo', 
    authenticateUser, 
    avatarUpload.single('photo'), 
    avatarController.uploadProfilePhoto
);

/**
 * @route GET /api/users/avatars/:filename
 * @desc Serve avatar files by filename
 * @access Public
 */
router.get('/:filename', avatarController.getAvatar);

/**
 * @route GET /api/users/avatars/:userId/avatar
 * @desc Get user's avatar by user ID (finds the file automatically)
 * @access Public
 */
router.get('/:userId/avatar', avatarController.getUserAvatar);

/**
 * @route DELETE /api/users/avatars/
 * @desc Remove current user's avatar
 * @access Private
 */
router.delete('/', authenticateUser, avatarController.removeAvatar);

/**
 * @route POST /api/users/avatars/generate-avatar  
 * @desc Generate avatar for client using initials/external service
 * @access Private
 */
router.post('/generate-avatar',
    authenticateUser,
    avatarController.generateAvatar
);

module.exports = router;