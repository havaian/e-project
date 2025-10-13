// backend/src/utils/avatarConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create upload directory with proper error handling
const createUploadDir = (dir) => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
        }
    } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
        // Fallback to a writable directory
        return path.join(process.cwd(), 'temp', 'avatars');
    }
    return dir;
};

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = createUploadDir(path.join(__dirname, '../../../uploads/avatars'));
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