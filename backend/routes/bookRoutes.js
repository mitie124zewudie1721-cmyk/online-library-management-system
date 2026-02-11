// backend/routes/bookRoutes.js
const express = require('express');
const router = express.Router();

const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
} = require('../controllers/bookController');

const { protect, authorize } = require('../middleware/auth');

/**
 * Book Routes
 * Base path: /api/books
 *
 * Public routes: GET (list, search, single book)
 * Protected routes: POST, PUT, DELETE (staff only)
 */

// ─── Public Routes ───

/**
 * @route   GET /api/books
 * @desc    Get all books with optional search, filter, sort & pagination
 * @access  Public
 * @query   ?search=keyword (title/author/isbn)
 * @query   ?category=categoryId or name
 * @query   ?available=true/false (only available books)
 * @query   ?page=1&limit=10
 * @query   ?sort=title,-createdAt (title asc, createdAt desc)
 */
router.get('/', getAllBooks);

/**
 * @route   GET /api/books/:id
 * @desc    Get single book by ID
 * @access  Public
 */
router.get('/:id', getBookById);

// ─── Protected Routes (Admin + Librarian) ───

/**
 * @route   POST /api/books
 * @desc    Create a new book
 * @access  Private (Admin / Librarian)
 * @body    { title, author, isbn, category, copiesAvailable, coverImage?, description?, publishedYear? }
 */
router.post(
    '/',
    protect,
    authorize('admin', 'librarian'),
    createBook
);

/**
 * @route   PUT /api/books/:id
 * @desc    Update book details
 * @access  Private (Admin / Librarian)
 * @body    Partial book fields (title, author, isbn, copiesAvailable, etc.)
 */
router.put(
    '/:id',
    protect,
    authorize('admin', 'librarian'),
    updateBook
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book (permanently)
 * @access  Private (Admin only – safer than librarian)
 */
router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteBook
);

module.exports = router;