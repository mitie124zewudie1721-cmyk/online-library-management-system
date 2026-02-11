// backend/server.js
require('dotenv').config();           // Load .env variables FIRST!
require('colors');                    // Colored console logs (optional)

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');     // Request logging
const mongoose = require('mongoose');
const helmet = require('helmet');     // Security headers
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const uploadRoutes = require('./routes/upload'); // profile pictures

// Initialize Express app
const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 204,
}));

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Serve Static Files (uploads) ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// ─── Global Request Logger ───────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(
    `[REQUEST] ${req.method} ${req.url} | Origin: ${req.headers.origin || 'unknown'}`
  );
  next();
});

// ─── Development logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting (only if package is installed) ────────────────────────────
try {
  const { rateLimit } = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests – try again later' },
  });
  app.use('/api/', limiter);
  console.log('Rate limiting enabled'.green);
} catch (err) {
  console.warn('express-rate-limit not installed - skipping rate limiting'.yellow);
}

// ─── Database Connection ─────────────────────────────────────────────────────
connectDB();

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/upload', uploadRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Library Management System Backend is running! 🚀',
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1 ? 'Yes' : 'No',
    uptime: process.uptime().toFixed(2) + ' seconds',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]'.red.bold, err.stack || err.message);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  );
});

// ─── Handle unhandled rejections & exceptions ────────────────────────────────
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`.red.bold);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`.red.bold);
  console.error(err.stack);
  process.exit(1);
});