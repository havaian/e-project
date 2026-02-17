// backend/src/course/uploadConfig.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PATHS, ensureDir } = require('../utils/uploadPaths');

// ── Video upload (100 MB limit) ──────────────────────────────────
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, ensureDir(PATHS.videos)),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`)
    }
});

const videoFileFilter = (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid video type'), false);
};

exports.videoUpload = multer({
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// ── Material upload (5 MB limit) ─────────────────────────────────
const materialStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, ensureDir(PATHS.materials)),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`)
    }
});

const materialFileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

exports.materialUpload = multer({
    storage: materialStorage,
    fileFilter: materialFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 5 MB
});