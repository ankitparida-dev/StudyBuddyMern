const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../services/emailService');
const crypto = require('crypto');

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

const firebaseSession = async (req, res) => {
  let stage = 'read request';
  try {
    const getFirebaseAdmin = require('../config/firebaseAdmin');
    const authorization = req.headers.authorization || '';
    const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!idToken) return res.status(401).json({ success: false, error: 'Firebase ID token is required' });

    stage = 'verify Firebase ID token';
    console.info(`[firebase-auth] stage started: ${stage}`);
    const decoded = await getFirebaseAdmin().verifyIdToken(idToken);
    const email = decoded.email?.trim().toLowerCase();
    if (!decoded.uid || !email) {
      return res.status(400).json({ success: false, error: 'Firebase account must have an email address' });
    }
    if (!decoded.email_verified) {
      return res.status(403).json({ success: false, error: 'Verify your Firebase email before linking your account' });
    }
    const firebaseEmailAlias = `firebase-${crypto.createHash('sha256').update(decoded.uid).digest('hex')}@firebase.app`;

    stage = 'find or create MongoDB account';
    console.info(`[firebase-auth] stage started: ${stage}`);
    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = decoded.uid;
        user.email = firebaseEmailAlias;
        user.password = undefined;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.firstName = 'Student';
        user.lastName = 'User';
      } else {
        user = new User({
          firebaseUid: decoded.uid,
          email: firebaseEmailAlias,
          firstName: 'Student',
          lastName: 'User',
          currentGrade: ['Class 11', 'Class 12', 'Dropper'].includes(req.body.currentGrade) ? req.body.currentGrade : 'Class 11',
          examType: ['JEE', 'NEET'].includes(req.body.examType) ? req.body.examType : 'JEE',
          isEmailVerified: Boolean(decoded.email_verified),
        });
      }
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }
    user.lastLogin = new Date();
    stage = 'save MongoDB account';
    console.info(`[firebase-auth] stage started: ${stage}`);
    const saveStartedAt = Date.now();
    await user.save();
    console.info(`[firebase-auth] MongoDB save completed durationMs=${Date.now() - saveStartedAt}`);

    console.info('[firebase-auth] session linked successfully');
    res.json({
      success: true,
      user: {
        id: user._id,
        email: decoded.email,
        firstName: req.body.name?.trim().split(/\s+/)[0] || decoded.name?.split(/\s+/)[0] || 'Student',
        lastName: req.body.name?.trim().split(/\s+/).slice(1).join(' ') || decoded.name?.split(/\s+/).slice(1).join(' ') || '',
        name: req.body.name?.trim() || decoded.name || 'Student',
        currentGrade: user.currentGrade,
        examType: user.examType,
      },
    });
  } catch (error) {
    console.error(`[firebase-auth] ${stage} failed (${error.code || error.name || 'Error'}): ${error.message}`);
    const status = error.status || (error.code === 11000 ? 409 : error.name === 'ValidationError' ? 400 : 401);
    res.status(status).json({ success: false, error: error.message || 'Firebase authentication failed' });
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

    const profile = sanitizeUser(user);
    if (req.authProvider === 'firebase') {
      profile.email = req.tokenDecoded.email;
      profile.firstName = req.tokenDecoded.name?.split(/\s+/)[0] || 'Student';
      profile.lastName = req.tokenDecoded.name?.split(/\s+/).slice(1).join(' ') || '';
      profile.name = req.tokenDecoded.name || 'Student';
    }

    res.json({
      success: true,
      user: profile
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
  forgotPassword, resetPassword, logoutUser, refreshToken, deleteAccount, firebaseSession
};