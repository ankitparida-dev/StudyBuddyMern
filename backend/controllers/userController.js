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

const getUserStats = async (req, res) => {
  res.json({ success: true, stats: req.user.studyStats });
};

const getUserActivity = async (req, res) => {
  res.json({ success: true, activity: [] });
};

const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};

const getNotifications = async (req, res) => {
  res.json({ success: true, notifications: [] });
};

const markNotificationRead = async (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
};

const getStudyPreferences = async (req, res) => {
  res.json({ success: true, preferences: req.user.preferences });
};

const updateStudyPreferences = async (req, res) => {
  try {
    const allowedFields = ['preferredStudyTime', 'preferredSubjects', 'dailyGoal', 'weeklyGoal', 'learningStyle', 'difficultyLevel'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[`preferences.${field}`] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true, runValidators: true });
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Failed to update preferences' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  getUserStats,
  getUserActivity,
  deleteAccount,
  getNotifications,
  markNotificationRead,
  getStudyPreferences,
  updateStudyPreferences
};