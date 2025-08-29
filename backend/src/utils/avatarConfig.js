// backend/src/utils/avatarConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Separate avatar uploads from documents
        const uploadDir = path.join(__dirname, '../../uploads/avatars');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate filename: userId-timestamp.extension
        const userId = req.user.id;
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const uniqueFilename = `${userId}-${timestamp}${extension}`;
        cb(null, uniqueFilename);
    }
});

// File filter for avatars (only images)
const avatarFileFilter = (req, file, cb) => {
    // Only allow image types for avatars
    const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed for avatars.'), false);
    }
};

// Avatar size limits (smaller than documents)
const avatarLimits = {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
};

// Initialize multer for avatar uploads
const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: avatarLimits
});

module.exports = avatarUpload;

// backend/src/user/controller.js - Add this method to the existing controller

/**
 * Upload profile photo/avatar
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            // Remove uploaded file if user not found
            if (req.file && req.file.path) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old profile picture file if it exists
        if (user.profilePicture && user.profilePicture.startsWith('/uploads/avatars/')) {
            const oldFilePath = path.join(__dirname, '../../', user.profilePicture);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                    console.log('Old profile picture deleted:', oldFilePath);
                } catch (deleteError) {
                    console.error('Error deleting old profile picture:', deleteError);
                    // Don't fail the upload if we can't delete the old file
                }
            }
        }

        // Update user's profile picture URL
        const profilePictureUrl = `/uploads/avatars/${req.file.filename}`;
        user.profilePicture = profilePictureUrl;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully',
            profilePicture: profilePictureUrl,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        // Remove uploaded file if there's an error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (deleteError) {
                console.error('Error cleaning up uploaded file:', deleteError);
            }
        }

        console.error('Error uploading profile photo:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while uploading profile photo',
            error: error.message
        });
    }
};

/**
 * Generate avatar for client using initials or external service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate avatar URL using initials and a color
        const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

        // Use different avatar generation services based on preference
        const avatarServices = [
            // UI Avatars (free, simple)
            `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=3b82f6&color=ffffff&format=png`,

            // DiceBear (more variety, also free)
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + user.lastName)}&backgroundColor=3b82f6&textColor=ffffff`,

            // Gravatar-style (based on email hash)
            // `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(user.email.toLowerCase().trim()).digest('hex')}?s=200&d=identicon`
        ];

        // For clients, we'll use the first service (UI Avatars)
        const generatedAvatarUrl = avatarServices[0];

        // Update user's profile picture
        user.profilePicture = generatedAvatarUrl;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar generated successfully',
            profilePicture: generatedAvatarUrl,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error('Error generating avatar:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while generating avatar',
            error: error.message
        });
    }
};