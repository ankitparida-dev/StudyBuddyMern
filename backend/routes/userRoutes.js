const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings
} = require('../controllers/userController');

// All routes are protected (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);

module.exports = router;