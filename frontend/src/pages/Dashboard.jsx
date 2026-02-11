// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import {
    FaUserEdit,
    FaBookOpen,
    FaRocket,
    FaPlusCircle,
    FaCalendarTimes,
    FaUsersCog,
    FaEdit,
    FaUserCheck,
    FaBookReader,
} from 'react-icons/fa';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Dashboard loaded → user:', user ? user.username : 'No user');
    }, [user?._id]);

    const [stats, setStats] = useState({
        borrowed: 0,
        activeBorrows: 0,
        pendingFines: 0.00,
    });

    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        if (!user?._id) {
            setLoadingStats(false);
            return;
        }
        try {
            setLoadingStats(true);
            setError(null);
            const res = await api.get('/borrows/my');
            const borrowsArray = res.data?.data || res.data?.borrows || res.data || [];
            setStats({
                borrowed: borrowsArray.length,
                activeBorrows: borrowsArray.filter(b => b.status === 'borrowed').length,
                pendingFines: borrowsArray.reduce((sum, b) => sum + (b.fine || 0), 0),
            });
        } catch (err) {
            setError('Failed to load stats');
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [user?._id]);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-xl text-gray-600 animate-pulse flex items-center gap-4">
                        <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading dashboard...
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const userRole = (user?.role || '').trim().toLowerCase();
    const isAdmin = userRole === 'admin';
    const isLibrarian = userRole === 'librarian';
    const isStaff = isAdmin || isLibrarian;
    const isMember = !isStaff;
    const firstName = user.name ? user.name.split(' ')[0] : 'User';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                <div className="max-w-7xl mx-auto">
                    {/* Greeting */}
                    <div className="mb-12 text-center sm:text-left">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Hello, {firstName}!
                        </h1>
                        <p className="mt-2 text-xl text-gray-700">
                            {isAdmin ? 'Admin' : isLibrarian ? 'Librarian' : 'Member'} Dashboard
                        </p>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                        {/* Left - Stats Card */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 border border-gray-200 h-full flex flex-col">
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center lg:text-left">
                                    Your Stats
                                </h3>

                                {loadingStats ? (
                                    <div className="space-y-8 flex-grow">
                                        <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                                        <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                                        <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                                    </div>
                                ) : error ? (
                                    <p className="text-red-600 font-medium text-center py-8">{error}</p>
                                ) : (
                                    <div className="space-y-8 flex-grow">
                                        <div className="flex items-center gap-6 justify-center lg:justify-start">
                                            <div className="text-5xl lg:text-6xl font-extrabold text-blue-600">
                                                {stats.borrowed}
                                            </div>
                                            <div>
                                                <p className="text-lg lg:text-xl font-semibold text-gray-800">Books Borrowed</p>
                                                <p className="text-sm text-gray-500">(lifetime)</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 justify-center lg:justify-start">
                                            <div className="text-5xl lg:text-6xl font-extrabold text-green-600">
                                                {stats.activeBorrows}
                                            </div>
                                            <div>
                                                <p className="text-lg lg:text-xl font-semibold text-gray-800">Active Borrows</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 justify-center lg:justify-start">
                                            <div className="text-5xl lg:text-6xl font-extrabold text-red-600">
                                                ETB {stats.pendingFines.toFixed(2)}
                                            </div>
                                            <div>
                                                <p className="text-lg lg:text-xl font-semibold text-gray-800">Pending Fines</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Cards Grid */}
                        <div className="lg:col-span-8">
                            {/* Quick Actions – visible to ALL roles */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 border border-gray-200 mb-12 lg:mb-16">
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center lg:justify-start gap-3">
                                    <FaRocket className="text-indigo-600 text-3xl" /> Quick Actions
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                                    {/* Update Profile */}
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-indigo-50/30 to-indigo-100/30 hover:from-indigo-100/50 hover:to-indigo-200/50 border border-indigo-200 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                    >
                                        <div className="bg-indigo-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                            <FaUserEdit className="text-5xl text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                                        </div>
                                        <h4 className="text-lg lg:text-xl font-bold text-indigo-800 text-center">Update Profile</h4>
                                        <p className="text-sm text-indigo-700 text-center opacity-90 mt-1">Edit details</p>
                                    </button>

                                    {/* Browse Books */}
                                    <button
                                        onClick={() => navigate('/books')}
                                        className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-green-50/30 to-green-100/30 hover:from-green-100/50 hover:to-green-200/50 border border-green-200 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                    >
                                        <div className="bg-green-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                            <FaBookOpen className="text-5xl text-green-600 group-hover:text-green-700 transition-colors" />
                                        </div>
                                        <h4 className="text-lg lg:text-xl font-bold text-green-800 text-center">Browse Books</h4>
                                        <p className="text-sm text-green-700 text-center opacity-90 mt-1">Search books</p>
                                    </button>

                                    {/* My Borrows – only members */}
                                    {isMember && (
                                        <button
                                            onClick={() => navigate('/borrowed')}
                                            className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 to-blue-100/30 hover:from-blue-100/50 hover:to-blue-200/50 border border-blue-200 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                        >
                                            <div className="bg-blue-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                <FaBookReader className="text-5xl text-blue-600 group-hover:text-blue-700 transition-colors" />
                                            </div>
                                            <h4 className="text-lg lg:text-xl font-bold text-blue-800 text-center">My Borrows</h4>
                                            <p className="text-sm text-blue-700 text-center opacity-90 mt-1">My books</p>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Management Tools – Admin & Librarian */}
                            {isStaff && (
                                <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10 border border-gray-200">
                                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-10 flex items-center justify-center lg:justify-start gap-3">
                                        <FaUsersCog className="text-purple-600 text-3xl" /> Management Tools
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-10 lg:gap-12">
                                        {/* Add Book */}
                                        <button
                                            onClick={() => navigate('/add-book')}
                                            className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-green-50/40 to-green-100/40 hover:from-green-100/60 hover:to-green-200/60 border border-green-200 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                        >
                                            <div className="bg-green-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                <FaPlusCircle className="text-5xl text-green-600 group-hover:text-green-700 transition-colors" />
                                            </div>
                                            <h4 className="text-lg lg:text-xl font-bold text-green-800 text-center">Add Book</h4>
                                            <p className="text-sm text-green-700 text-center opacity-90 mt-1">New titles</p>
                                        </button>

                                        {/* Manage Overdue */}
                                        <button
                                            onClick={() => navigate('/admin/overdue')}
                                            className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-red-50/40 to-red-100/40 hover:from-red-100/60 hover:to-red-200/60 border border-red-200 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                        >
                                            <div className="bg-red-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                <FaCalendarTimes className="text-5xl text-red-600 group-hover:text-red-700 transition-colors" />
                                            </div>
                                            <h4 className="text-lg lg:text-xl font-bold text-red-800 text-center">Manage Overdue</h4>
                                            <p className="text-sm text-red-700 text-center opacity-90 mt-1">Late returns</p>
                                        </button>

                                        {/* Manage Users */}
                                        <button
                                            onClick={() => navigate('/admin/users')}
                                            className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-indigo-50/40 to-indigo-100/40 hover:from-indigo-100/60 hover:to-indigo-200/60 border border-indigo-200 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                        >
                                            <div className="bg-indigo-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                <FaUsersCog className="text-5xl text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                                            </div>
                                            <h4 className="text-lg lg:text-xl font-bold text-indigo-800 text-center">
                                                {isAdmin ? 'Manage Users' : 'View Users'}
                                            </h4>
                                            <p className="text-sm text-indigo-700 text-center opacity-90 mt-1">
                                                {isAdmin ? 'Edit accounts' : 'User list'}
                                            </p>
                                        </button>

                                        {/* Manage Books */}
                                        <button
                                            onClick={() => navigate('/manage-books')}
                                            className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-teal-50/40 to-teal-100/40 hover:from-teal-100/60 hover:to-teal-200/60 border border-teal-300 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                        >
                                            <div className="bg-teal-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                <FaEdit className="text-5xl text-teal-600 group-hover:text-teal-700 transition-colors" />
                                            </div>
                                            <h4 className="text-lg lg:text-xl font-bold text-teal-800 text-center">Manage Books</h4>
                                            <p className="text-sm text-teal-700 text-center opacity-90 mt-1">Edit titles</p>
                                        </button>

                                        {/* Approve/Reject Updates – only for Admin */}
                                        {isAdmin && (
                                            <button
                                                onClick={() => navigate('/admin/pending-updates')}
                                                className="group flex flex-col items-center justify-center p-6 lg:p-8 bg-gradient-to-br from-amber-50/40 to-amber-100/40 hover:from-amber-100/60 hover:to-amber-200/60 border border-amber-300 rounded-xl shadow hover:shadow-md transition-all duration-300 min-h-[220px]"
                                            >
                                                <div className="bg-amber-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                    <FaUserCheck className="text-5xl text-amber-600 group-hover:text-amber-700 transition-colors" />
                                                </div>
                                                <h4 className="text-lg lg:text-xl font-bold text-amber-800 text-center">
                                                    Approve/Reject
                                                </h4>
                                                <p className="text-sm text-amber-700 text-center opacity-90 mt-1">Pending updates</p>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}