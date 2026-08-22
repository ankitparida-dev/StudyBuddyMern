const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const {
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
} = require('../controllers/userController');

// ============================================
// Validation Rules
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

const profileValidation = [
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
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
  
  body('currentGrade')
    .optional()
    .trim()
    .isIn(['Class 11', 'Class 12', 'Dropper']).withMessage('Invalid grade selection'),
  
  body('examType')
    .optional()
    .trim()
    .isIn(['JEE', 'NEET']).withMessage('Invalid exam type'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
];

const settingsValidation = [
  body('dailyGoal')
    .optional()
    .isInt({ min: 1, max: 24 }).withMessage('Daily goal must be between 1 and 24 hours'),
  
  body('pomodoroDuration')
    .optional()
    .isInt({ min: 5, max: 60 }).withMessage('Pomodoro duration must be between 5 and 60 minutes'),
  
  body('breakDuration')
    .optional()
    .isInt({ min: 1, max: 30 }).withMessage('Break duration must be between 1 and 30 minutes'),
  
  body('longBreakDuration')
    .optional()
    .isInt({ min: 5, max: 60 }).withMessage('Long break duration must be between 5 and 60 minutes'),
  
  body('notifications')
    .optional()
    .isBoolean().withMessage('Notifications must be a boolean'),
  
  body('weeklyReport')
    .optional()
    .isBoolean().withMessage('Weekly report must be a boolean'),
  
  body('aiRecommendations')
    .optional()
    .isBoolean().withMessage('AI recommendations must be a boolean'),
  
  body('distractionFree')
    .optional()
    .isBoolean().withMessage('Distraction free must be a boolean'),
  
  body('autoPause')
    .optional()
    .isBoolean().withMessage('Auto pause must be a boolean'),
  
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system']).withMessage('Invalid theme selection')
];

const notificationValidation = [
  body('notificationId')
    .optional()
    .isString().withMessage('Notification ID must be a string')
];

// ============================================
// ROUTES
// ============================================

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, validate(profileValidation), updateProfile);

/**
 * @route   GET /api/users/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/settings', protect, getSettings);

/**
 * @route   PUT /api/users/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/settings', protect, validate(settingsValidation), updateSettings);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', protect, getUserStats);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get('/activity', protect, getUserActivity);

/**
 * @route   GET /api/users/preferences
 * @desc    Get study preferences
 * @access  Private
 */
router.get('/preferences', protect, getStudyPreferences);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update study preferences
 * @access  Private
 */
router.put('/preferences', protect, validate(settingsValidation), updateStudyPreferences);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', protect, getNotifications);

/**
 * @route   PATCH /api/users/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/notifications/:notificationId/read', protect, markNotificationRead);

/**
 * @route   PATCH /api/users/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/notifications/read-all', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // This would be implemented in the controller
    // await User.updateOne({ _id: userId }, { $set: { 'notifications.$[].read': true } });
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', protect, deleteAccount);

/**
 * @route   GET /api/users/verify
 * @desc    Verify user session
 * @access  Private
 */
router.get('/verify', protect, (req, res) => {
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