// src/pages/BorrowedBooks.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
    FaBookOpen,
    FaCalendarAlt,
    FaExclamationTriangle,
    FaUndo,
    FaSearch,
    FaRedo,
    FaSpinner,
    FaMoneyBillWave,     // ← added
    FaCheckCircle,        // ← added
} from 'react-icons/fa';

export default function BorrowedBooks() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({}); // { borrowId: true }
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!user) return;
        fetchBorrows();
    }, [user]);

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/borrows/my');
            const data = res.data?.data || res.data?.borrows || res.data || [];
            setBorrows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load borrowed books:', err);
            setError(err.response?.data?.message || 'Failed to load your borrowed books. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (borrowId, bookTitle) => {
        if (!window.confirm(`Are you sure you want to return "${bookTitle || 'this book'}"?`)) return;

        try {
            setActionLoading((prev) => ({ ...prev, [borrowId]: true }));
            await api.put(`/borrows/${borrowId}/return`);
            setSuccessMsg(`"${bookTitle || 'Book'}" returned successfully!`);
            setTimeout(() => setSuccessMsg(''), 4000);
            // Refresh list
            fetchBorrows();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to return book');
            console.error(err);
        } finally {
            setActionLoading((prev) => ({ ...prev, [borrowId]: false }));
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <p className="text-xl text-gray-600">Please login to view your borrowed books</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Borrowed Books</h1>
                <div className="flex gap-4">
                    <button
                        onClick={fetchBorrows}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                        Refresh
                    </button>
                    <button
                        onClick={() => navigate('/books')}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        <FaSearch size={16} />
                        Browse More
                    </button>
                </div>
            </div>

            {/* Messages */}
            {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg shadow-sm">
                    {successMsg}
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={fetchBorrows}
                        className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FaRedo size={14} /> Retry
                    </button>
                </div>
            )}

            {/* Loading / Empty / Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <FaSpinner className="animate-spin text-indigo-600 text-6xl mb-4" />
                    <p className="text-gray-600 text-lg">Loading your borrowed books...</p>
                </div>
            ) : borrows.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                    <FaBookOpen className="mx-auto text-8xl text-gray-300 mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        You haven't borrowed any books yet
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Start exploring our collection and borrow your favorite books!
                    </p>
                    <button
                        onClick={() => navigate('/books')}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-medium shadow-md hover:shadow-lg transition-all"
                    >
                        Browse Available Books
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {borrows.map((borrow) => {
                        const isOverdue = borrow.status === 'borrowed' && new Date(borrow.dueDate) < new Date();
                        const daysOverdue = isOverdue
                            ? Math.floor((new Date() - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24))
                            : 0;

                        return (
                            <div
                                key={borrow._id}
                                className={`bg-white rounded-xl shadow-md overflow-hidden border ${isOverdue ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                                    } hover:shadow-lg transition-all duration-200`}
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                        {borrow.book?.title || 'Unknown Book'}
                                    </h3>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        {borrow.book?.author || 'Author unknown'}
                                    </p>

                                    <div className="space-y-3 text-sm text-gray-700">
                                        <p className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-500" />
                                            Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-500" />
                                            Due:{' '}
                                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                                {new Date(borrow.dueDate).toLocaleDateString()}
                                            </span>
                                        </p>

                                        {isOverdue && (
                                            <p className="flex items-center gap-2 text-red-600 font-medium">
                                                <FaExclamationTriangle />
                                                Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
                                            </p>
                                        )}

                                        {borrow.fine > 0 && (
                                            <p className="flex items-center gap-2 text-red-600 font-medium">
                                                <FaMoneyBillWave />
                                                Fine: ETB {borrow.fine.toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    {borrow.status === 'borrowed' && (
                                        <button
                                            onClick={() => handleReturn(borrow._id, borrow.book?.title)}
                                            disabled={actionLoading[borrow._id]}
                                            className={`mt-6 w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-sm ${actionLoading[borrow._id]
                                                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                        >
                                            {actionLoading[borrow._id] ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUndo />
                                                    Return Book
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {borrow.status === 'returned' && (
                                        <div className="mt-6 text-center text-green-600 font-medium flex items-center justify-center gap-2">
                                            <FaCheckCircle />
                                            Returned on {new Date(borrow.returnDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}