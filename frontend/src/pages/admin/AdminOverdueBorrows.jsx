// src/pages/admin/AdminOverdueBorrows.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
    FaUser,
    FaCalendarTimes,
    FaMoneyBillWave,
    FaCheckCircle,
    FaRedoAlt,
    FaExclamationTriangle,
    FaRedo,
    FaSpinner,
} from 'react-icons/fa';

export default function AdminOverdueBorrows() {
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);

    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({}); // borrowId → true/false
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchOverdueBorrows();
    }, []);

    const fetchOverdueBorrows = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('[LIBRARIAN DEBUG] Starting fetch as user:', {
                username: currentUser?.username,
                role: currentUser?.role,
                tokenExists: !!localStorage.getItem('token'),
            });

            const res = await api.get('/borrows/overdue');

            console.log('[LIBRARIAN DEBUG] API SUCCESS:', {
                status: res.status,
                dataType: typeof res.data,
                dataKeys: Object.keys(res.data || {}),
                borrowsCount: res.data?.data?.length || res.data?.length || 0,
                firstBorrow: res.data?.data?.[0] || res.data?.[0] || 'no data',
            });

            const data = res.data?.data || res.data?.borrows || res.data || [];
            setBorrows(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[LIBRARIAN DEBUG] API FAILED:', {
                message: err.message,
                status: err.response?.status,
                responseData: err.response?.data,
                fullError: err,
            });

            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to load overdue borrows. Check console for details.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (borrowId, bookTitle) => {
        if (!window.confirm(`Mark "${bookTitle || 'this book'}" as returned?`)) return;

        try {
            setActionLoading((prev) => ({ ...prev, [borrowId]: true }));
            await api.put(`/borrows/${borrowId}/return`);
            setSuccessMsg(`"${bookTitle || 'Book'}" marked as returned successfully`);
            setTimeout(() => setSuccessMsg(''), 4000);
            fetchOverdueBorrows();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark book as returned');
            console.error('[RETURN ERROR]', err);
        } finally {
            setActionLoading((prev) => ({ ...prev, [borrowId]: false }));
        }
    };

    const handleExtend = async (borrowId, bookTitle) => {
        if (!window.confirm(`Extend due date by 5 days for "${bookTitle || 'this book'}"?`)) return;

        try {
            setActionLoading((prev) => ({ ...prev, [borrowId]: true }));
            const res = await api.put(`/borrows/${borrowId}/extend`, { days: 5 });
            setSuccessMsg(`Due date extended by 5 days for "${bookTitle || 'book'}"`);
            setTimeout(() => setSuccessMsg(''), 4000);

            // Optimistic update
            setBorrows((prev) =>
                prev.map((b) =>
                    b._id === borrowId ? { ...b, dueDate: res.data.newDueDate || b.dueDate } : b
                )
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to extend due date');
            console.error('[EXTEND ERROR]', err);
        } finally {
            setActionLoading((prev) => ({ ...prev, [borrowId]: false }));
        }
    };

    const handleMarkLost = async (borrowId, bookTitle) => {
        if (!window.confirm(`Mark "${bookTitle || 'this book'}" as LOST? This cannot be undone.`)) return;
        alert('Lost book feature is coming soon (will mark status as "lost" and apply replacement fine)');
    };

    const handleViewBorrower = (userId) => {
        if (userId) navigate(`/profile/${userId}`);
    };

    const canViewProfile = currentUser && ['admin', 'librarian'].includes(
        currentUser.role?.toLowerCase()?.trim()
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <FaCalendarTimes className="text-4xl sm:text-5xl text-red-600" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Overdue Borrows</h1>
                </div>
                <button
                    onClick={fetchOverdueBorrows}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                    Refresh
                </button>
            </div>

            {/* Success / Error Messages */}
            {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg shadow-sm">
                    {successMsg}
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={fetchOverdueBorrows}
                        className="ml-4 px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FaRedoAlt size={14} /> Retry
                    </button>
                </div>
            )}

            {/* Loading / Empty / Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <FaSpinner className="animate-spin text-indigo-600 text-6xl mb-4" />
                    <p className="text-gray-600 text-lg">Loading overdue records...</p>
                </div>
            ) : borrows.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                    <FaCalendarTimes className="mx-auto text-8xl text-gray-300 mb-6" />
                    <h2 className="text-3xl font-semibold text-gray-700 mb-4">No Overdue Borrows</h2>
                    <p className="text-gray-600 max-w-md mx-auto text-lg">
                        All borrowed books are currently within their due dates or have been returned.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Book
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Borrower
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Borrow Date
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Days Overdue
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Fine
                                </th>
                                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {borrows.map((borrow) => {
                                const daysOverdue =
                                    borrow.daysOverdue ??
                                    Math.max(0, Math.floor((new Date() - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24)));

                                const isHighOverdue = daysOverdue > 14;
                                const isMediumOverdue = daysOverdue > 7 && daysOverdue <= 14;

                                return (
                                    <tr key={borrow._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                {borrow.book?.title || 'Unknown Book'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {borrow.book?.author || '—'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {borrow.user?.name || borrow.user?.username || 'Unknown'}
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(borrow.borrowDate).toLocaleDateString()}
                                        </td>

                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(borrow.dueDate).toLocaleDateString()}
                                        </td>

                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            <span
                                                className={`font-bold text-base ${isHighOverdue ? 'text-red-600' : isMediumOverdue ? 'text-orange-600' : 'text-yellow-600'
                                                    }`}
                                            >
                                                {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            {borrow.fine > 0 ? (
                                                <span className="font-bold text-red-600">ETB {borrow.fine.toFixed(2)}</span>
                                            ) : (
                                                <span className="text-gray-500">ETB 0.00</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                                {/* Return */}
                                                <button
                                                    onClick={() => handleReturn(borrow._id, borrow.book?.title)}
                                                    disabled={actionLoading[borrow._id]}
                                                    className={`p-2.5 rounded-full text-green-600 hover:bg-green-50 transition focus:outline-none focus:ring-2 focus:ring-green-500 ${actionLoading[borrow._id] ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    title="Mark as returned"
                                                >
                                                    <FaCheckCircle size={20} />
                                                </button>

                                                {/* Extend */}
                                                <button
                                                    onClick={() => handleExtend(borrow._id, borrow.book?.title)}
                                                    disabled={actionLoading[borrow._id]}
                                                    className={`p-2.5 rounded-full text-blue-600 hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${actionLoading[borrow._id] ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    title="Extend due date by 5 days"
                                                >
                                                    <FaRedoAlt size={20} />
                                                </button>

                                                {/* Lost */}
                                                <button
                                                    onClick={() => handleMarkLost(borrow._id, borrow.book?.title)}
                                                    disabled={actionLoading[borrow._id]}
                                                    className={`p-2.5 rounded-full text-red-600 hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-500 ${actionLoading[borrow._id] ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    title="Mark as lost"
                                                >
                                                    <FaMoneyBillWave size={20} />
                                                </button>

                                                {/* View Profile */}
                                                {canViewProfile && borrow.user?._id && (
                                                    <button
                                                        onClick={() => handleViewBorrower(borrow.user._id)}
                                                        className="p-2.5 rounded-full text-indigo-600 hover:bg-indigo-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        title="View borrower profile"
                                                    >
                                                        <FaUser size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}