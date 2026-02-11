// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
    register,
    login,
    getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// ─── Multer Setup (only for registration with profile picture) ────────
// In backend/routes/authRoutes.js (multer part)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');   // ← this must match the folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
});

// ─── Public routes ──────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (supports profile picture upload)
 * @access  Public
 */
router.post('/register', upload.single('profilePicture'), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

// ─── Protected routes ───────────────────────────────────────────────────

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', protect, getMe);

module.exports = router;