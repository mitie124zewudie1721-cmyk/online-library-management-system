// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaFileUpload } from 'react-icons/fa';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        bio: '',
        role: 'member',
    });
    const [profilePicture, setProfilePicture] = useState(null); // file object
    const [previewUrl, setPreviewUrl] = useState(null); // image preview
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordMatch, setPasswordMatch] = useState(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Real-time password match check
        if (name === 'password' || name === 'confirmPassword') {
            const match = name === 'password' ? value === formData.confirmPassword : formData.password === value;
            setPasswordMatch(match || !value || !formData.password);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file)); // preview image
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        // Client-side validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }
        try {
            const data = new FormData();
            data.append('name', formData.name.trim());
            data.append('username', formData.username.trim());
            data.append('password', formData.password);
            data.append('role', formData.role);
            // Optional fields
            if (formData.email) data.append('email', formData.email.trim());
            if (formData.phone) data.append('phone', formData.phone.trim());
            if (formData.bio) data.append('bio', formData.bio.trim());
            if (profilePicture) data.append('profilePicture', profilePicture);
            await api.post('/auth/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Registration successful! Redirecting to login...');
            // Small delay for user to read alert
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            const backendMsg = err.response?.data?.message || err.message || 'Registration failed. Try again.';
            setError(backendMsg);
            console.error('Registration error:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/40">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-10 py-12 text-white text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold">Create Your Account</h1>
                    <p className="mt-4 text-lg opacity-90">
                        Join our library community and start borrowing today
                    </p>
                </div>
                {/* Form */}
                <div className="p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg whitespace-pre-line">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="Meseret Teshome"
                                />
                            </div>
                        </div>
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength={3}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="meseret123"
                                />
                            </div>
                        </div>
                        {/* Email (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>
                        {/* Phone (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                            <div className="relative">
                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="+251930399154"
                                />
                            </div>
                        </div>
                        {/* Bio (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio (optional)</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm resize-none"
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>
                        {/* Profile Picture (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (optional)</label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="file"
                                        name="profilePicture"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="profilePicture"
                                    />
                                    <label
                                        htmlFor="profilePicture"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                                    >
                                        <FaFileUpload className="mr-2" />
                                        Choose Image
                                    </label>
                                </div>
                                {/* Preview */}
                                {(previewUrl || formData.profilePicture) && (
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                                        <img
                                            src={previewUrl}
                                            alt="Profile preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>
                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:border-indigo-500 outline-none transition-all shadow-sm ${!passwordMatch && formData.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                            {!passwordMatch && formData.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                            )}
                        </div>
                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                            >
                                <option value="member">Member</option>
                                <option value="librarian">Librarian</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Note: Admin accounts are created by the system administrator.
                            </p>
                        </div>
                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !passwordMatch}
                            className={`w-full py-4 px-6 mt-6 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 ${loading || !passwordMatch ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-800 transition">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}