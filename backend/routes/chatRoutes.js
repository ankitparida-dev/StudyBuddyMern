const express = require('express');
const router = express.Router();
const { sendMessage } = require('../controllers/chatController');

// Public route (no authentication needed)
router.post('/', sendMessage);

module.exports = router;