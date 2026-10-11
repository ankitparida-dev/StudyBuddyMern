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

/**
 * @desc    Send test weekly email report
 * @route   POST /api/users/send-test-email
 * @access  Private
 */
const sendTestEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Resolve the real destination email:
    // Priority: req.body.email -> req.tokenDecoded.email -> user.email (if not a dummy firebase alias)
    let targetEmail =
      req.body?.email?.trim() ||
      req.tokenDecoded?.email?.trim() ||
      (user.email && !user.email.endsWith('@firebase.app') ? user.email.trim() : null);

    if (!targetEmail) {
      targetEmail = user.email;
    }

    // Strict email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!targetEmail || !emailRegex.test(targetEmail) || targetEmail.endsWith('@firebase.app')) {
      return res.status(400).json({
        success: false,
        error: `Invalid email address ("${targetEmail || ''}"). Please ensure your account has a valid email address.`,
      });
    }

    // Update MongoDB user.email to real email if it was previously an alias
    if (user.email && user.email.endsWith('@firebase.app') && targetEmail && !targetEmail.endsWith('@firebase.app')) {
      const emailInUse = await User.findOne({ email: targetEmail.toLowerCase(), _id: { $ne: user._id } });
      if (!emailInUse) {
        user.email = targetEmail.toLowerCase();
        await user.save().catch(() => {});
      }
    }

    let settings = await UserSettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user._id });
    }

    const { calculateUserWeeklyStats } = require('../services/cronService');
    const { sendWeeklyReportEmail } = require('../services/emailService');

    const stats = await calculateUserWeeklyStats(user._id);
    const userForEmail = {
      ...(user.toObject ? user.toObject() : user),
      email: targetEmail,
      firstName: user.firstName || req.tokenDecoded?.name?.split(' ')[0] || 'Student',
    };

    const result = await sendWeeklyReportEmail(
      userForEmail,
      settings.emailReports || {},
      stats,
      true
    );

    if (result.simulated) {
      return res.json({
        success: true,
        simulated: true,
        message: `⚠️ Simulation mode: RESEND_API_KEY was not found in backend/.env. Please save .env and try again.`,
      });
    }

    res.json({
      success: true,
      simulated: false,
      message: `Test email sent to ${targetEmail} 📬`,
      id: result.id,
    });
  } catch (error) {
    console.error('❌ sendTestEmail error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email',
    });
  }
};

/**
 * @desc    Get user email report preferences
 * @route   GET /api/users/email-preferences
 * @access  Private
 */
const getEmailPreferences = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user._id });
    }
    res.json({
      success: true,
      emailReports: settings.emailReports,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Update user email report preferences
 * @route   PUT /api/users/email-preferences
 * @access  Private
 */
const updateEmailPreferences = async (req, res) => {
  try {
    const { enabled, day, time, includeInsights, includeSessions, includeCharts } = req.body;
    const updateData = {};
    if (enabled !== undefined) updateData['emailReports.enabled'] = enabled;
    if (day !== undefined) updateData['emailReports.day'] = day;
    if (time !== undefined) updateData['emailReports.time'] = time;
    if (includeInsights !== undefined) updateData['emailReports.includeInsights'] = includeInsights;
    if (includeSessions !== undefined) updateData['emailReports.includeSessions'] = includeSessions;
    if (includeCharts !== undefined) updateData['emailReports.includeCharts'] = includeCharts;

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      emailReports: settings.emailReports,
      message: 'Email preferences saved successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
  updateStudyPreferences,
  sendTestEmail,
  getEmailPreferences,
  updateEmailPreferences
};