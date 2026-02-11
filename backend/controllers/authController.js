// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

/**
 * Generate short-lived access token
 */
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generate long-lived refresh token
 */
const generateRefreshToken = (userId) => {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    return jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
};

/**
 * @desc    Register new user (supports optional profile picture)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    // req.body is parsed by multer
    const { name, username, password, email, phone, bio, role = 'member' } = req.body;

    // Handle uploaded file (optional)
    let profilePicture = null;
    if (req.file) {
        profilePicture = `/uploads/${req.file.filename}`;
    }

    // Basic validation
    if (!name?.trim()) {
        res.status(400);
        throw new Error('Name is required');
    }
    if (!username?.trim()) {
        res.status(400);
        throw new Error('Username is required');
    }
    if (!password || password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Block reserved admin usernames (add more if needed)
    const reservedUsernames = ['mitiku', 'mitiku1', 'admin', 'superadmin'];
    if (reservedUsernames.includes(normalizedUsername)) {
        res.status(403);
        throw new Error('This username is reserved. Contact system administrator.');
    }

    // IMPORTANT: STRICTLY limit roles — ignore anything else sent by client
    let allowedRole = 'member'; // default
    if (role === 'librarian') {
        allowedRole = 'librarian';
    } else if (role !== 'member') {
        // If someone tries to send "admin" or anything invalid → reject or default
        res.status(403);
        throw new Error('Only "member" or "librarian" roles are allowed during registration.');
    }

    // Double-check: never allow admin role
    if (role === 'admin') {
        res.status(403);
        throw new Error('Cannot register as admin. Contact system administrator.');
    }

    // Check existing username
    const userExists = await User.findOne({ username: normalizedUsername });
    if (userExists) {
        res.status(400);
        throw new Error('Username already taken');
    }

    // Optional: email uniqueness check
    if (email?.trim()) {
        const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
        if (emailExists) {
            res.status(400);
            throw new Error('Email already in use');
        }
    }

    // Create user with STRICTLY allowed role
    const user = await User.create({
        name: name.trim(),
        username: normalizedUsername,
        password, // hashed via pre-save hook
        email: email ? email.trim().toLowerCase() : undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        profilePicture,
        role: allowedRole, // only member or librarian
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            accessToken,
            refreshToken,
        },
    });
});

/**
 * @desc    Login user (username + password)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
        res.status(400);
        throw new Error('Username and password are required');
    }

    const normalizedUsername = username.trim().toLowerCase();
    console.log(`[LOGIN ATTEMPT] Username: ${normalizedUsername}`);

    // Find user with password
    const user = await User.findOne({ username: normalizedUsername }).select('+password');
    if (!user) {
        console.log(`[LOGIN] User not found: ${normalizedUsername}`);
        res.status(401);
        throw new Error('Invalid username or password');
    }

    console.log(`[LOGIN] User found: ${user.username}, role: ${user.role}`);

    // Check lockout
    if (user.failedLoginAttempts >= 5 && Date.now() - user.lastFailedLogin < 15 * 60 * 1000) {
        console.log(`[LOGIN] Account locked for ${user.username}`);
        res.status(429);
        throw new Error('Too many failed attempts. Try again in 15 minutes.');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        await User.updateOne(
            { _id: user._id },
            { $inc: { failedLoginAttempts: 1 }, $set: { lastFailedLogin: new Date() } }
        );
        console.log(`[LOGIN] Password mismatch for ${user.username}`);
        res.status(401);
        throw new Error('Invalid username or password');
    }

    // Success: reset lockout & update lastLogin
    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                failedLoginAttempts: 0,
                lastLogin: new Date(),
            },
        }
    );

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`[LOGIN SUCCESS] ${user.username} logged in`);

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            username: user.username,
            role: user.role,
            isActive: user.isActive,
            accessToken,
            refreshToken,
        },
    });
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        '-password -refreshToken -__v -failedLoginAttempts -lastFailedLogin'
    );

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        success: true,
        data: user,
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(401);
        throw new Error('Refresh token required');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            res.status(403);
            throw new Error('Invalid or expired refresh token');
        }

        const newAccessToken = generateAccessToken(user._id);

        res.json({
            success: true,
            data: { accessToken: newAccessToken },
        });
    } catch (err) {
        console.error('Refresh token error:', err.message);
        res.status(403);
        throw new Error('Invalid or expired refresh token');
    }
});

/**
 * @desc    Logout (invalidate refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    if (req.user?._id) {
        await User.updateOne({ _id: req.user._id }, { refreshToken: null });
        console.log(`[LOGOUT] User ${req.user.username || req.user._id} logged out`);
    }

    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
    register,
    login,
    getMe,
    refreshToken,
    logout,
};