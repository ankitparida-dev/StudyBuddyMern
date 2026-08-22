process.env.NODE_NO_WARNINGS = '1';
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// ============================================
// CORS Configuration
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5000',
      'https://studybuddy-frontend.onrender.com',
      'https://studybuddy-frontend.vercel.app'
    ];
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// MongoDB Connection
// ============================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    console.log('📊 Database:', process.env.MONGODB_URI);
  })
  .catch((err) => {
    console.log('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ============================================
// ✅ FIXED: Routes - No wildcard issues
// ============================================
// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Dashboard routes
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Study routes
app.use('/api/study', require('./routes/studyRoutes'));

// Chat routes
app.use('/api/chat', require('./routes/chatRoutes'));

// ============================================
// Home route
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 StudyBuddy API',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      dashboard: '/api/dashboard',
      study: '/api/study',
      chat: '/api/chat'
    }
  });
});

// ============================================
// Health check
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ============================================
// ✅ FIXED: 404 handler - No wildcard issues
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ============================================
// ✅ FIXED: Error handler
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  // Handle specific errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      details: err.errors
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// Start server
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📌 Available endpoints:`);
  console.log(`   - GET  /`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/profile`);
  console.log(`   - GET  /api/users/profile`);
  console.log(`   - PUT  /api/users/profile`);
  console.log(`   - GET  /api/users/settings`);
  console.log(`   - PUT  /api/users/settings`);
  console.log(`   - GET  /api/dashboard/stats`);
  console.log(`   - GET  /api/dashboard/progress`);
  console.log(`   - GET  /api/dashboard/streaks`);
  console.log(`   - GET  /api/study/goals`);
  console.log(`   - POST /api/study/goals`);
  console.log(`   - GET  /api/chat/history`);
  console.log(`   - POST /api/chat/message`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});