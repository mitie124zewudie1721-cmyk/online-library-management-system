// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// ─── Ensure upload folder exists ────────────────────────────────────────
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`[UPLOAD] Created missing folder: ${uploadDir}`.green);
}

// ─── Multer Storage Configuration ───────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Use full path for safety
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

// ─── Multer Upload Instance ─────────────────────────────────────────────
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const extname = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowed.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only JPEG, JPG, PNG and GIF images are allowed'));
    },
});

// ─── Upload Profile Picture Route ───────────────────────────────────────
/**
 * @route   POST /api/upload/profile-picture
 * @desc    Upload a single profile picture
 * @access  Public (or Private if you uncomment protect middleware)
 * @body    form-data → key: "profilePicture" (file)
 */
router.post(
    '/profile-picture',
    // protect, // ← Uncomment if only logged-in users should upload
    (req, res, next) => {
        console.log('[UPLOAD REQUEST] Profile picture upload started'.cyan);
        upload.single('profilePicture')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.error('[MULTER ERROR]'.red, err.code, err.message);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Multer upload error',
                    code: err.code,
                });
            } else if (err) {
                console.error('[UPLOAD MIDDLEWARE ERROR]'.red, err.message);
                return res.status(500).json({
                    success: false,
                    message: err.message || 'Server error during file upload',
                });
            }
            next();
        });
    },
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file received or invalid file',
                });
            }

            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

            console.log('[UPLOAD SUCCESS]'.green, 'File saved:', req.file.filename, 'URL:', imageUrl);

            res.status(200).json({
                success: true,
                message: 'Image uploaded successfully',
                imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
            });
        } catch (error) {
            console.error('[UPLOAD CRASH]'.red, error.stack || error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during upload processing',
            });
        }
    }
);

// ─── Test route to verify image is accessible ───────────────────────────
/**
 * @route   GET /api/upload/test/:filename
 * @desc    Serve uploaded image for testing/debugging
 */
router.get('/test/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/uploads', filename);

    console.log('[TEST IMAGE ACCESS]'.cyan, 'Trying to serve:', filePath);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('[TEST IMAGE ERROR]'.red, err);
            res.status(404).json({
                success: false,
                message: 'Image not found or inaccessible',
            });
        }
    });
});

module.exports = router;