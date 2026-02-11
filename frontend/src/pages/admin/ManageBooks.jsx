// src/pages/admin/ManageBooks.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBook } from 'react-icons/fa';

export default function ManageBooks() {
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null); // track which book is being deleted
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/books');
            const bookList = res.data.data || res.data || [];
            setBooks(bookList);
            setFilteredBooks(bookList);
        } catch (err) {
            setError('Failed to load books. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Search filter
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredBooks(books);
            return;
        }

        const term = searchTerm.toLowerCase();
        const results = books.filter(book =>
            book.title?.toLowerCase().includes(term) ||
            book.author?.toLowerCase().includes(term) ||
            book.isbn?.includes(term)
        );

        setFilteredBooks(results);
    }, [searchTerm, books]);

    // Delete book with confirmation
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) {
            return;
        }

        try {
            setDeletingId(id);
            await api.delete(`/books/${id}`);
            setBooks(prev => prev.filter(b => b._id !== id));
            setFilteredBooks(prev => prev.filter(b => b._id !== id));
            setSuccessMsg(`"${title}" deleted successfully`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete book');
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <FaBook className="text-3xl text-indigo-600" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Books</h1>
                </div>

                <button
                    onClick={() => navigate('/add-book')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                    <FaPlus size={18} />
                    Add New Book
                </button>
            </div>

            {/* Messages */}
            {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg">
                    {successMsg}
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="relative mb-8 max-w-xl">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by title, author or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
            </div>

            {/* Loading / Error / Empty */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                    <p className="ml-4 text-gray-600 text-lg">Loading books...</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm">
                    <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-xl">
                        {searchTerm ? 'No matching books found' : 'No books in the library yet'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => navigate('/add-book')}
                            className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <FaPlus className="mr-2" /> Add your first book
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Author
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    ISBN
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Copies
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredBooks.map(book => (
                                <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                            {book.title}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{book.author}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 font-mono">{book.isbn}</td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                                        {book.availableCopies || 0} / {book.totalCopies || 1}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium">
                                        <div className="flex items-center justify-center gap-5">
                                            <button
                                                onClick={() => navigate(`/edit-book/${book._id}`)}
                                                className="text-indigo-600 hover:text-indigo-900 transition-colors text-xl"
                                                title="Edit book"
                                                aria-label={`Edit ${book.title}`}
                                            >
                                                <FaEdit />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(book._id, book.title)}
                                                disabled={deletingId === book._id}
                                                className={`text-red-600 hover:text-red-900 transition-colors text-xl ${deletingId === book._id ? 'opacity-50 cursor-wait' : ''
                                                    }`}
                                                title="Delete book"
                                                aria-label={`Delete ${book.title}`}
                                            >
                                                {deletingId === book._id ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-red-600"></div>
                                                ) : (
                                                    <FaTrash />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}