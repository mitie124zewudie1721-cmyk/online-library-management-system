// src/pages/admin/AdminPendingUpdates.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    FaCheck,
    FaTimes,
    FaSync,
    FaSpinner,
    FaExclamationTriangle,
    FaUserCircle,
    FaInfoCircle,
    FaCheckCircle,
} from 'react-icons/fa';

export default function AdminPendingUpdates() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchPendingUpdates();
    }, []);

    const fetchPendingUpdates = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccessMsg('');
            const res = await api.get('/users/pending-updates');
            setPendingUsers(res.data.data || res.data || []);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Failed to load pending profile updates';
            setError(errMsg);
            console.error('Pending updates fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        const actionText = action === 'approve' ? 'approve' : 'reject';

        if (!window.confirm(`Are you sure you want to ${actionText} this profile update request?`)) {
            return;
        }

        setActionLoading(userId);
        setError(null);
        setSuccessMsg('');

        try {
            const res = await api.put(`/users/${userId}/approve-update`, { action });
            setSuccessMsg(res.data.message || `Update request ${actionText}d successfully!`);
            fetchPendingUpdates();
        } catch (err) {
            const errMsg = err.response?.data?.message || `Failed to ${action} update request`;
            setError(errMsg);
            console.error(`Failed to ${action} update:`, err);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <FaUserCircle className="text-indigo-600" /> Pending Profile Updates
                        </h1>
                        <p className="text-gray-600 flex items-center gap-2">
                            <FaInfoCircle className="text-indigo-500" />
                            Review and approve/reject user profile change requests
                        </p>
                    </div>
                    <button
                        onClick={fetchPendingUpdates}
                        disabled={loading}
                        className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                    >
                        <FaSync className="mr-2" size={18} />
                        Refresh List
                    </button>
                </div>

                {/* Messages */}
                {successMsg && (
                    <div className="mb-8 p-5 bg-green-50 border-l-4 border-green-600 text-green-800 rounded-lg flex items-center gap-4 shadow-sm">
                        <FaCheckCircle className="text-2xl flex-shrink-0" />
                        <p className="font-medium">{successMsg}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-600 text-red-800 rounded-lg flex items-center gap-4 shadow-sm">
                        <FaExclamationTriangle className="text-2xl flex-shrink-0" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-indigo-600 text-6xl mb-4" />
                        <p className="text-gray-700 text-lg font-medium">Loading pending requests...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && pendingUsers.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <FaCheckCircle className="text-8xl text-green-300 mx-auto mb-8" />
                        <h2 className="text-3xl font-semibold text-gray-700 mb-4">
                            No Pending Requests
                        </h2>
                        <p className="text-lg text-gray-600 max-w-lg mx-auto">
                            All profile update requests have been reviewed and processed.
                        </p>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && pendingUsers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Pending Changes (Old → New / Kept)
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Requested At
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {pendingUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            {/* User */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <img
                                                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random&size=128`}
                                                            alt=""
                                                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Unknown' }}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-base font-medium text-gray-900">{user.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Pending Changes - Show ALL submitted fields */}
                                            <td className="px-6 py-5">
                                                <div className="text-sm text-gray-700 font-medium mb-2">
                                                    {user.pendingFields?.length || 0} field{user.pendingFields?.length !== 1 ? 's' : ''} submitted
                                                </div>

                                                {user.pendingFields?.length > 0 && (
                                                    <>
                                                        <div className="text-xs text-gray-600 mb-2">
                                                            <strong>Submitted fields:</strong> {user.pendingFields.join(', ')}
                                                        </div>

                                                        <div className="mt-3 text-xs text-gray-500">
                                                            <strong>Field Status (Old → New / Kept):</strong>
                                                            <ul className="list-disc pl-5 mt-1 space-y-2">
                                                                {Object.entries(user.pendingUpdate || {}).map(([field, newValue]) => {
                                                                    const oldValue = user.pendingOldValues?.[field] ?? '(current value not captured)';
                                                                    const isChanged = oldValue !== newValue;

                                                                    return (
                                                                        <li key={field} className="flex flex-col">
                                                                            <span className="font-medium text-gray-800">{field}:</span>
                                                                            {isChanged ? (
                                                                                <span className="text-gray-600">
                                                                                    {oldValue} → <span className="text-green-700 font-medium">{newValue || '(empty)'}</span>
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-500 italic">
                                                                                    kept as <span className="font-medium">{oldValue}</span> (unchanged)
                                                                                </span>
                                                                            )}
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    </>
                                                )}

                                                {!user.pendingFields?.length && (
                                                    <div className="text-sm text-gray-500 italic">
                                                        No fields submitted for update
                                                    </div>
                                                )}
                                            </td>

                                            {/* Requested At */}
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">
                                                {user.updateRequestedAt
                                                    ? new Date(user.updateRequestedAt).toLocaleString()
                                                    : '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-5 text-center whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center justify-center gap-6">
                                                    <button
                                                        onClick={() => handleAction(user._id, 'approve')}
                                                        disabled={actionLoading === user._id}
                                                        className={`p-3 rounded-full transition-colors ${actionLoading === user._id
                                                                ? 'bg-gray-200 cursor-wait text-gray-400'
                                                                : 'text-green-600 hover:bg-green-50 hover:text-green-800'
                                                            }`}
                                                        title="Approve this update request"
                                                    >
                                                        <FaCheck size={22} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleAction(user._id, 'reject')}
                                                        disabled={actionLoading === user._id}
                                                        className={`p-3 rounded-full transition-colors ${actionLoading === user._id
                                                                ? 'bg-gray-200 cursor-wait text-gray-400'
                                                                : 'text-red-600 hover:bg-red-50 hover:text-red-800'
                                                            }`}
                                                        title="Reject this update request"
                                                    >
                                                        <FaTimes size={22} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}