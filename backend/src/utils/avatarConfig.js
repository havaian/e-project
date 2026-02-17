// backend/src/utils/avatarConfig.js
const multer = require('multer');
const path = require('path');
const { PATHS: UP, ensureDir: ED } = require('./uploadPaths');

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, ED(UP.avatars));
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
        'image/jpg',
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