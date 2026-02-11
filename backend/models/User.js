// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        // ─── Core Identification ───
        name: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, 'Username must be at least 3 characters'],
            maxlength: [30, 'Username cannot exceed 30 characters'],
            match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
            index: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true,
            match: [/.+\@.+\..+/, 'Please enter a valid email address'],
            index: true,
        },
        // ─── Authentication ───
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        refreshToken: {
            type: String,
            select: false,
        },
        // ─── Role & Status ───
        role: {
            type: String,
            enum: ['member', 'librarian', 'admin'],
            default: 'member',
            lowercase: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        // ─── Security ───
        failedLoginAttempts: {
            type: Number,
            default: 0,
            select: false,
        },
        lastFailedLogin: {
            type: Date,
            select: false,
        },
        lastLogin: {
            type: Date,
        },
        // ─── Profile Information ───
        profilePicture: {
            type: String,
            default: function () {
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || 'User')}&background=random&size=128`;
            },
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
            trim: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            match: [/^\+?\d{9,15}$/, 'Invalid phone number format'],
            default: '',
        },
        address: {
            type: String,
            trim: true,
            maxlength: [200],
            default: '',
        },
        membershipSince: {
            type: Date,
            default: Date.now,
        },
        // ─── Pending Profile Update (Approval Workflow) ───
        pendingUpdate: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: () => new Map(),
        },
        pendingOldValues: {           // ← NEW FIELD: stores previous values
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: () => new Map(),
        },
        updateRequestedAt: {
            type: Date,
            default: null,
        },
        updateStatus: {
            type: String,
            enum: ['none', 'pending', 'approved', 'rejected'],
            default: 'none',
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.refreshToken;
                delete ret.failedLoginAttempts;
                delete ret.lastFailedLogin;
                delete ret.__v;
                return ret;
            },
            virtuals: true,
        },
        toObject: { virtuals: true },
    }
);

// ─── Virtual Fields ───────────────────────────────────────────────────
userSchema.virtual('initials').get(function () {
    if (!this.name) return '?';
    const names = this.name.trim().split(' ');
    return (names[0][0] + (names[1] ? names[1][0] : '')).toUpperCase();
});

userSchema.virtual('isLocked').get(function () {
    return (
        this.failedLoginAttempts >= 5 &&
        this.lastFailedLogin &&
        Date.now() - this.lastFailedLogin.getTime() < 15 * 60 * 1000 // 15-minute lockout
    );
});

userSchema.virtual('membershipDurationDays').get(function () {
    if (!this.membershipSince) return 0;
    return Math.floor((Date.now() - this.membershipSince.getTime()) / (1000 * 60 * 60 * 24));
});

userSchema.virtual('pendingUpdateCount').get(function () {
    return this.pendingUpdate ? this.pendingUpdate.size : 0;
});

//─── Pre-save Hook ────────────────────────────────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Static Methods ───────────────────────────────────────────────────
userSchema.statics.findByUsername = function (username) {
    return this.findOne({ username: username.trim().toLowerCase() });
};

userSchema.statics.findActiveByRole = function (role) {
    return this.find({ role, isActive: true }).select('-password -refreshToken');
};

userSchema.statics.countMembers = function () {
    return this.countDocuments({ role: 'member', isActive: true });
};

module.exports = mongoose.model('User', userSchema);