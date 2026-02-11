// frontend/src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, loading } = useContext(AuthContext);

    // Still loading auth state
    if (loading) {
        return <Loader />;
    }

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role check (if specific roles required)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // All good → render the protected content
    return <Outlet />;
};

export default ProtectedRoute;