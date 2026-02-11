// src/components/common/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
    FaHome,
    FaBook,
    FaPlusCircle,
    FaBookOpen,
    FaUserCog,
    FaSignOutAlt,
    FaUsersCog,
    FaBars,
    FaCalendarTimes,
} from 'react-icons/fa';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false); // closed by default on mobile

    const isAdmin = user?.role === 'admin';

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FaHome />, show: !!user },
        { path: '/books', label: 'All Books', icon: <FaBook />, show: !!user },
        {
            path: '/add-book',
            label: 'Add New Book',
            icon: <FaPlusCircle />,
            show: isAdmin, // Only admin can add books (librarian can too if needed)
        },
        // My Borrowed Books – ONLY for non-admins (members & librarians)
        // src/components/common/Sidebar.jsx
        // ... inside navItems array ...

        {
            path: '/borrowed',
            label: 'My Borrowed Books',
            icon: <FaBookOpen />,
            show: !!user && user.role === 'member',   // ← ONLY members see this now
        },
        { path: '/profile', label: 'My Profile', icon: <FaUserCog />, show: !!user },
    ];

    // Admin-only extra items
    if (isAdmin) {
        navItems.push(
            {
                path: '/admin/overdue',
                label: 'Overdue Borrows',
                icon: <FaCalendarTimes />,
                show: true,
            },
            {
                path: '/admin/users',
                label: 'Manage Users',
                icon: <FaUsersCog />,
                show: true,
            }
        );
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            logout();
            setIsOpen(false); // close sidebar on logout (mobile)
        }
    };

    // Safe role display (fallback to Guest if no user or role)
    const roleDisplay = user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : 'Guest';

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle sidebar menu"
            >
                <FaBars size={24} />
            </button>

            {/* Sidebar */}
            <aside
                className={`w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0`}
                role="navigation"
                aria-label="Main navigation sidebar"
            >
                {/* Header / Logo */}
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold tracking-wide">Library MS</h1>
                    <p className="text-sm text-gray-400 mt-2 font-medium">
                        {user ? roleDisplay : 'Guest'}
                    </p>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map(
                        (item) =>
                            item.show && (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)} // close on mobile after click
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isActive
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`
                                    }
                                    title={item.label}
                                    aria-label={item.label}
                                >
                                    <span className="text-xl mr-4 flex-shrink-0" aria-hidden="true">
                                        {item.icon}
                                    </span>
                                    <span className="font-medium truncate">{item.label}</span>
                                </NavLink>
                            )
                    )}
                </nav>

                {/* Logout Button */}
                {user && (
                    <div className="p-4 border-t border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Logout"
                        >
                            <FaSignOutAlt className="text-xl mr-4" aria-hidden="true" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Mobile overlay – close sidebar when clicking outside */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

export default Sidebar;