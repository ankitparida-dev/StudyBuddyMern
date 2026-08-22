const Chat = require('../models/Chat');
const { getGeminiResponse } = require('../services/geminiService');

// ============================================
// Helper Functions
// ============================================
const getMockResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  
  const responses = {
    'hello|hi|hey': "Hello! I'm your StudyBuddy AI assistant. How can I help you with your studies today?",
    'physics': "Physics is fascinating! What specific topic would you like help with? I can explain concepts like mechanics, electromagnetism, thermodynamics, or quantum physics.",
    'chemistry': "Chemistry is all about understanding matter! I can help with organic chemistry, periodic table, chemical reactions, or solving numerical problems.",
    'math': "Mathematics is the language of science! I can help with calculus, algebra, trigonometry, or geometry. What topic are you working on?",
    'biology': "Biology explains life itself! I can help with cell biology, genetics, human physiology, or ecology. What would you like to know?",
    'study plan': "I'd be happy to help create a study plan! First, tell me your exam (JEE/NEET), available time per day, and weak subjects.",
    'jee': "For JEE preparation, focus on understanding concepts deeply, practice numerical problems regularly, and revise formulas daily. Which subject would you like help with?",
    'neet': "For NEET preparation, biology is key! Focus on NCERT thoroughly, practice diagrams, and understand concepts. Chemistry and Physics require regular numerical practice too."
  };

  for (const [pattern, response] of Object.entries(responses)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lowerMsg)) {
      return response;
    }
  }

  return `I understand you're asking about: "${message}". I'm here to help with your studies! Could you please provide more details about what you'd like to learn?`;
};

// ============================================
// Controller Functions
// ============================================

/**
 * @desc    Send a message and get AI response
 * @route   POST /api/chat/message
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    let session;

    // Find or create session
    if (sessionId) {
      session = await Chat.findOne({ _id: sessionId, userId: req.user._id });
    }

    if (!session) {
      // Create new session
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      session = new Chat({
        userId: req.user._id,
        title,
        messages: []
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get AI response
    let aiResponseText;
    try {
      // Try Gemini API first
      const chatHistory = session.messages.slice(-10);
      aiResponseText = await getGeminiResponse(message, chatHistory);
    } catch (geminiError) {
      console.warn('⚠️ Gemini API failed, using mock response:', geminiError.message);
      aiResponseText = getMockResponse(message);
    }

    // Add AI response
    const aiMessage = {
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date()
    };

    session.messages.push(aiMessage);
    await session.save();

    res.status(200).json({
      success: true,
      sessionId: session._id,
      message: aiMessage,
      session: {
        _id: session._id,
        title: session.title,
        messageCount: session.messages.length
      }
    });

  } catch (error) {
    console.error('❌ Chat Controller Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get response from AI assistant'
    });
  }
};

/**
 * @desc    Get all chat sessions for user
 * @route   GET /api/chat/history
 * @access  Private
 */
const getChatHistory = async (req, res) => {
  try {
    const sessions = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt messageCount');
    
    res.status(200).json({
      success: true,
      sessions: sessions || []
    });
  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load chat history'
    });
  }
};

/**
 * @desc    Get a specific chat session with all messages
 * @route   GET /api/chat/session/:sessionId
 * @access  Private
 */
const getChatSession = async (req, res) => {
  try {
    const session = await Chat.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('❌ Get session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load session'
    });
  }
};

/**
 * @desc    Create a new empty chat session
 * @route   POST /api/chat/session
 * @access  Private
 */
const createChatSession = async (req, res) => {
  try {
    const { title } = req.body;
    
    const session = await Chat.create({
      userId: req.user._id,
      title: title || 'New Chat',
      messages: []
    });
    
    res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Create session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create session'
    });
  }
};

/**
 * @desc    Update chat session title
 * @route   PUT /api/chat/session/:sessionId
 * @access  Private
 */
const updateSessionTitle = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const session = await Chat.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.user._id },
      { title },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Update session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update session'
    });
  }
};

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/chat/session/:sessionId
 * @access  Private
 */
const deleteChatSession = async (req, res) => {
  try {
    const session = await Chat.findOneAndDelete({
      _id: req.params.sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
      sessionId: req.params.sessionId
    });
  } catch (error) {
    console.error('❌ Delete session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete session'
    });
  }
};

/**
 * @desc    Delete all chat sessions for user
 * @route   DELETE /api/chat/clear
 * @access  Private
 */
const clearAllChats = async (req, res) => {
  try {
    const result = await Chat.deleteMany({ userId: req.user._id });
    
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount || 0} chat sessions`,
      deletedCount: result.deletedCount || 0
    });
  } catch (error) {
    console.error('❌ Clear all chats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear chats'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatSession,
  createChatSession,
  deleteChatSession,
  clearAllChats,
  updateSessionTitle
};