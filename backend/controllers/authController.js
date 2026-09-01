const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../services/emailService');

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
const updateUserProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'currentGrade', 'examType'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true, runValidators: true
    }).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, error: 'Email already exists' });
    res.status(400).json({ success: false, error: error.message || 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Failed to change password' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+resetPasswordToken +resetPasswordExpire');
    if (user) {
      const token = user.generateResetToken();
      await user.save({ validateBeforeSave: false });
      await sendResetPasswordEmail(user, token);
    }
    res.json({ success: true, message: 'If that email exists, reset instructions have been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process password reset request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpire: { $gt: Date.now() } })
      .select('+resetPasswordToken +resetPasswordExpire');
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Failed to reset password' });
  }
};

const logoutUser = (req, res) => res.json({ success: true, message: 'Logged out successfully' });
const refreshToken = async (req, res) => res.status(501).json({ success: false, error: 'Refresh tokens are not configured' });
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};

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

module.exports = {
  registerUser, loginUser, getUserProfile, updateUserProfile, changePassword,
  forgotPassword, resetPassword, logoutUser, refreshToken, deleteAccount
};