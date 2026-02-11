// backend/controllers/bookController.js
const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');

/**
 * @desc    Get all books (with search, filter, pagination, sort)
 * @route   GET /api/books
 * @access  Public
 * @query   ?search=keyword (title/author/isbn)
 * @query   ?category=categoryId or name
 * @query   ?available=true/false
 * @query   ?page=1&limit=10
 * @query   ?sort=title,-createdAt
 */
const getAllBooks = asyncHandler(async (req, res) => {
    const { search, category, available, page = 1, limit = 10, sort = 'title' } = req.query;

    let query = {};

    // Search in title, author, isbn (case-insensitive)
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { isbn: { $regex: search, $options: 'i' } },
        ];
    }

    // Category filter
    if (category) {
        query.category = category; // assuming category is ObjectId or string
    }

    // Availability filter
    if (available !== undefined) {
        query.availableCopies = available === 'true' ? { $gt: 0 } : 0;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const books = await Book.find(query)
        .sort(sort) // e.g. title, -createdAt
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name'); // optional: show category name

    const total = await Book.countDocuments(query);

    res.json({
        success: true,
        count: books.length,
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        data: books,
    });
});

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id).populate('category', 'name');

    if (!book) {
        res.status(404);
        throw new Error('Book not found');
    }

    res.json({
        success: true,
        data: book,
    });
});

/**
 * @desc    Create new book
 * @route   POST /api/books
 * @access  Private (Admin / Librarian)
 */
const createBook = asyncHandler(async (req, res) => {
    // Role already checked by middleware → no need to check again

    const book = await Book.create({
        ...req.body,
        addedBy: req.user._id, // track who added it
    });

    res.status(201).json({
        success: true,
        data: book,
    });
});

/**
 * @desc    Update book details
 * @route   PUT /api/books/:id
 * @access  Private (Admin / Librarian)
 */
const updateBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
        res.status(404);
        throw new Error('Book not found');
    }

    // Allowed fields (prevent mass assignment of sensitive fields)
    const allowedFields = [
        'title',
        'author',
        'isbn',
        'category',
        'publicationYear',
        'totalCopies',
        'availableCopies',
        'coverImage',
        'description',
    ];

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            book[field] = req.body[field];
        }
    });

    // Keep availableCopies within totalCopies
    if (book.availableCopies > book.totalCopies) {
        book.availableCopies = book.totalCopies;
    }

    book.updatedBy = req.user._id; // track who updated

    const updatedBook = await book.save();

    res.json({
        success: true,
        data: updatedBook,
    });
});

/**
 * @desc    Delete a book (permanently)
 * @route   DELETE /api/books/:id
 * @access  Private (Admin only)
 */
const deleteBook = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
        res.status(404);
        throw new Error('Book not found');
    }

    await book.deleteOne();

    res.json({
        success: true,
        message: 'Book removed successfully',
    });
});

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
};