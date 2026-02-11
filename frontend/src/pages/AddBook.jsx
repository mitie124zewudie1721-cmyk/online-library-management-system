// src/pages/AddBook.jsx
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FaBook, FaUser, FaCalendar, FaCopy, FaImage } from 'react-icons/fa';

const AddBook = () => {
    const { isAdmin, isLibrarian } = useContext(AuthContext);
    const navigate = useNavigate();

    // ALL HOOKS FIRST – must be called every render
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        category: 'Fiction',
        publicationYear: '',
        totalCopies: 1,          // required in model
        availableCopies: 1,      // required in model
        coverImage: '',
        description: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Redirect logic AFTER hooks – safe & ESLint-compliant
    if (!isAdmin && !isLibrarian) {
        navigate('/dashboard');
        return null; // prevents form render for unauthorized users
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Convert number fields to actual numbers
        if (name === 'publicationYear' || name === 'totalCopies' || name === 'availableCopies') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value),
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Client-side validation
        if (!formData.title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }
        if (!formData.author.trim()) {
            setError('Author is required');
            setLoading(false);
            return;
        }
        if (!formData.isbn.trim()) {
            setError('ISBN is required');
            setLoading(false);
            return;
        }
        if (!formData.publicationYear) {
            setError('Publication year is required');
            setLoading(false);
            return;
        }
        if (formData.totalCopies < 1) {
            setError('Total copies must be at least 1');
            setLoading(false);
            return;
        }
        if (formData.availableCopies < 0 || formData.availableCopies > formData.totalCopies) {
            setError('Available copies must be between 0 and total copies');
            setLoading(false);
            return;
        }

        try {
            await api.post('/books', formData);
            setSuccess('Book added successfully!');
            setTimeout(() => navigate('/books'), 2000);
        } catch (err) {
            const backendError = err.response?.data;
            let errorMsg = 'Failed to add book. Please check all fields.';

            if (backendError?.message) {
                errorMsg = backendError.message;
            }

            if (backendError?.details) {
                errorMsg += '\nDetails: ' + backendError.details;
            }

            if (backendError?.errors) {
                errorMsg = backendError.errors.join('\n');
            }

            setError(errorMsg);
            console.log('Add Book Full Error:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">Add New Book</h1>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg whitespace-pre-line">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-white/40 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <div className="relative">
                            <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Book title"
                            />
                        </div>
                    </div>

                    {/* Author */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Author name"
                            />
                        </div>
                    </div>

                    {/* ISBN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                        <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="ISBN number (10 or 13 digits, no dashes)"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="Science">Science</option>
                            <option value="Technology">Technology</option>
                            <option value="History">History</option>
                            <option value="Children">Children</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Publication Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publication Year</label>
                        <div className="relative">
                            <FaCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                name="publicationYear"
                                value={formData.publicationYear}
                                onChange={handleChange}
                                required
                                min="1000"
                                max={new Date().getFullYear() + 1}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Year"
                            />
                        </div>
                    </div>

                    {/* Total Copies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Copies</label>
                        <div className="relative">
                            <FaCopy className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                name="totalCopies"
                                value={formData.totalCopies}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Total number of copies in library"
                            />
                        </div>
                    </div>

                    {/* Available Copies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Copies</label>
                        <div className="relative">
                            <FaCopy className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                name="availableCopies"
                                value={formData.availableCopies}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Currently available copies"
                            />
                        </div>
                    </div>

                    {/* Cover Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL (optional)</label>
                        <div className="relative">
                            <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="url"
                                name="coverImage"
                                value={formData.coverImage}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="https://example.com/book-cover.jpg"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="Brief description of the book"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Adding Book...' : 'Add Book'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBook;