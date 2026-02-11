// frontend/src/components/book/BookCard.jsx
import { Link } from 'react-router-dom';

const BookCard = ({ book, onBorrow, onEdit, onDelete }) => {
    const {
        _id,
        title,
        author,
        isbn,
        category,
        publicationYear,
        availableCopies,
        coverImage,
    } = book;

    const isAvailable = availableCopies > 0;

    return (
        <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            {/* Cover Image */}
            <div className="relative h-64 overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
                <img
                    src={coverImage || 'https://via.placeholder.com/300x450?text=Book+Cover'}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                {/* Availability overlay badge */}
                <div className="absolute top-4 right-4">
                    {isAvailable ? (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full shadow-sm">
                            {availableCopies} Available
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full shadow-sm">
                            Not Available
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {title}
                </h3>

                <p className="text-base text-gray-700 mb-1 flex items-center">
                    <span className="font-medium">Author:</span> {author}
                </p>

                <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-x-4 gap-y-1">
                    <span>ISBN: {isbn}</span>
                    <span>• {category}</span>
                    <span>• {publicationYear || 'N/A'}</span>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                        to={`/books/${_id}`}
                        className="flex-1 min-w-[120px] text-center py-3 px-5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label={`View details of ${title}`}
                    >
                        View Details
                    </Link>

                    {isAvailable && onBorrow && (
                        <button
                            onClick={() => onBorrow(book)}
                            disabled={!isAvailable}
                            className={`flex-1 min-w-[120px] py-3 px-5 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isAvailable
                                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            aria-label={`Borrow ${title}`}
                        >
                            Borrow
                        </button>
                    )}

                    {(onEdit || onDelete) && (
                        <div className="flex gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(book)}
                                    className="flex-1 sm:flex-none py-3 px-5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                    aria-label={`Edit ${title}`}
                                >
                                    Edit
                                </button>
                            )}

                            {onDelete && (
                                <button
                                    onClick={() => onDelete(_id)}
                                    className="flex-1 sm:flex-none py-3 px-5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    aria-label={`Delete ${title}`}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookCard;