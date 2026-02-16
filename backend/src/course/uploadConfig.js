// backend/src/course/uploadConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// ─── Video upload config ────────────────────────────────────────────────────

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../../uploads/videos');
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, unique);
    }
});

const videoFilter = (req, file, cb) => {
    const allowed = [
        'video/mp4',
        'video/webm',
        'video/quicktime',   // .mov
        'video/x-msvideo',   // .avi
        'video/x-matroska'   // .mkv
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, WebM, MOV, AVI and MKV are allowed.'), false);
    }
};

const videoUpload = multer({
    storage: videoStorage,
    fileFilter: videoFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// ─── Course material upload config ─────────────────────────────────────────

const materialStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../../uploads/course-materials');
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, unique);
    }
});

const materialFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type for course material.'), false);
    }
};

const materialUpload = multer({
    storage: materialStorage,
    fileFilter: materialFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

module.exports = { videoUpload, materialUpload };