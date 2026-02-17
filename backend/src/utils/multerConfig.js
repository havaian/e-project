// backend/src/utils/multerConfig.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PATHS, ensureDir } = require('./uploadPaths');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ensureDir(PATHS.documents));
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, images, Word documents, Excel spreadsheets, and text files are allowed.'), false);
    }
};

const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;