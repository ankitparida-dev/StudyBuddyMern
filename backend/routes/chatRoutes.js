const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { getGeminiResponse } = require('../services/geminiService');
const ChatSession = require('../models/ChatSession');
const mongoose = require('mongoose');

// ============================================
// Validation Rules
// ============================================
const messageValidation = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters'),
  
  body('sessionId')
    .optional()
    .isString().withMessage('Session ID must be a string')
];

const sessionValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters')
];

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

// ============================================
// Helper Functions
// ============================================
const getUserId = (req) => {
  return req.user?._id || req.user?.id || 'anonymous';
};

const generateSessionTitle = (message) => {
  const words = message.split(' ');
  if (words.length <= 5) {
    return message.slice(0, 50);
  }
  return words.slice(0, 5).join(' ') + '...';
};

// ============================================
// ROUTES
// ============================================

/**
 * @route   GET /api/chat/history
 * @desc    Get all chat sessions for a user
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    
    const sessions = await ChatSession.find({ userId })
      .select('_id title createdAt updatedAt messageCount')
      .sort({ updatedAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      sessions: sessions || []
    });
    
  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load chat history'
    });
  }
});

/**
 * @route   GET /api/chat/session/:sessionId
 * @desc    Get a specific chat session
 * @access  Private
 */
router.get('/session/:sessionId', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { sessionId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }
    
    const session = await ChatSession.findOne({ 
      _id: sessionId, 
      userId 
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session
    });
    
  } catch (error) {
    console.error('❌ Get session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load session'
    });
  }
});

/**
 * @route   POST /api/chat/session
 * @desc    Create a new chat session
 * @access  Private
 */
router.post('/session', protect, validate(sessionValidation), async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title } = req.body;
    
    const session = new ChatSession({
      userId,
      title: title || 'New Chat',
      messages: [],
      messageCount: 0
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messageCount
      }
    });
    
  } catch (error) {
    console.error('❌ Create session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

/**
 * @route   PUT /api/chat/session/:sessionId
 * @desc    Rename a chat session
 * @access  Private
 */
router.put('/session/:sessionId', protect, validate(sessionValidation), async (req, res) => {
  try {
    const userId = getUserId(req);
    const { sessionId } = req.params;
    const { title } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { title: title.trim() },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        updatedAt: session.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Rename session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rename session'
    });
  }
});

/**
 * @route   POST /api/chat/message
 * @desc    Send a message and get AI response
 * @access  Private
 */
router.post('/message', protect, validate(messageValidation), async (req, res) => {
  try {
    const userId = getUserId(req);
    const { message, sessionId } = req.body;
    
    // Get or create session
    let session = null;
    let sessionExists = false;
    
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await ChatSession.findOne({ _id: sessionId, userId });
      if (session) {
        sessionExists = true;
      }
    }
    
    // If session doesn't exist, create one
    if (!session) {
      const title = generateSessionTitle(message);
      session = new ChatSession({
        userId,
        title,
        messages: [],
        messageCount: 0
      });
    }
    
    // Add user message to session
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(userMessage);
    session.messageCount = (session.messageCount || 0) + 1;
    session.updatedAt = new Date();
    
    // Save session to get _id if new
    if (!sessionExists) {
      await session.save();
    }
    
    // Get chat history for context (last 10 messages)
    const chatHistory = session.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Call Gemini API
    console.log('🤖 Calling Gemini API...');
    let aiResponseText;
    
    try {
      aiResponseText = await getGeminiResponse(message, chatHistory);
      console.log('✅ Gemini API response received');
    } catch (geminiError) {
      console.error('❌ Gemini API Error:', geminiError);
      aiResponseText = "I'm having trouble connecting to the AI service. Please try again in a moment. If the problem persists, please check your internet connection.";
    }
    
    // Add AI response to session
    const aiMessage = {
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(aiMessage);
    session.messageCount = (session.messageCount || 0) + 1;
    session.updatedAt = new Date();
    
    // Save session
    await session.save();
    
    res.json({
      success: true,
      sessionId: session._id,
      message: {
        role: 'assistant',
        content: aiResponseText,
        timestamp: aiMessage.timestamp
      }
    });
    
  } catch (error) {
    console.error('❌ Message error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get AI response'
    });
  }
});

/**
 * @route   DELETE /api/chat/session/:sessionId
 * @desc    Delete a chat session
 * @access  Private
 */
router.delete('/session/:sessionId', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { sessionId } = req.params;
    
    const result = await ChatSession.findOneAndDelete({ 
      _id: sessionId, 
      userId 
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete session'
    });
  }
});

/**
 * @route   DELETE /api/chat/clear
 * @desc    Clear all chat sessions for a user
 * @access  Private
 */
router.delete('/clear', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    
    const result = await ChatSession.deleteMany({ userId });
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount || 0} sessions`,
      deletedCount: result.deletedCount || 0
    });
    
  } catch (error) {
    console.error('❌ Clear chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chats'
    });
  }
});

/**
 * @route   GET /api/chat/stats
 * @desc    Get chat statistics
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    
    const totalSessions = await ChatSession.countDocuments({ userId });
    const totalMessages = await ChatSession.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);
    
    const recentSessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('_id title updatedAt messageCount');
    
    res.json({
      success: true,
      stats: {
        totalSessions,
        totalMessages: totalMessages[0]?.total || 0,
        recentSessions: recentSessions || []
      }
    });
    
  } catch (error) {
    console.error('❌ Chat stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat stats'
    });
  }
});

module.exports = router;