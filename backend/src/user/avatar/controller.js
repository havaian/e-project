const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../model'); // Import user model from parent directory

/**
 * Upload profile photo/avatar using user ID as filename
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

        // Get file extension from original file
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        
        // Validate file extension
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowedTypes.includes(fileExtension)) {
            // Remove uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false,
                message: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' 
            });
        }

        // Create new filename using user ID
        const newFileName = `${userId}${fileExtension}`;
        const avatarsDir = path.join(__dirname, '../../../uploads/avatars');
        const newFilePath = path.join(avatarsDir, newFileName);

        // Ensure avatars directory exists
        if (!fs.existsSync(avatarsDir)) {
            fs.mkdirSync(avatarsDir, { recursive: true });
        }

        // Remove existing avatar files for this user (any extension)
        const existingFiles = fs.readdirSync(avatarsDir).filter(file => 
            file.startsWith(`${userId}.`) && allowedTypes.includes(path.extname(file).toLowerCase())
        );
        
        existingFiles.forEach(file => {
            try {
                fs.unlinkSync(path.join(avatarsDir, file));
                console.log('Removed old avatar file:', file);
            } catch (deleteError) {
                console.error('Error deleting old avatar:', deleteError);
            }
        });

        // Move uploaded file to new location with user ID as filename
        fs.renameSync(req.file.path, newFilePath);

        // Update user's profile picture URL
        const profilePictureUrl = `/uploads/avatars/${newFileName}`;
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
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
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
 * Serve avatar files
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAvatar = async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Basic filename validation to prevent directory traversal attacks
        if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid filename' 
            });
        }

        // Validate file extension for security
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const fileExtension = path.extname(filename).toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ 
                success: false,
                message: 'File type not allowed' 
            });
        }

        // Construct full file path
        const avatarPath = path.join(__dirname, '../../../uploads/avatars/', filename);
        
        // Check if file exists
        if (!fs.existsSync(avatarPath)) {
            return res.status(404).json({ 
                success: false,
                message: 'Avatar not found' 
            });
        }

        // Get file stats for additional validation
        const stats = fs.statSync(avatarPath);
        
        // Prevent serving directories (extra security)
        if (stats.isDirectory()) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid file request' 
            });
        }

        // Optional: Check file size limit (e.g., 2MB max)
        const maxFileSize = 2 * 1024 * 1024; // 2MB
        if (stats.size > maxFileSize) {
            return res.status(400).json({ 
                success: false,
                message: 'File too large'
            });
        }

        // Handle conditional requests (If-None-Match, If-Modified-Since)
        const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
        const lastModified = stats.mtime.toUTCString();
        
        // Check If-None-Match header
        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end(); // Not modified
        }
        
        // Check If-Modified-Since header
        if (req.headers['if-modified-since'] && 
            new Date(req.headers['if-modified-since']) >= stats.mtime) {
            return res.status(304).end(); // Not modified
        }

        // Set appropriate content type based on file extension
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        const contentType = contentTypes[fileExtension] || 'application/octet-stream';
        
        // Set cache headers - 1 day cache with proper validation
        res.set({
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Cache-Control': 'public, max-age=86400, must-revalidate', // 1 day cache
            'ETag': etag,
            'Last-Modified': lastModified,
            'Vary': 'Accept-Encoding' // Handle compression variations
        });

        // Send the file
        res.sendFile(avatarPath);
        
    } catch (error) {
        console.error('Error serving avatar:', error);
        res.status(500).json({ 
            success: false,
            message: 'An error occurred while serving avatar',
            error: error.message 
        });
    }
};

/**
 * Get user's current avatar
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 */
exports.getUserAvatar = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate user ID format
        if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const avatarsDir = path.join(__dirname, '../../../uploads/avatars');
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        
        // Find avatar file for this user
        let avatarFile = null;
        for (const ext of allowedExtensions) {
            const filename = `${userId}${ext}`;
            const filePath = path.join(avatarsDir, filename);
            if (fs.existsSync(filePath)) {
                avatarFile = filename;
                break;
            }
        }

        if (!avatarFile) {
            return res.status(404).json({
                success: false,
                message: 'Avatar not found for this user'
            });
        }

        // Redirect to the avatar file serving endpoint
        return this.getAvatar({ ...req, params: { filename: avatarFile } }, res);
        
    } catch (error) {
        console.error('Error getting user avatar:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while getting user avatar',
            error: error.message
        });
    }
};

/**
 * Remove user's avatar
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 */
exports.removeAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const avatarsDir = path.join(__dirname, '../../../uploads/avatars');
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        // Find and remove all avatar files for this user
        let removedFiles = 0;
        allowedExtensions.forEach(ext => {
            const filename = `${userId}${ext}`;
            const filePath = path.join(avatarsDir, filename);
            
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    removedFiles++;
                    console.log('Removed avatar file:', filename);
                } catch (deleteError) {
                    console.error('Error deleting avatar file:', deleteError);
                }
            }
        });

        // Update user profile to remove avatar URL
        user.profilePicture = '';
        await user.save();

        res.status(200).json({
            success: true,
            message: removedFiles > 0 ? 'Avatar removed successfully' : 'No avatar file found to remove',
            filesRemoved: removedFiles
        });

    } catch (error) {
        console.error('Error removing avatar:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while removing avatar',
            error: error.message
        });
    }
};