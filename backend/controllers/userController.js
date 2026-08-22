const User = require('../models/User');
const UserSettings = require('../models/UserSettings');

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
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
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

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'currentGrade', 'examType', 'bio'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');
    
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
    console.error('❌ Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
};

/**
 * @desc    Get user settings
 * @route   GET /api/users/settings
 * @access  Private
 */
const getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user._id });
    
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user._id });
    }
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load settings'
    });
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/users/settings
 * @access  Private
 */
const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      'dailyGoal', 'pomodoroDuration', 'breakDuration', 
      'longBreakDuration', 'notifications', 'weeklyReport',
      'aiRecommendations', 'distractionFree', 'autoPause', 'theme'
    ];
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update settings'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings
};