process.env.NODE_NO_WARNINGS = '1';
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// ============================================
// CORS Configuration — allows localhost + any Vercel domain
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow localhost on any port (dev)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow any *.vercel.app subdomain (production + previews)
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }

    // Allow explicit whitelist (add extra domains here if needed)
    const allowedOrigins = [
      'https://studybuddy-frontend.onrender.com',
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('❌ CORS blocked for origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 86400,
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for firebase-session (useful for debugging)
app.use('/api/auth/firebase-session', (req, res, next) => {
  const startedAt = Date.now();
  console.info(`[request] ${req.method} /api/auth/firebase-session started`);
  res.on('finish', () => {
    console.info(
      `[request] ${req.method} /api/auth/firebase-session finished status=${res.statusCode} durationMs=${Date.now() - startedAt}`
    );
  });
  next();
});

// ============================================
// Routes
// ============================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/study', require('./routes/studyRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));

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
      chat: '/api/chat',
      learning: '/api/learning',
    },
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
    memory: process.memoryUsage(),
  });
});

// ============================================
// 404 handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// ============================================
// Error handler
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      details: err.errors,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// Start server
// ============================================
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  console.info('[startup] waiting for MongoDB connection');
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📌 Available endpoints:`);
    console.log(`   - GET  /`);
    console.log(`   - GET  /health`);
    console.log(`   - POST /api/auth/register`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - POST /api/auth/firebase-session`);
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

  server.on('error', (error) => {
    console.error(
      `[startup] HTTP server failed (${error.code || error.name}): ${error.message}`
    );
    process.exitCode = 1;
  });
};

startServer().catch((error) => {
  console.error(
    `[startup] failed (${error.code || error.name}): ${error.message}`
  );
  process.exitCode = 1;
});