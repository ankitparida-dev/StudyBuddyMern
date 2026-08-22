const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail } = require('../services/emailService');

// ============================================
// Helper Functions
// ============================================
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  const { password, resetPasswordToken, resetPasswordExpire, ...sanitized } = userObj;
  return sanitized;
};

// ============================================
// Controller Functions
// ============================================

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, currentGrade, examType, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      currentGrade,
      examType,
      phone: phone || ''
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err));

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currentGrade: user.currentGrade,
      examType: user.examType,
      phone: user.phone
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed. Please try again.'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currentGrade: user.currentGrade,
      examType: user.examType,
      phone: user.phone
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed. Please try again.'
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load profile'
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };