const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Import all controller functions
const {
  getStats,
  getProgress,
  getStreaks,
  addTestSession
} = require('../controllers/dashboardController');

// Log to check if functions are imported correctly (remove after fixing)
console.log('📌 Dashboard Routes Loaded:');
console.log('  - getStats:', typeof getStats);
console.log('  - getProgress:', typeof getProgress);
console.log('  - getStreaks:', typeof getStreaks);
console.log('  - addTestSession:', typeof addTestSession);

// All routes are protected
router.get('/stats', protect, getStats);
router.get('/progress', protect, getProgress);
router.get('/streaks', protect, getStreaks);
router.post('/test-session', protect, addTestSession);

module.exports = router;