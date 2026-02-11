// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private - Admin only
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('-password -__v -refreshToken -pendingUpdate -pendingOldValues -updateRequestedAt -updateStatus')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: users.length,
        data: users,
    });
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/users/me
 * @access  Private - Any authenticated user
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password -__v -refreshToken -pendingUpdate -pendingOldValues -updateRequestedAt -updateStatus');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Private - Admin / Librarian or self
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password -__v -refreshToken -pendingUpdate -pendingOldValues -updateRequestedAt -updateStatus');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isStaff = ['admin', 'librarian'].includes(req.user.role);
    const isSelf = user._id.toString() === req.user._id.toString();

    if (!isStaff && !isSelf) {
        res.status(403);
        throw new Error('Not authorized to view this user');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * @desc    Submit request to update own profile
 * @route   PUT /api/users/request-update
 * @access  Private - Any logged-in user
 * @body    { name?, username?, email?, phone?, bio?, profilePicture? }
 */
const requestProfileUpdate = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const safeFields = ['name', 'username', 'email', 'phone', 'bio', 'profilePicture'];
    const safeUpdates = {};
    const oldValues = {};

    safeFields.forEach((field) => {
        if (updates[field] !== undefined) {
            const newVal = updates[field];
            const currentVal = user[field] ?? '';

            // Prevent changing TO a reserved username (allow keeping the same)
            if (field === 'username') {
                const normalizedNew = newVal.trim().toLowerCase();
                const reserved = ['mitiku', 'mitiku1', 'admin'];
                if (reserved.includes(normalizedNew) && normalizedNew !== user.username.toLowerCase()) {
                    res.status(403);
                    throw new Error('Cannot use reserved username');
                }
            }

            safeUpdates[field] = newVal;
            oldValues[field] = currentVal;
        }
    });

    if (Object.keys(safeUpdates).length === 0) {
        res.status(400);
        throw new Error('No fields provided for update');
    }

    // ──────────────────────────────────────────────────────────────
    // SPECIAL CASE: Admin updating own profile → apply immediately
    // ──────────────────────────────────────────────────────────────
    if (req.user.role === 'admin') {
        // Apply changes directly
        Object.assign(user, safeUpdates);

        // Clear any pending fields (just in case)
        user.pendingUpdate = new Map();
        user.pendingOldValues = new Map();
        user.updateRequestedAt = null;
        user.updateStatus = 'none'; // or you can remove this field if not needed

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Your profile has been updated successfully.',
            updatedFields: Object.keys(safeUpdates),
        });
    }

    // ──────────────────────────────────────────────────────────────
    // Normal users (member / librarian) → pending approval
    // ──────────────────────────────────────────────────────────────
    user.pendingUpdate = new Map(Object.entries(safeUpdates));
    user.pendingOldValues = new Map(Object.entries(oldValues));
    user.updateRequestedAt = new Date();
    user.updateStatus = 'pending';

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile update request submitted successfully. Waiting for admin approval.',
        pendingFields: Object.keys(safeUpdates),
    });
});

/**
 * @desc    Approve or reject pending profile update
 * @route   PUT /api/users/:userId/approve-update
 * @access  Private - Admin only
 * @body    { action: "approve" | "reject" }
 */
const approveOrRejectUpdate = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admin can approve or reject profile update requests');
    }

    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
        res.status(400);
        throw new Error('Invalid action. Use "approve" or "reject"');
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.updateStatus !== 'pending') {
        res.status(400);
        throw new Error('No pending update request found');
    }

    if (action === 'approve') {
        for (const [key, value] of user.pendingUpdate) {
            user[key] = value;
        }
        user.updateStatus = 'approved';
    } else {
        user.updateStatus = 'rejected';
    }

    user.pendingUpdate = new Map();
    user.pendingOldValues = new Map();
    user.updateRequestedAt = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: `Update request ${action}d successfully`,
        status: user.updateStatus,
    });
});

/**
 * @desc    Get users with pending profile updates
 * @route   GET /api/users/pending-updates
 * @access  Private - Admin only
 */
const getPendingUpdates = asyncHandler(async (req, res) => {
    const users = await User.find({ updateStatus: 'pending' })
        .select('name username _id pendingUpdate pendingOldValues updateRequestedAt updateStatus');

    const formattedUsers = users.map(user => {
        const userObj = user.toObject();
        return {
            ...userObj,
            pendingFields: user.pendingUpdate ? Array.from(user.pendingUpdate.keys()) : [],
            pendingUpdate: user.pendingUpdate ? Object.fromEntries(user.pendingUpdate) : null,
            pendingOldValues: user.pendingOldValues ? Object.fromEntries(user.pendingOldValues) : null,
        };
    });

    res.status(200).json({
        success: true,
        count: formattedUsers.length,
        data: formattedUsers,
    });
});

/**
 * @desc    Update user profile directly (admin/librarian)
 * @route   PUT /api/users/:id
 * @access  Private - Admin or Librarian only
 */
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent modifying the constant admin account (unless self)
    if (user.username === 'mitiku1' && req.user._id.toString() !== user._id.toString()) {
        res.status(403);
        throw new Error('Cannot modify the system administrator account');
    }

    const allowedFields = [
        'name', 'username', 'email', 'phone', 'profilePicture', 'bio',
        'role', 'isActive',
    ];

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            user[field] = req.body[field];
        }
    });

    if (req.body.role && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admin can change user roles');
    }

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
            profilePicture: updatedUser.profilePicture,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        },
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private - Admin only
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent deleting the constant admin account
    if (user.username === 'mitiku1') {
        res.status(403);
        throw new Error('Cannot delete the system administrator account');
    }

    if (user._id.toString() === req.user._id.toString()) {
        res.status(403);
        throw new Error('Cannot delete your own account');
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
});

/**
 * @desc    Change own password
 * @route   PUT /api/users/change-password
 * @access  Private - authenticated user
 * @body    { currentPassword, newPassword }
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in again with your new password.',
    });
});

module.exports = {
    getAllUsers,
    getCurrentUser,
    getUserById,
    requestProfileUpdate,
    approveOrRejectUpdate,
    getPendingUpdates,
    updateUser,
    deleteUser,
    changePassword,
};