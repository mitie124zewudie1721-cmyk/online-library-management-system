// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from stored token on mount and when token changes
    const loadUser = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // api.js interceptor already adds Bearer token → no need to set header here
            const response = await api.get("/auth/me");

            // Handle different response shapes (some return { data: user }, some { data: { ... } })
            const userData = response.data.data || response.data;
            setUser(userData);
            setError(null);
        } catch (err) {
            console.error("Auth validation failed:", err);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
            setError("Session expired. Please log in again.");
            navigate("/login", { replace: true });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Run on mount
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Listen for storage changes (multi-tab support)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "accessToken") {
                loadUser();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [loadUser]);

    // Login function – fixed token saving
    const login = useCallback(
        async (credentials) => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.post("/auth/login", credentials);

                // Handle different response shapes
                const data = response.data.data || response.data;

                const { accessToken, refreshToken, ...userData } = data;

                // SAVE TOKENS – this was missing or wrong in your version
                localStorage.setItem("accessToken", accessToken.trim());
                if (refreshToken) {
                    localStorage.setItem("refreshToken", refreshToken.trim());
                }

                setUser(userData);
                setError(null);

                // Debug log
                console.log("Login success – token saved:", accessToken.substring(0, 20) + "...");
                console.log("User set in context:", userData);

                // Role-based redirect
                if (userData.role === "admin" || userData.role === "librarian") {
                    navigate("/dashboard", { replace: true });
                } else {
                    navigate("/dashboard", { replace: true });
                }

                return userData;
            } catch (err) {
                const msg =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Login failed. Please check your credentials.";
                setError(msg);
                throw new Error(msg);
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    // Register function – similar pattern
    const register = useCallback(
        async (userData) => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.post("/auth/register", userData);
                const data = response.data.data || response.data;

                const { accessToken, refreshToken, ...newUser } = data;

                localStorage.setItem("accessToken", accessToken.trim());
                if (refreshToken) {
                    localStorage.setItem("refreshToken", refreshToken.trim());
                }

                setUser(newUser);
                setError(null);

                navigate("/dashboard", { replace: true });

                return newUser;
            } catch (err) {
                const msg =
                    err.response?.data?.message ||
                    "Registration failed. Try again.";
                setError(msg);
                throw new Error(msg);
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    // Logout
    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        setError(null);
        navigate("/login", { replace: true });
    }, [navigate]);

    // Memoized value
    const value = useMemo(
        () => ({
            user,
            loading,
            error,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            isAdmin: user?.role === "admin",
            isLibrarian: user?.role === "librarian" || user?.role === "admin",
        }),
        [user, loading, error, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};