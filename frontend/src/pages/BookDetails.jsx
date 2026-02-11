// src/pages/BookDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaBook } from 'react-icons/fa';

export default function BookDetails() {
    const { id } = useParams(); // gets the :id from URL
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/books/${id}`);
                setBook(res.data.data || res.data);
                setError(null);
            } catch (err) {
                console.error('Failed to load book:', err);
                setError('Book not found or failed to load');
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <FaBook className="mx-auto text-8xl text-gray-300 mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Book Not Found</h2>
                <p className="text-gray-600 mb-8">{error || 'The requested book could not be found.'}</p>
                <button
                    onClick={() => navigate('/books')}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to All Books
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/books')}
                className="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                <FaArrowLeft />
                Back to All Books
            </button>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="md:flex">
                    {/* Cover Image */}
                    <div className="md:w-1/3">
                        {book.coverImage ? (
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-80 md:h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x600?text=No+Cover';
                                }}
                            />
                        ) : (
                            <div className="w-full h-80 md:h-full bg-gray-200 flex items-center justify-center">
                                <FaBook className="text-8xl text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Book Info */}
                    <div className="p-6 md:p-10 md:w-2/3">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>

                        <p className="text-xl text-gray-700 mb-6">
                            by <span className="font-medium">{book.author}</span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-sm text-gray-500">ISBN</p>
                                <p className="text-lg font-medium">{book.isbn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="text-lg font-medium">
                                    {book.category?.name || book.category || 'Uncategorized'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Published</p>
                                <p className="text-lg font-medium">{book.publicationYear || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Availability</p>
                                <p className={`text-lg font-bold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {book.availableCopies || 0} of {book.totalCopies || 1} copies available
                                </p>
                            </div>
                        </div>

                        {book.description && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">{book.description}</p>
                            </div>
                        )}

                        {/* Borrow Button (only if available) */}
                        {book.availableCopies > 0 ? (
                            <button
                                onClick={() => {/* Add borrow logic here later */ }}
                                className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                Borrow This Book
                            </button>
                        ) : (
                            <button
                                disabled
                                className="w-full sm:w-auto px-8 py-4 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                            >
                                Currently Unavailable
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}