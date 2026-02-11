// src/pages/Profile.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    FaUser,
    FaEdit,
    FaBookOpen,
    FaCalendarAlt,
    FaSyncAlt,
    FaExclamationTriangle
} from 'react-icons/fa';

export default function Profile() {
    const { user: currentUser } = useContext(AuthContext);
    const { id } = useParams(); // /profile/:id (other user) or /profile (own)
    const navigate = useNavigate();

    const isOwnProfile = !id || id === currentUser?._id;
    const targetUserId = id || currentUser?._id;

    const [profile, setProfile] = useState(null);
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!targetUserId) return;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch user profile
                const res = await api.get(`/users/${targetUserId}`);
                setProfile(res.data.data || res.data);

                // Fetch borrows (only own or staff can see full history)
                if (isOwnProfile || ['admin', 'librarian'].includes(currentUser?.role)) {
                    const borrowRes = await api.get(`/borrows/user/${targetUserId}`);
                    setBorrows(borrowRes.data.data || []);
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [targetUserId, currentUser, isOwnProfile]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        const fetch = async () => {
            try {
                const res = await api.get(`/users/${targetUserId}`);
                setProfile(res.data.data || res.data);
                if (isOwnProfile || ['admin', 'librarian'].includes(currentUser?.role)) {
                    const borrowRes = await api.get(`/borrows/user/${targetUserId}`);
                    setBorrows(borrowRes.data.data || []);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Retry failed');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg max-w-lg w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <FaExclamationTriangle className="text-red-500 text-2xl" />
                        <h2 className="text-xl font-bold text-red-700">Error</h2>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        <FaSyncAlt /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Profile not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* FIXED PROFILE PICTURE DISPLAY */}
                            <img
                                src={
                                    profile.profilePicture
                                        ? `http://localhost:5000${profile.profilePicture}`  // ← THIS IS THE KEY FIX
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random&size=128`
                                }
                                alt={`${profile.name || 'User'}'s profile`}
                                className="w-40 h-40 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random&size=128`;
                                    e.target.onerror = null; // prevent infinite loop
                                }}
                            />

                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                                <p className="text-xl text-gray-600 mb-1">@{profile.username}</p>
                                <p className="text-lg text-indigo-600 font-medium capitalize">{profile.role}</p>
                                {profile.bio && (
                                    <p className="mt-4 text-gray-700 max-w-2xl">{profile.bio}</p>
                                )}
                                {isOwnProfile && (
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                                    >
                                        <FaEdit className="mr-2" /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Borrow History – only visible to owner or staff */}
                {borrows.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-8 border-b border-gray-200">
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FaBookOpen className="text-indigo-600" /> Borrow History
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Book</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Borrowed</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Returned</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Fine</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {borrows.map((borrow) => (
                                        <tr key={borrow._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {borrow.book?.title || 'Unknown Book'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {borrow.book?.author || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {new Date(borrow.borrowDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {new Date(borrow.dueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {borrow.returnDate
                                                    ? new Date(borrow.returnDate).toLocaleDateString()
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${borrow.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                                                    borrow.status === 'returned' ? 'bg-green-100 text-green-800' :
                                                        borrow.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {borrow.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                {borrow.fine > 0 ? (
                                                    <span className="text-red-600">ETB {borrow.fine.toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-gray-500">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {borrows.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <FaBookOpen className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Borrow History</h3>
                        <p className="text-gray-600">This user has not borrowed any books yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}