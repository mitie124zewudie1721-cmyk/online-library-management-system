// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Ensure upload folder exists ────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../public/uploads'); // go up two levels from middleware folder

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`[UPLOAD] Created missing folder: ${uploadDir}`.green);
}

// ─── Storage Configuration ──────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // absolute path for safety
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

// ─── File Filter (only images) ──────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG, PNG and GIF images are allowed'), false);
    }
};

// ─── Multer Upload Instance ─────────────────────────────────────────────
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter,
});

module.exports = upload;