const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { body, query, validationResult } = require('express-validator');
const {
  // Goal functions
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  markComplete,
  markIncomplete,
  
  // Practice Tracker functions
  savePracticeSession,
  getPracticeSessions,
  getPracticeStats,
  getPracticeSessionById,
  deletePracticeSession,
  getTopicPerformance
} = require('../controllers/studyController');

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

const goalValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Goal title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isIn(['physics', 'chemistry', 'math', 'biology']).withMessage('Invalid subject'),
  
  body('priority')
    .optional()
    .isIn(['high', 'medium', 'low']).withMessage('Invalid priority level'),
  
  body('deadline')
    .optional()
    .isISO8601().withMessage('Invalid date format')
];

const practiceValidation = [
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isIn(['physics', 'chemistry', 'math', 'biology', 'general']).withMessage('Invalid subject'),
  
  body('topic')
    .trim()
    .notEmpty().withMessage('Topic is required')
    .isLength({ min: 2, max: 100 }).withMessage('Topic must be between 2 and 100 characters'),
  
  body('totalQuestions')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Total questions must be between 1 and 200'),
  
  body('correctAnswers')
    .optional()
    .isInt({ min: 0 }).withMessage('Correct answers must be a positive number'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 0, max: 720 }).withMessage('Time spent must be between 0 and 720 minutes'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
];

const queryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('subject')
    .optional()
    .isIn(['physics', 'chemistry', 'math', 'biology', 'all']).withMessage('Invalid subject')
];

// ============================================
// GOAL ROUTES
// ============================================

/**
 * @route   POST /api/study/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/goals', protect, validate(goalValidation), createGoal);

/**
 * @route   GET /api/study/goals
 * @desc    Get all goals for a user
 * @access  Private
 */
router.get('/goals', protect, getGoals);

/**
 * @route   GET /api/study/goals/:id
 * @desc    Get a specific goal by ID
 * @access  Private
 */
router.get('/goals/:id', protect, getGoalById);

/**
 * @route   PUT /api/study/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put('/goals/:id', protect, validate(goalValidation), updateGoal);

/**
 * @route   DELETE /api/study/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete('/goals/:id', protect, deleteGoal);

/**
 * @route   PATCH /api/study/goals/:id/complete
 * @desc    Mark a goal as complete
 * @access  Private
 */
router.patch('/goals/:id/complete', protect, markComplete);

/**
 * @route   PATCH /api/study/goals/:id/incomplete
 * @desc    Mark a goal as incomplete
 * @access  Private
 */
router.patch('/goals/:id/incomplete', protect, markIncomplete);

// ============================================
// PRACTICE TRACKER ROUTES
// ============================================

/**
 * @route   POST /api/study/practice
 * @desc    Save a practice session
 * @access  Private
 */
router.post('/practice', protect, validate(practiceValidation), savePracticeSession);

/**
 * @route   GET /api/study/practice
 * @desc    Get all practice sessions with filtering
 * @access  Private
 */
router.get('/practice', protect, validate(queryValidation), getPracticeSessions);

/**
 * @route   GET /api/study/practice/stats
 * @desc    Get practice statistics
 * @access  Private
 */
router.get('/practice/stats', protect, validate(queryValidation), getPracticeStats);

/**
 * @route   GET /api/study/practice/topics
 * @desc    Get topic-wise performance
 * @access  Private
 */
router.get('/practice/topics', protect, getTopicPerformance);

/**
 * @route   GET /api/study/practice/:id
 * @desc    Get a specific practice session
 * @access  Private
 */
router.get('/practice/:id', protect, getPracticeSessionById);

/**
 * @route   DELETE /api/study/practice/:id
 * @desc    Delete a practice session
 * @access  Private
 */
router.delete('/practice/:id', protect, deletePracticeSession);

// ============================================
// ADDITIONAL STUDY ROUTES
// ============================================

/**
 * @route   GET /api/study/subjects
 * @desc    Get subject-wise performance summary
 * @access  Private
 */
router.get('/subjects', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // This would be implemented in the controller
    // For now, return a placeholder
    res.json({
      success: true,
      subjects: {
        physics: { accuracy: 0, sessions: 0, topics: 0 },
        chemistry: { accuracy: 0, sessions: 0, topics: 0 },
        math: { accuracy: 0, sessions: 0, topics: 0 },
        biology: { accuracy: 0, sessions: 0, topics: 0 }
      }
    });
  } catch (error) {
    console.error('❌ Subjects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subject performance'
    });
  }
});

/**
 * @route   GET /api/study/weekly
 * @desc    Get weekly study summary
 * @access  Private
 */
router.get('/weekly', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // This would be implemented in the controller
    res.json({
      success: true,
      weekly: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        hours: [0, 0, 0, 0, 0, 0, 0],
        total: 0,
        average: 0
      }
    });
  } catch (error) {
    console.error('❌ Weekly error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weekly summary'
    });
  }
});

/**
 * @route   GET /api/study/streak
 * @desc    Get study streak information
 * @access  Private
 */
router.get('/streak', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // This would be implemented in the controller
    res.json({
      success: true,
      streak: {
        current: 0,
        longest: 0,
        lastStudyDate: null
      }
    });
  } catch (error) {
    console.error('❌ Streak error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get streak information'
    });
  }
});

module.exports = router;