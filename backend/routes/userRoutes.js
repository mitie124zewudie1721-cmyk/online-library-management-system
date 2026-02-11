// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser,
  requestProfileUpdate,     // Member / Librarian / Admin submits update request
  approveOrRejectUpdate,    // Admin only approves/rejects
  getPendingUpdates,        // Admin + Librarian can view pending list
  changePassword,           // Any logged-in user can change own password
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// ─── SELF ACCESS ROUTES (any authenticated user) ───────────────────────────────

/**
 * @route   GET /api/users/me
 * @desc    Get current logged-in user's own profile
 * @access  Private – any authenticated user
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   PUT /api/users/me
 * @desc    Update own profile (limited fields for non-admin)
 * @access  Private – authenticated user (self only)
 */
router.put('/me', protect, updateUser); // controller should restrict fields for non-admin

/**
 * @route   PUT /api/users/change-password
 * @desc    Change own password (requires current password)
 * @access  Private – authenticated user (self only)
 * @body    { currentPassword, newPassword }
 */
router.put('/change-password', protect, changePassword);

// ─── PROFILE UPDATE REQUEST (pending approval) ────────────────────────────────

/**
 * @route   PUT /api/users/request-update
 * @desc    Submit request to update own profile (pending admin approval)
 * @access  Private – any logged-in user (member, librarian, admin)
 */
router.put('/request-update', protect, requestProfileUpdate);

// ─── PENDING UPDATES & APPROVAL ───────────────────────────────────────────────

/**
 * @route   GET /api/users/pending-updates
 * @desc    Get list of users with pending profile updates
 * @access  Private – Admin + Librarian (view only)
 */
router.get('/pending-updates', protect, authorize('admin', 'librarian'), getPendingUpdates);

/**
 * @route   PUT /api/users/:userId/approve-update
 * @desc    Approve or reject a pending profile update request
 * @access  Private – Admin only (librarian cannot approve/reject)
 * @body    { action: "approve" | "reject" }
 */
router.put('/:userId/approve-update', protect, authorize('admin'), approveOrRejectUpdate);

// ─── USER BY ID ROUTES ─────────────────────────────────────────────────────────

/**
 * @route   GET /api/users/:id
 * @desc    Get any user's profile by ID
 * @access  Private – admin, librarian, or the user themselves
 */
router.get('/:id', protect, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Directly update any user profile (full access)
 * @access  Private – Admin only
 */
router.put('/:id', protect, authorize('admin'), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Permanently delete a user
 * @access  Private – Admin only
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

// ─── FULL USER LIST ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/users
 * @desc    Get list of all users
 * @access  Private – Admin + Librarian (read-only for librarian)
 */
router.get('/', protect, authorize('admin', 'librarian'), getAllUsers);

module.exports = router;