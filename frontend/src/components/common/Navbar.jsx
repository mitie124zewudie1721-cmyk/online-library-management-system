// frontend/src/components/common/Navbar.jsx
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo / Brand */}
                    <Link to="/" className="text-2xl font-bold">
                        Library MS
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="hover:text-gray-300 transition">
                            Home
                        </Link>
                        <Link to="/books" className="hover:text-gray-300 transition">
                            View  Books
                        </Link>

                        {user ? (
                            <>
                                {/* Only show "Add Book" for staff (admin or librarian) */}
                                {(user.role === 'admin' || user.role === 'librarian') && (
                                    <Link to="/add-book" className="hover:text-gray-300 transition">
                                        Add Book
                                    </Link>
                                )}

                                <Link to="/profile" className="hover:text-gray-300 transition">
                                    Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-gray-300 transition">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;