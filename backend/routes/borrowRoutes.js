// backend/routes/borrowRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Borrow = require('../models/Borrow');
const {
    borrowBook,
    returnBook,
    getMyBorrows,
    getOverdueBorrows,
    getAllBorrows,
    getBorrowById,
    extendDueDate,
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

// ─── PUBLIC / USER ROUTES (any authenticated user) ───────────────────────────────

/**
 * @route   POST /api/borrows
 * @desc    Borrow a book
 * @access  Private - any logged-in user (member, librarian, admin)
 */
router.post('/', protect, asyncHandler(async (req, res, next) => {
    console.log(`[BORROW] New borrow attempt by ${req.user.username} (${req.user.role}) for book ${req.body.bookId}`);
    next();
}), borrowBook);

/**
 * @route   PUT /api/borrows/:borrowId/return
 * @desc    Return a borrowed book
 * @access  Private - book owner OR staff (admin or librarian)
 */
router.put('/:borrowId/return', protect, returnBook);

/**
 * @route   GET /api/borrows/my
 * @desc    Get current user's borrow history
 * @access  Private - any logged-in user
 */
router.get('/my', protect, getMyBorrows);

// ─── STAFF ROUTES (admin + librarian) ────────────────────────────────────────────

/**
 * @route   GET /api/borrows/overdue
 * @desc    Get all overdue borrows
 * @access  Private - admin or librarian
 */
router.get('/overdue', protect, authorize('admin', 'librarian'), asyncHandler(async (req, res, next) => {
    console.log(`[OVERDUE] Accessed by ${req.user.username} (${req.user.role})`);
    next();
}), getOverdueBorrows);

/**
 * @route   PUT /api/borrows/:id/extend
 * @desc    Extend due date of a borrow (default +5 days)
 * @access  Private - admin or librarian
 * @body    { days?: number } (optional, default 5)
 */
router.put('/:id/extend', protect, authorize('admin', 'librarian'), extendDueDate);

// ─── ADMIN-ONLY ROUTES ───────────────────────────────────────────────────────────

/**
 * @route   GET /api/borrows
 * @desc    Get ALL borrow records (full admin view)
 * @access  Private - admin only
 */
router.get('/', protect, authorize('admin'), getAllBorrows);

// ─── MIXED ACCESS ROUTES ─────────────────────────────────────────────────────────

/**
 * @route   GET /api/borrows/:id
 * @desc    Get single borrow details
 * @access  Private - admin, librarian, or the borrow owner
 */
router.get('/:id', protect, getBorrowById);

/**
 * @route   GET /api/borrows/user/:userId
 * @desc    Get borrow history for a specific user
 * @access  Private - admin, librarian, or the user themselves
 */
router.get('/user/:userId', protect, asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const isStaff = ['admin', 'librarian'].includes(req.user.role);
    const isSelf = userId === req.user._id.toString();

    console.log(`[BORROW USER HISTORY] Accessed by ${req.user.username} (${req.user.role}) for user ${userId}`);

    if (!isStaff && !isSelf) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view this user\'s borrow history',
        });
    }

    const borrows = await Borrow.find({ user: userId })
        .populate('book', 'title author isbn coverImage')
        .sort({ borrowDate: -1 });

    res.json({
        success: true,
        count: borrows.length,
        data: borrows,
    });
}));

// ─── 404 for unknown borrow routes ──────────────────────────────────────────────
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Borrow route not found: ${req.method} ${req.originalUrl}`,
    });
});

module.exports = router;