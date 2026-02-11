// src/pages/EditBook.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function EditBook() {
    const { id } = useParams(); // book ID from URL
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publicationYear: '',
        totalCopies: 1,
        availableCopies: 1,
        coverImage: '',
        description: '',
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch book data on mount
    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/books/${id}`);
                const book = res.data.data || res.data;

                setFormData({
                    title: book.title || '',
                    author: book.author || '',
                    isbn: book.isbn || '',
                    category: book.category?._id || book.category || '',
                    publicationYear: book.publicationYear || '',
                    totalCopies: book.totalCopies || 1,
                    availableCopies: book.availableCopies || 1,
                    coverImage: book.coverImage || '',
                    description: book.description || '',
                });
            } catch (err) {
                setError('Failed to load book details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Submit updated book
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await api.put(`/books/${id}`, formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/manage-books');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update book');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Book</h1>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-green-700">Book updated successfully! Redirecting...</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Author */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* ISBN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                    <input
                        type="text"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Publication Year */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                    <input
                        type="number"
                        name="publicationYear"
                        value={formData.publicationYear}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Copies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
                        <input
                            type="number"
                            name="totalCopies"
                            value={formData.totalCopies}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies</label>
                        <input
                            type="number"
                            name="availableCopies"
                            value={formData.availableCopies}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Cover Image URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                    <input
                        type="url"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        placeholder="https://example.com/cover.jpg"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`flex-1 py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md ${submitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/manage-books')}
                        className="flex-1 py-3 px-6 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}