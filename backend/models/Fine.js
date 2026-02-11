// backend/models/Fine.js  (optional but recommended)
const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
    {
        borrow: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Borrow',
            required: true,
            unique: true, // One fine record per borrow
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Fine amount cannot be negative'],
        },
        paidAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'waived', 'cancelled'],
            default: 'pending',
        },
        dueDate: {
            type: Date,
            required: true,
        },
        paymentDate: Date,
        notes: {
            type: String,
            maxlength: [500],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: remaining amount to pay
fineSchema.virtual('remaining').get(function () {
    return Math.max(0, this.amount - this.paidAmount);
});

fineSchema.virtual('isOverdue').get(function () {
    return this.status === 'pending' && this.dueDate < new Date();
});

module.exports = mongoose.model('Fine', fineSchema);