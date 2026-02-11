// src/pages/Login.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Show "Session expired" message if redirected from 401
    useEffect(() => {
        if (searchParams.get('session_expired') === 'true') {
            setError('Your session has expired. Please log in again.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Trim username to avoid login failures due to spaces
        const trimmedUsername = username.trim();

        console.log('[LOGIN SUBMIT] Attempting login with:', { username: trimmedUsername });

        try {
            await login({ username: trimmedUsername, password });
            console.log('[LOGIN SUCCESS] Redirecting to dashboard');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            // Extract real backend message (most important fix)
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Login failed. Please check your username and password.';

            console.error('[LOGIN ERROR DETAILS]', {
                message: errorMessage,
                status: err.response?.status,
                fullResponse: err.response?.data,
            });

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/40">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-10 py-12 text-white text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold">Welcome Back</h1>
                    <p className="mt-4 text-lg opacity-90">Sign in to your library account</p>
                </div>

                {/* Form */}
                <div className="p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password with Eye Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-indigo-600 font-medium hover:text-indigo-800 underline transition-colors duration-200"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;