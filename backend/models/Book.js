// backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Book title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        author: {
            type: String,
            required: [true, 'Author name is required'],
            trim: true,
            maxlength: [100, 'Author name cannot exceed 100 characters'],
        },
        isbn: {
            type: String,
            required: [true, 'ISBN is required'],
            unique: true, // ✅ creates index automatically
            trim: true,
            validate: {
                validator: function (v) {
                    return /^(?:\d{10}|\d{13})$/.test(v); // ISBN-10 or ISBN-13
                },
                message: (props) => `${props.value} is not a valid ISBN (10 or 13 digits)`,
            },
        },
        category: {
            type: String,
            enum: [
                'Fiction',
                'Non-Fiction',
                'Science',
                'Technology',
                'History',
                'Biography',
                'Children',
                'Poetry',
                'Other',
            ],
            required: [true, 'Category is required'],
            default: 'Other',
        },
        publicationYear: {
            type: Number,
            required: [true, 'Publication year is required'],
            min: [1000, 'Publication year must be after 1000'],
            max: [new Date().getFullYear() + 2, 'Publication year cannot be in the future'],
        },
        totalCopies: {
            type: Number,
            required: [true, 'Total copies is required'],
            min: [1, 'At least one copy is required'],
        },
        availableCopies: {
            type: Number,
            required: [true, 'Available copies is required'],
            min: [0, 'Available copies cannot be negative'],
        },
        coverImage: {
            type: String,
            default: 'https://via.placeholder.com/300x450?text=Book+Cover',
            trim: true,
        },
        description: {
            type: String,
            maxlength: [1500, 'Description cannot exceed 1500 characters'],
            trim: true,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Added by user is required'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ----------------------------
// Virtual Fields
// ----------------------------
bookSchema.virtual('isAvailable').get(function () {
    return this.availableCopies > 0;
});

// ----------------------------
// Pre-save Hook
// ----------------------------
bookSchema.pre('save', function () {
    if (this.availableCopies > this.totalCopies) {
        this.availableCopies = this.totalCopies;
    }
    // synchronous, no next() needed
});

// ----------------------------
// Indexes for Performance
// ----------------------------
// isbn: unique already indexed
bookSchema.index({ title: 'text', author: 'text' }); // text search
bookSchema.index({ category: 1 });
bookSchema.index({ publicationYear: 1 });
bookSchema.index({ addedBy: 1 });

// ----------------------------
// Export Model
// ----------------------------
module.exports = mongoose.model('Book', bookSchema);
