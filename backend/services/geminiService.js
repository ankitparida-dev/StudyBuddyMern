const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt to make Gemini act as a study assistant
const STUDY_ASSISTANT_PROMPT = `You are StudyBuddy AI, a helpful study assistant for JEE and NEET students.

Your role:
- Explain concepts clearly and simply
- Help solve problems step-by-step
- Suggest study strategies and tips
- Be encouraging and supportive
- Keep responses concise but informative

Important topics you should know:
- Physics: mechanics, electromagnetism, optics, modern physics
- Chemistry: organic, inorganic, physical chemistry
- Mathematics: algebra, calculus, trigonometry, geometry
- Biology: human physiology, genetics, ecology, biotechnology`;

const getGeminiResponse = async (userMessage) => {
  try {
    // Use the latest model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    // Create a chat session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: STUDY_ASSISTANT_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm ready to help students with their studies!" }],
        },
      ],
    });

    // Send user message and get response
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your .env file.');
    } else {
      throw new Error('Failed to get response from AI assistant');
    }
  }
};

module.exports = { getGeminiResponse };