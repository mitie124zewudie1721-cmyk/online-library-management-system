// backend/controllers/borrowController.js
const asyncHandler = require('express-async-handler');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { calculateFine } = require('../utils/calculateFine');

/**
 * @desc    Borrow a book
 * @route   POST /api/borrows
 * @access  Private (any authenticated user)
 * @body    { bookId: string }
 */
const borrowBook = asyncHandler(async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user._id;

    if (!bookId) {
        return res.status(400).json({ success: false, message: 'bookId is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
        return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
        return res.status(400).json({ success: false, message: 'No copies available' });
    }

    // Prevent double-borrow of same book
    const alreadyBorrowed = await Borrow.findOne({
        book: bookId,
        user: userId,
        status: 'borrowed',
    });
    if (alreadyBorrowed) {
        return res.status(400).json({ success: false, message: 'You already borrowed this book' });
    }

    // Enforce max active borrows (change limit as needed)
    const activeCount = await Borrow.countDocuments({
        user: userId,
        status: 'borrowed',
    });
    if (activeCount >= 3) {
        return res.status(400).json({ success: false, message: 'Maximum active borrows reached (3)' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
        book: bookId,
        user: userId,
        borrowDate: new Date(),
        dueDate,
    });

    // Decrease copies
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({
        success: true,
        data: borrow,
    });
});

/**
 * @desc    Return a borrowed book
 * @route   PUT /api/borrows/:borrowId/return
 * @access  Private (owner or staff)
 */
const returnBook = asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.borrowId).populate('book');
    if (!borrow) {
        return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (borrow.status === 'returned') {
        return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    // Authorization: owner or staff
    const isOwner = borrow.user.toString() === req.user._id.toString();
    const isStaff = ['admin', 'librarian'].includes(req.user.role);
    if (!isOwner && !isStaff) {
        return res.status(403).json({ success: false, message: 'Not authorized to return this book' });
    }

    borrow.returnDate = new Date();
    borrow.fine = calculateFine(borrow.dueDate, borrow.returnDate);
    borrow.status = 'returned';
    await borrow.save();

    // Restore copies
    const book = borrow.book;
    book.availableCopies += 1;
    await book.save();

    res.json({
        success: true,
        data: borrow,
    });
});

/**
 * @desc    Get current user's borrow history
 * @route   GET /api/borrows/my
 * @access  Private
 */
const getMyBorrows = asyncHandler(async (req, res) => {
    const borrows = await Borrow.find({ user: req.user._id })
        .populate('book', 'title author isbn coverImage')
        .sort({ borrowDate: -1 }); // newest first

    res.json({
        success: true,
        count: borrows.length,
        data: borrows,
    });
});

/**
 * @desc    Get all overdue borrows
 * @route   GET /api/borrows/overdue
 * @access  Private (admin / librarian)
 */
const getOverdueBorrows = asyncHandler(async (req, res) => {
    console.log(`[getOverdueBorrows] Accessed by: ${req.user.username} (${req.user.role})`);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today (timezone-safe)

    const overdue = await Borrow.find({
        status: 'borrowed',
        dueDate: { $lt: today },
    })
        .populate('book', 'title author isbn coverImage')
        .populate('user', 'name username email phone')
        .sort({ dueDate: 1 }); // earliest due first

    // Add calculated daysOverdue to each borrow (for frontend)
    const overdueWithDays = overdue.map((borrow) => {
        const daysOverdue = Math.max(
            0,
            Math.floor((today - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24))
        );
        return {
            ...borrow.toObject(),
            daysOverdue,
            isOverdue: true,
        };
    });

    res.json({
        success: true,
        count: overdue.length,
        data: overdueWithDays,
    });
});

/**
 * @desc    Get all borrow records (admin only)
 * @route   GET /api/borrows
 * @access  Private (admin only)
 */
const getAllBorrows = asyncHandler(async (req, res) => {
    const borrows = await Borrow.find()
        .populate('book', 'title author isbn coverImage')
        .populate('user', 'name username email phone')
        .sort({ borrowDate: -1 });

    res.json({
        success: true,
        count: borrows.length,
        data: borrows,
    });
});

/**
 * @desc    Get single borrow details
 * @route   GET /api/borrows/:id
 * @access  Private (owner, admin, librarian)
 */
const getBorrowById = asyncHandler(async (req, res) => {
    const borrow = await Borrow.findById(req.params.id)
        .populate('book', 'title author isbn coverImage')
        .populate('user', 'name username email phone');

    if (!borrow) {
        return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    const isOwner = borrow.user.toString() === req.user._id.toString();
    const isStaff = ['admin', 'librarian'].includes(req.user.role);

    if (!isOwner && !isStaff) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this borrow' });
    }

    res.json({
        success: true,
        data: borrow,
    });
});

/**
 * @desc    Extend due date of a borrow record (default +5 days)
 * @route   PUT /api/borrows/:id/extend
 * @access  Private - admin or librarian only
 * @body    { days?: number } (optional, default 5)
 */
const extendDueDate = asyncHandler(async (req, res) => {
    const { days = 5 } = req.body;

    if (days <= 0) {
        res.status(400);
        throw new Error('Extension days must be greater than 0');
    }

    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
        res.status(404);
        throw new Error('Borrow record not found');
    }

    if (borrow.status !== 'borrowed') {
        res.status(400);
        throw new Error('Can only extend active borrowed books');
    }

    const newDueDate = new Date(borrow.dueDate);
    newDueDate.setDate(newDueDate.getDate() + Number(days));

    borrow.dueDate = newDueDate;
    borrow.extended = true;
    borrow.extensionCount = (borrow.extensionCount || 0) + 1;

    await borrow.save();

    res.status(200).json({
        success: true,
        message: `Due date extended by ${days} day(s)`,
        newDueDate: borrow.dueDate.toISOString().split('T')[0],
        borrow,
    });
});

module.exports = {
    borrowBook,
    returnBook,
    getMyBorrows,
    getOverdueBorrows,
    getAllBorrows,
    getBorrowById,
    extendDueDate,
};