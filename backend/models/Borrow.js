// backend/models/Borrow.js
const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: [true, 'Book reference is required'],
            index: true, // faster book lookups
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            index: true, // faster user borrows queries
        },
        borrowDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
            index: true, // fast overdue queries
        },
        returnDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['borrowed', 'returned', 'overdue', 'lost', 'cancelled'],
            default: 'borrowed',
            index: true, // very frequent filter
        },
        fine: {
            type: Number,
            default: 0,
            min: [0, 'Fine cannot be negative'],
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── VIRTUAL FIELDS (calculated, not stored) ────────────────────────

// Days overdue (timezone-safe: compares at midnight UTC)
borrowSchema.virtual('daysOverdue').get(function () {
    if (this.status !== 'borrowed' || !this.dueDate) return 0;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // midnight UTC

    const due = new Date(this.dueDate);
    due.setUTCHours(0, 0, 0, 0); // midnight UTC

    const diffTime = Math.max(0, today - due);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Formatted overdue days (e.g. "3 days overdue")
borrowSchema.virtual('daysOverdueFormatted').get(function () {
    const days = this.daysOverdue;
    return days > 0 ? `${days} day${days === 1 ? '' : 's'} overdue` : 'On time';
});

// Is currently overdue (boolean)
borrowSchema.virtual('isOverdue').get(function () {
    return this.status === 'borrowed' && this.dueDate && this.dueDate < new Date();
});

// Text description of overdue status (useful for UI)
borrowSchema.virtual('overdueStatusText').get(function () {
    if (this.status === 'returned') return 'Returned';
    if (this.status === 'lost') return 'Lost';
    if (this.status === 'cancelled') return 'Cancelled';
    if (this.isOverdue) return `Overdue by ${this.daysOverdue} day${this.daysOverdue === 1 ? '' : 's'}`;
    return 'On time';
});

// When fine started accumulating (due date + 1 day)
borrowSchema.virtual('fineStartDate').get(function () {
    if (!this.dueDate) return null;
    const fineStart = new Date(this.dueDate);
    fineStart.setDate(fineStart.getDate() + 1);
    return fineStart;
});

// ─── PRE-SAVE HOOK ──────────────────────────────────────────────────

// Automatically update status to 'overdue' when due date is passed
borrowSchema.pre('save', async function (next) {
    if (this.isModified('dueDate') || this.isModified('status') || this.isModified('returnDate')) {
        if (this.status === 'borrowed' && this.dueDate && this.dueDate < new Date()) {
            this.status = 'overdue';
            console.log(`[Borrow Hook] Auto-updated status to 'overdue' for borrow ${this._id}`);
        }
    }
    next();
});

// ─── INDEXES (critical for performance on librarian/admin queries) ────────
borrowSchema.index({ status: 1, dueDate: 1 });           // Fast overdue list
borrowSchema.index({ user: 1, status: 1 });              // My borrows per user
borrowSchema.index({ book: 1, status: 1 });              // Book availability
borrowSchema.index({ dueDate: 1 });                      // Time-based filters

// ─── OPTIONAL: Auto-populate references (uncomment when needed) ────────
/*
borrowSchema.pre(/^find/, function (next) {
  this.populate('book', 'title author isbn coverImage totalCopies availableCopies');
  this.populate('user', 'name username email phone role');
  next();
});
*/

module.exports = mongoose.model('Borrow', borrowSchema);