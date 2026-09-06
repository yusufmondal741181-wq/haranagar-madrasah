const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiter for Login Endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static Public Uploads (Private uploads are accessed via protected controller download route)
app.use('/uploads/public', express.static(path.join(__dirname, 'uploads/public')));

// API Routes
app.use('/api/public', require('../Routes/publicRoutes'));
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', require('../Routes/authRoutes'));
app.use('/api/students', require('../Routes/studentRoutes'));
app.use('/api/notices', require('../Routes/noticeRoutes'));
app.use('/api/documents', require('../Routes/documentRoutes'));
app.use('/api/staff', require('../Routes/staffRoutes'));
app.use('/api/settings', require('../Routes/settingsRoutes'));
app.use('/api/activity', require('../Routes/activityRoutes'));
app.use('/api/dashboard', require('../Routes/dashboardRoutes'));

// Serve Frontend Build in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  return res.status(500).json({ error: err.message || 'An unexpected internal error occurred.' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Haranagar Chandipur Senior Madrasah Backend Server`);
  console.log(` Running on: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});