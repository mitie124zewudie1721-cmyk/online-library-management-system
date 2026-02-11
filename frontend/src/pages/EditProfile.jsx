// src/pages/EditProfile.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    FaUserEdit,
    FaSpinner,
    FaCheckCircle,
    FaExclamationTriangle,
    FaUpload,
    FaInfoCircle,
    FaLock,
    FaEye,
    FaEyeSlash,
} from 'react-icons/fa';

export default function EditProfile() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        bio: '',
        profilePicture: '', // final relative path after upload
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [file, setFile] = useState(null); // selected file
    const [preview, setPreview] = useState(null); // live preview
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Pre-fill form & preview from current user
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || '',
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
            setPreview(
                user.profilePicture
                    ? `http://localhost:5000${user.profilePicture}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128`
            );
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Only JPG, PNG or GIF files allowed');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Live preview
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(selectedFile);
    };

    const validateForm = () => {
        if (!formData.name.trim()) return 'Full name is required';
        if (!formData.username.trim()) return 'Username is required';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            return 'Please enter a valid email address';
        }

        // Password validation (only if changing)
        if (formData.currentPassword || formData.newPassword || formData.confirmNewPassword) {
            if (!formData.currentPassword) return 'Current password is required to change password';
            if (!formData.newPassword) return 'New password is required';
            if (formData.newPassword.length < 6) return 'New password must be at least 6 characters';
            if (formData.newPassword !== formData.confirmNewPassword) return 'New passwords do not match';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setSuccess(null);
        setError(null);

        let profilePicturePath = formData.profilePicture;

        // 1. Upload new profile picture if selected
        if (file) {
            setUploadLoading(true);
            try {
                const uploadData = new FormData();
                uploadData.append('profilePicture', file);

                const uploadRes = await api.post('/upload/profile-picture', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 30000,
                });

                if (uploadRes.data.success && uploadRes.data.imageUrl) {
                    // Use the relative path returned by backend
                    profilePicturePath = uploadRes.data.imageUrl.startsWith('http')
                        ? new URL(uploadRes.data.imageUrl).pathname  // extract /uploads/...
                        : uploadRes.data.imageUrl;
                } else {
                    throw new Error(uploadRes.data.message || 'Upload failed');
                }
            } catch (uploadErr) {
                const msg = uploadErr.response?.data?.message || uploadErr.message || 'Image upload failed';
                setError(msg);
                setLoading(false);
                setUploadLoading(false);
                return;
            } finally {
                setUploadLoading(false);
            }
        }

        // 2. Send profile update request
        try {
            const updateRes = await api.put('/users/request-update', {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                bio: formData.bio,
                profilePicture: profilePicturePath,
            });

            setSuccess(updateRes.data.message || 'Profile update request sent! Waiting for admin approval.');
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Update failed';
            setError(errMsg);
            setLoading(false);
            return;
        }

        // 3. Change password if requested
        if (formData.currentPassword && formData.newPassword) {
            try {
                const pwRes = await api.put('/users/change-password', {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                });
                setSuccess((prev) => (prev ? prev + '\n' : '') + 'Password changed successfully!');
            } catch (pwErr) {
                const pwMsg = pwErr.response?.data?.message || pwErr.message || 'Password change failed';
                setError(pwMsg);
            }
        }

        setLoading(false);

        // Redirect after success
        setTimeout(() => navigate('/profile'), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-10 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <FaUserEdit className="text-5xl" />
                        <h1 className="text-4xl font-bold">Update Your Profile</h1>
                    </div>
                    <p className="text-lg opacity-90 flex items-center gap-2">
                        <FaInfoCircle /> Changes will be reviewed by an administrator before being applied.
                    </p>
                </div>

                {/* Form Content */}
                <div className="p-8 lg:p-10">
                    {success && (
                        <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-600 text-green-800 rounded-lg flex items-start gap-4 shadow-sm">
                            <FaCheckCircle className="text-3xl mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-lg whitespace-pre-line">{success}</p>
                                <p className="text-sm mt-2">Redirecting to profile in a moment...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-600 text-red-800 rounded-lg flex items-start gap-4 shadow-sm">
                            <FaExclamationTriangle className="text-3xl mt-1 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="block w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                placeholder="Your full name"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="block w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                placeholder="Your username"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                placeholder="+251 912 345 678"
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                Bio / About You
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                rows={5}
                                value={formData.bio}
                                onChange={handleChange}
                                className="block w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm resize-y"
                                placeholder="Tell others a little about yourself..."
                            />
                        </div>

                        {/* Profile Picture Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Picture
                            </label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                {/* Preview */}
                                <div className="relative">
                                    <img
                                        src={preview || formData.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&size=128`}
                                        alt="Profile preview"
                                        className="h-28 w-28 object-cover rounded-full border-4 border-gray-200 shadow-md"
                                    />
                                    {preview && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                            <p className="text-white text-xs font-medium">New</p>
                                        </div>
                                    )}
                                </div>

                                {/* File Input */}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100 cursor-pointer"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Max 5MB • jpg, png, gif
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Change Password (optional) */}
                        <div className="mt-8 border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password (optional)</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 top-10 text-gray-500 hover:text-gray-700"
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-10 text-gray-500 hover:text-gray-700"
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmNewPassword"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-10 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>

                                    {formData.newPassword && formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword && (
                                        <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading || uploadLoading}
                                className={`w-full flex items-center justify-center gap-3 py-4 px-6 text-white font-semibold text-lg rounded-xl shadow-lg transition-all transform ${loading || uploadLoading
                                        ? 'bg-indigo-400 cursor-wait'
                                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95'
                                    }`}
                            >
                                {loading || uploadLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin text-2xl" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaUserEdit className="text-2xl" />
                                        Submit Update Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                        <FaInfoCircle className="text-indigo-500" />
                        <span>All changes are subject to admin review for security and accuracy.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}