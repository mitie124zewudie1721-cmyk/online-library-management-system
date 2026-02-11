// src/pages/admin/AdminUsers.jsx
import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AdminUsers = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit modal state (only used by admin)
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        role: 'member',
        isActive: true,
    });

    // Determine role safely
    const userRole = currentUser?.role?.toLowerCase() || '';
    const isAdmin = userRole === 'admin';
    const isLibrarian = userRole === 'librarian';
    const isStaff = isAdmin || isLibrarian;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/users');
            const data = res.data?.data || res.data || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch users error:', err);
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user) => {
        if (!user || !isAdmin) return; // only admin can edit
        setEditUser(user);
        setEditForm({
            name: user.name || '',
            role: user.role || 'member',
            isActive: user.isActive !== false,
        });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editUser?._id || !isAdmin) return;

        try {
            const res = await api.put(`/users/${editUser._id}`, editForm);
            setUsers((prev) =>
                prev.map((u) => (u._id === editUser._id ? { ...u, ...res.data } : u))
            );
            setEditUser(null);
            alert('User updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user');
            console.error('Update failed:', err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!isAdmin) return;
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        try {
            await api.delete(`/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            alert('User deleted successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
            console.error('Delete failed:', err);
        }
    };

    // ─── RENDERING ───
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-3 text-xl text-indigo-600 animate-pulse">
                    <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                    Loading users...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow max-w-lg w-full">
                    <p className="text-xl font-medium">{error}</p>
                    <p className="mt-2">Please check your login role (must be admin or librarian) or backend server.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isAdmin ? 'Manage All Users' : 'View All Users'}
                </h1>
                <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
                    {users.length} {users.length === 1 ? 'user' : 'users'} found
                </span>
            </div>

            {/* Mode indicator for librarian */}
            {isLibrarian && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-lg">
                    <p className="font-medium">View only mode (Librarian)</p>
                    <p className="text-sm mt-1">You can view user information but cannot edit or delete accounts.</p>
                </div>
            )}

            {users.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-600">
                    <p className="text-xl">No users registered in the system yet.</p>
                    <p className="mt-2 text-sm">New members will appear here after registration.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {users
                                .filter(user => user && user._id)
                                .map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name || '—'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            @{user.username || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : user.role === 'librarian'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}
                                            >
                                                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                            {isAdmin ? (
                                                <>
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-medium transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="text-red-600 hover:text-red-900 font-medium transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-500 text-xs italic">View only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal – Admin only */}
            {isAdmin && editUser && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 lg:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                                <button
                                    onClick={() => setEditUser(null)}
                                    className="text-gray-500 hover:text-gray-800 text-3xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                    <select
                                        name="role"
                                        value={editForm.role}
                                        onChange={handleEditChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    >
                                        <option value="member">Member</option>
                                        <option value="librarian">Librarian</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={editForm.isActive}
                                        onChange={handleEditChange}
                                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label className="ml-2.5 text-sm font-medium text-gray-700">Account Active</label>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditUser(null)}
                                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;