// src/services/api.js
import axios from 'axios';

// Base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 120000, // 120 seconds – good for Atlas cold starts
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // JWT is in header, no cookies needed
});

// Warning if no API URL configured
if (!process.env.REACT_APP_API_URL) {
    console.warn(
        'REACT_APP_API_URL is not set in .env – using default http://localhost:5000/api'
    );
}

// Request interceptor: Attach JWT token
api.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('accessToken');
        if (token) {
            token = token.trim(); // just trim, no aggressive regex
            if (!token.startsWith('Bearer ')) {
                token = `Bearer ${token}`;
            }
            config.headers.Authorization = token;

            // Debug log (comment out in production)
            console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url} | Token attached`);
        } else {
            console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url} | No token`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle common errors globally
api.interceptors.response.use(
    (response) => {
        // Debug success (comment out in production)
        console.log(`[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url} | Status: ${response.status}`);
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const backendMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Unknown server error';

        // 401 → token expired/invalid → clear tokens & redirect
        if (status === 401) {
            console.warn('[401] Unauthorized – clearing tokens & redirecting to login');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login?session_expired=true';
        }

        // 403 → forbidden (permissions/role issue) – very common for librarian Manage Overdue
        if (status === 403) {
            console.warn('[403] Forbidden:', {
                url: error.config?.url,
                message: backendMessage,
                role: JSON.parse(localStorage.getItem('user'))?.role || 'unknown',
            });
        }

        // Server error (500+) or timeout
        if (status >= 500 || error.code === 'ECONNABORTED') {
            console.error('[Server / Timeout Error]', {
                url: error.config?.url,
                method: error.config?.method,
                status,
                message: backendMessage,
                code: error.code,
            });
        }

        // Pass clean error to component catch blocks
        return Promise.reject(new Error(backendMessage));
    }
);

// File upload helper (for book covers, profile pics, etc.)
api.upload = async (url, formData, onUploadProgress) => {
    try {
        console.log(`[API UPLOAD] Starting upload to ${url}`);
        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
        console.log(`[API UPLOAD] Success: ${response.status}`);
        return response;
    } catch (err) {
        console.error('[API UPLOAD FAILED]', {
            url,
            message: err.response?.data?.message || err.message,
            status: err.response?.status,
        });
        throw new Error(err.response?.data?.message || err.message || 'Upload failed');
    }
};

export default api;