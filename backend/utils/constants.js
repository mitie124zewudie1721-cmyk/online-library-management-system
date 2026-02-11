// backend/utils/constants.js

module.exports = {
    // User roles – keep in sync with User model enum
    ROLES: {
        ADMIN: 'admin',
        LIBRARIAN: 'librarian',
        MEMBER: 'member',
    },

    // Borrow period configuration
    BORROW_DURATION_DAYS: 14,          // default borrow period
    RENEWAL_ALLOWED: true,
    MAX_RENEWALS: 2,

    // Fine rules
    FINE_PER_DAY: 5,                   // currency unit per day late
    MAX_FINE_CAP: 500,                 // maximum fine per book
    FINE_GRACE_DAYS: 0,                // no grace period by default

    // Pagination defaults
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,

    // Status values (keep in sync with models)
    BORROW_STATUS: {
        BORROWED: 'borrowed',
        RETURNED: 'returned',
        OVERDUE: 'overdue',
        LOST: 'lost',
        CANCELLED: 'cancelled',
    },

    FINE_STATUS: {
        PENDING: 'pending',
        PARTIAL: 'partial',
        PAID: 'paid',
        WAIVED: 'waived',
        CANCELLED: 'cancelled',
    },

    // Error messages (centralized)
    MESSAGES: {
        UNAUTHORIZED: 'Not authorized – please log in',
        FORBIDDEN: 'Access denied – insufficient permissions',
        BOOK_NOT_FOUND: 'Book not found',
        USER_NOT_FOUND: 'User not found',
        ALREADY_BORROWED: 'You have already borrowed this book',
        NOT_AVAILABLE: 'Book is not available for borrowing',
        INVALID_TOKEN: 'Invalid or expired token',
    },

    // JWT
    JWT: {
        EXPIRES_IN: '30d',
        COOKIE_NAME: 'jwt',
        COOKIE_OPTIONS: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
        },
    },
};