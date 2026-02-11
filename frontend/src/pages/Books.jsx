// src/pages/Books.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FaBook, FaSearch, FaArrowRight } from 'react-icons/fa';

export default function Books() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);           // always array
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all books
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get('/books');

                // Safely extract array from any response shape
                const data = res.data?.data || res.data?.books || res.data || [];
                const bookList = Array.isArray(data) ? data : [];

                setBooks(bookList);
                setFilteredBooks(bookList);
            } catch (err) {
                console.error('Failed to load books:', err);
                setError('Failed to load books. Please try again later.');
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    // Real-time search filter
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredBooks(books);
            return;
        }

        const term = searchTerm.toLowerCase();
        const results = books.filter(book =>
            book.title?.toLowerCase().includes(term) ||
            book.author?.toLowerCase().includes(term) ||
            book.isbn?.toLowerCase().includes(term)
        );

        setFilteredBooks(results);
    }, [searchTerm, books]);

    // Borrow handler (optional – calls backend)
    const handleBorrow = async (bookId, title) => {
        if (!user) {
            alert('Please login to borrow books');
            navigate('/login');
            return;
        }

        if (!window.confirm(`Borrow "${title}"?`)) return;

        try {
            await api.post('/borrows', { bookId });
            alert('Book borrowed successfully!');
            // Refresh books list (optional)
            // fetchBooks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to borrow book');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">All Available Books</h1>

                <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by title, author or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            {/* Loading / Error / Empty */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
                    <p className="ml-4 text-gray-600 text-lg">Loading books...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl text-center">
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                    <FaBook className="mx-auto text-7xl text-gray-300 mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        {searchTerm ? 'No matching books found' : 'No books available right now'}
                    </h2>
                    {searchTerm && (
                        <p className="text-gray-600 mb-6">Try a different search term</p>
                    )}
                    <button
                        onClick={() => setSearchTerm('')}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredBooks.map((book) => (
                        <div
                            key={book._id}
                            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col"
                        >
                            {/* Cover Image */}
                            <div className="h-64 bg-gray-100 relative">
                                {book.coverImage ? (
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x600?text=No+Cover';
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FaBook className="text-8xl text-gray-300" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                    {book.title}
                                </h3>

                                <p className="text-gray-600 mb-1 text-sm">
                                    {book.author}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">ISBN:</span>
                                        <span className="font-mono">{book.isbn}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-medium">Available:</span>
                                        <span className={`font-bold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {book.availableCopies || 0} / {book.totalCopies || 1}
                                        </span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => navigate(`/books/${book._id}`)}
                                        className="flex-1 py-2 px-4 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        <FaArrowRight size={16} />
                                        Details
                                    </button>

                                    <button
                                        onClick={() => handleBorrow(book._id, book.title)}
                                        disabled={book.availableCopies <= 0 || !user}
                                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${book.availableCopies > 0 && user
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                            }`}
                                    >
                                        Borrow
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}