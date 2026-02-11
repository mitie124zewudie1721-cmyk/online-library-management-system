// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * Middleware: Protect routes
 * - Checks for valid Bearer JWT token in Authorization header
 * - Verifies token and attaches user to req.user (without password fields)
 * - Returns 401 on failure
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Extract token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1].trim();
    }

    // 2. No token → 401
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized - no token provided',
        });
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Fetch user (exclude sensitive fields)
        req.user = await User.findById(decoded.id).select(
            '-password -refreshToken -failedLoginAttempts -lastFailedLogin'
        );

        // ─── ADDED DEBUG LOG ─────────────────────────────────────────────────────
        console.log('[PROTECT DEBUG] Real DB user data:', {
            id: req.user?._id?.toString() || 'not found',
            username: req.user?.username || 'not found',
            roleRaw: req.user?.role,
            roleType: typeof req.user?.role,
            roleLength: req.user?.role ? req.user.role.length : 'missing',
            fullUserKeys: req.user ? Object.keys(req.user.toObject()) : 'no user object',
            tokenDecodedId: decoded.id,
        });
        // ──────────────────────────────────────────────────────────────────────

        // 5. User not found → 401
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized - user not found',
            });
        }

        // 6. Success → continue
        next();
    } catch (error) {
        console.error('[PROTECT MIDDLEWARE] Token verification failed:', {
            message: error.message,
            tokenPreview: token.substring(0, 20) + '...',
        });

        return res.status(401).json({
            success: false,
            message: 'Not authorized - invalid or expired token',
        });
    }
});

/**
 * Middleware: Restrict to specific roles
 * Usage: protect, authorize('admin') or authorize('admin', 'librarian')
 * - Must run AFTER protect middleware
 * - Case-insensitive + trimmed role comparison
 * - Logs denial reason for debugging
 * - Returns 403 on failure with clear message
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Safety: protect must have run first
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated - user or role missing',
            });
        }

        // Normalize user role and allowed roles
        const userRole = (req.user.role || '').trim().toLowerCase();
        const allowedRoles = roles.map(role => (role || '').trim().toLowerCase());

        // Debug log (remove in production if you want)
        console.log(`[AUTHORIZE] User: ${req.user.username || 'unknown'} | Role: "${userRole}" | Allowed: [${allowedRoles.join(', ')}]`);

        // Check if user role is in allowed list
        if (!allowedRoles.includes(userRole)) {
            console.log(`[AUTHORIZE DENIED] User role "${userRole}" not in allowed: [${allowedRoles.join(', ')}]`);
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(' or ')}. Your role: ${req.user.role || 'none'}`,
            });
        }

        // Allowed → continue
        next();
    };
};

module.exports = {
    protect,
    authorize,
};