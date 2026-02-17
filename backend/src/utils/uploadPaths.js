// backend/src/utils/uploadPaths.js
//
// Single source of truth for all upload directory paths.
//
// Uses process.cwd() instead of __dirname-relative paths.
// process.cwd() always returns the working directory the Node
// process was started from — in Docker that is the WORKDIR
// set in the Dockerfile (/usr/src/app), which is exactly where
// the uploads volume is mounted.
//
// __dirname-relative paths like '../../../uploads' are fragile:
// the number of '..' required changes depending on how deeply
// nested the file is, and are easy to get wrong silently.

const path = require('path');
const fs = require('fs');

// Root of the uploads directory — matches docker-compose mount:
//   ./uploads/:/usr/src/app/uploads:rw,Z
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

const PATHS = {
    root: UPLOAD_ROOT,
    avatars: path.join(UPLOAD_ROOT, 'avatars'),
    documents: path.join(UPLOAD_ROOT, 'documents'),
    videos: path.join(UPLOAD_ROOT, 'videos'),
    materials: path.join(UPLOAD_ROOT, 'course-materials'),
};

/**
 * Ensures a directory exists, creates it recursively if not.
 * Call this before writing any file.
 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }
    return dir;
}

// Pre-create all directories on startup so they're ready immediately
Object.values(PATHS).forEach(ensureDir);

module.exports = { PATHS, ensureDir };