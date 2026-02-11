// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for the user
 * @param {string} id - User ID (_id from MongoDB)
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },                           // payload: only user ID (you can add more if needed)
        process.env.JWT_SECRET,           // secret key from .env
        {
            expiresIn: process.env.JWT_EXPIRE || '30d',  // default 30 days
        }
    );
};

/**
 * Optional: Generate refresh token (longer lived)
 * Used if you implement refresh token rotation
 */
const generateRefreshToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '90d' } // e.g. 90 days
    );
};

module.exports = {
    generateToken,
    generateRefreshToken,   // optional – only if you want refresh tokens
};