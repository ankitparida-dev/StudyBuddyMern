const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutUser,
  refreshToken,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// ============================================
// Rate Limiting
// ============================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per IP
  message: {
    success: false,
    error: 'Too many registration attempts. Please try again after an hour.'
  }
});

// ============================================
// Validation Rules
// ============================================
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name must contain only letters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name must contain only letters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  
  body('currentGrade')
    .trim()
    .notEmpty().withMessage('Current grade is required')
    .isIn(['Class 11', 'Class 12', 'Dropper']).withMessage('Invalid grade selection'),
  
  body('examType')
    .trim()
    .notEmpty().withMessage('Exam type is required')
    .isIn(['JEE', 'NEET']).withMessage('Invalid exam type selection')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name must contain only letters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name must contain only letters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('currentGrade')
    .optional()
    .trim()
    .isIn(['Class 11', 'Class 12', 'Dropper']).withMessage('Invalid grade selection'),
  
  body('examType')
    .optional()
    .trim()
    .isIn(['JEE', 'NEET']).withMessage('Invalid exam type selection'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
];

// ============================================
// Validation Middleware
// ============================================
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

// ============================================
// Routes
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  validate(registerValidation),
  registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validate(loginValidation),
  loginUser
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  validate(updateProfileValidation),
  updateUserProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  protect,
  validate(changePasswordValidation),
  changePassword
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  validate(forgotPasswordValidation),
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validate(resetPasswordValidation),
  resetPassword
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post('/logout', protect, logoutUser);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', protect, deleteAccount);

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify-token', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    }
  });
});

module.exports = router;