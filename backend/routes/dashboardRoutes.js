const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getStats,
  getProgress,
  getStreaks,
  getDashboardOverview,
  getRecentActivity,
  getSubjectPerformance,
  addTestSession,
  getWeeklyProgress,
  getMonthlyProgress
} = require('../controllers/dashboardController');

// Log to check if functions are imported correctly
console.log('📌 Dashboard Routes Loaded:');
console.log('  - getStats:', typeof getStats);
console.log('  - getProgress:', typeof getProgress);
console.log('  - getStreaks:', typeof getStreaks);
console.log('  - getDashboardOverview:', typeof getDashboardOverview);
console.log('  - getRecentActivity:', typeof getRecentActivity);
console.log('  - getSubjectPerformance:', typeof getSubjectPerformance);
console.log('  - addTestSession:', typeof addTestSession);
console.log('  - getWeeklyProgress:', typeof getWeeklyProgress);
console.log('  - getMonthlyProgress:', typeof getMonthlyProgress);

// ============================================
// All routes are protected
// ============================================

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', protect, getStats);

/**
 * @route   GET /api/dashboard/progress
 * @desc    Get progress data
 * @access  Private
 */
router.get('/progress', protect, getProgress);

/**
 * @route   GET /api/dashboard/streaks
 * @desc    Get streak data
 * @access  Private
 */
router.get('/streaks', protect, getStreaks);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get complete dashboard overview
 * @access  Private
 */
router.get('/overview', protect, getDashboardOverview);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/recent-activity', protect, getRecentActivity);

/**
 * @route   GET /api/dashboard/subject-performance
 * @desc    Get subject-wise performance
 * @access  Private
 */
router.get('/subject-performance', protect, getSubjectPerformance);

/**
 * @route   GET /api/dashboard/weekly
 * @desc    Get weekly progress
 * @access  Private
 */
router.get('/weekly', protect, getWeeklyProgress);

/**
 * @route   GET /api/dashboard/monthly
 * @desc    Get monthly progress
 * @access  Private
 */
router.get('/monthly', protect, getMonthlyProgress);

/**
 * @route   POST /api/dashboard/test-session
 * @desc    Add a test session
 * @access  Private
 */
router.post('/test-session', protect, addTestSession);

module.exports = router;