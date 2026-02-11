// backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // If status code was not already set, default to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',

        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;