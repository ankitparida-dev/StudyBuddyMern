const { getGeminiResponse } = require('../services/geminiService');

// @desc    Send message to Gemini AI
// @route   POST /api/chat
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await getGeminiResponse(message);
    
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get response from AI assistant'
    });
  }
};

module.exports = { sendMessage };