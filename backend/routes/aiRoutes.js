const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const { generateInsight } = require('../controllers/aiController');

const router = express.Router();
const insightLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 8 });

router.post(
  '/insight',
  protect,
  insightLimit,
  body('type').isIn(['progress', 'reports']).withMessage('Insight type must be progress or reports'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    next();
  },
  generateInsight
);

module.exports = router;