const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// Helper Functions
// ============================================
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// ============================================
// Middleware: Protect Routes
// ============================================
const protect = async (req, res, next) => {
  try {
    // Extract token
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please login to continue.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please login again.'
      });
    }

    // Get user from token
    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found. Please login again.'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    req.tokenDecoded = decoded;

    next();
    
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error. Please try again.'
    });
  }
};

// ============================================
// Middleware: Optional Auth (for public routes)
// ============================================
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');
        if (user) {
          req.user = user;
          req.token = token;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// ============================================
// Middleware: Role-Based Access
// ============================================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please login.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

// ============================================
// Middleware: Token Refresh
// ============================================
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    req.newToken = newToken;
    req.user = user;
    next();

  } catch (error) {
    console.error('❌ Refresh Token Error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

// ============================================
// Middleware: Rate Limiting for Auth
// ============================================
const authRateLimit = new Map();

const rateLimitAuth = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `auth_${ip}`;
    
    const now = Date.now();
    const attempts = authRateLimit.get(key) || { count: 0, resetTime: now + windowMs };
    
    // Reset if time window expired
    if (now > attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = now + windowMs;
    }
    
    attempts.count++;
    authRateLimit.set(key, attempts);
    
    if (attempts.count > maxAttempts) {
      const remainingTime = Math.ceil((attempts.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Too many attempts. Please try again in ${remainingTime} seconds.`
      });
    }
    
    next();
  };
};

// ============================================
// Middleware: Check Token Expiry
// ============================================
const checkTokenExpiry = (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = decoded.exp - now;
      
      // If token expires in less than 5 minutes, add header
      if (timeLeft < 300 && timeLeft > 0) {
        res.setHeader('X-Token-Expiring', 'true');
        res.setHeader('X-Token-Expires-In', timeLeft);
      }
    }
  } catch (error) {
    // Ignore decode errors
  }
  
  next();
};

// ============================================
// Export all middleware
// ============================================
module.exports = { 
  protect, 
  optionalAuth, 
  authorize, 
  refreshToken, 
  rateLimitAuth,
  checkTokenExpiry
};