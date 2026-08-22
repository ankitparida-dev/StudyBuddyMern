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
- Use markdown for better readability

Important topics you should know:
- Physics: mechanics, electromagnetism, optics, modern physics
- Chemistry: organic, inorganic, physical chemistry
- Mathematics: algebra, calculus, trigonometry, geometry
- Biology: human physiology, genetics, ecology, biotechnology

Format your responses using:
- **bold** for important terms
- Bullet points for lists
- Numbered steps for processes
- Code blocks for formulas`;

/**
 * Get response from Gemini AI
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Optional chat history for context
 * @returns {Promise<string>} - The AI response
 */
const getGeminiResponse = async (userMessage, chatHistory = []) => {
  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // ✅ FIXED: Use correct model name
    // Available models: gemini-pro, gemini-1.5-pro, gemini-1.5-flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", // or "gemini-1.5-flash" for faster responses
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40,
      }
    });

    // ✅ FIXED: Build chat history correctly
    const history = [
      {
        role: "user",
        parts: [{ text: STUDY_ASSISTANT_PROMPT }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I'm StudyBuddy AI, ready to help students with their JEE and NEET preparation!" }],
      },
    ];

    // ✅ FIXED: Add chat history if provided
    if (chatHistory && chatHistory.length > 0) {
      // Filter and format chat history
      const formattedHistory = chatHistory
        .filter(msg => msg.role && msg.content)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));
      
      // Add formatted history (skip first two if they already exist)
      if (formattedHistory.length > 0) {
        history.push(...formattedHistory);
      }
    }

    // Create a chat session
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
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
    } else if (error.message.includes('model')) {
      throw new Error('Model not available. Please check your API key and model name.');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error.message.includes('blocked')) {
      throw new Error('Request blocked by content safety filters. Please modify your question.');
    } else {
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }
};

/**
 * Get a simple response without chat history
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
const getSimpleResponse = async (userMessage) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `${STUDY_ASSISTANT_PROMPT}\n\nUser: ${userMessage}\n\nStudyBuddy AI:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Simple API Error:', error);
    throw new Error('Failed to get AI response');
  }
};

/**
 * Generate study plan based on user input
 * @param {string} examType - 'jee' or 'neet'
 * @param {string} subjects - Subjects to focus on
 * @param {number} duration - Duration in weeks
 * @returns {Promise<string>} - The AI generated study plan
 */
const generateStudyPlan = async (examType, subjects, duration = 4) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 4096,
      }
    });

    const prompt = `Create a detailed ${duration}-week study plan for ${examType.toUpperCase()} preparation.
    
    Focus subjects: ${subjects}
    
    Include:
    1. Weekly breakdown of topics
    2. Daily study schedule
    3. Practice and revision time
    4. Mock test schedule
    5. Tips for each subject
    
    Make it realistic and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Study Plan Generation Error:', error);
    throw new Error('Failed to generate study plan');
  }
};

/**
 * Explain a concept in simple terms
 * @param {string} concept - The concept to explain
 * @param {string} subject - The subject category
 * @returns {Promise<string>} - The explanation
 */
const explainConcept = async (concept, subject = 'general') => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `Explain "${concept}" in simple terms for a ${subject} student.
    
    Include:
    1. Simple definition
    2. Key points
    3. Example
    4. Common mistakes to avoid
    5. Practice tip
    
    Keep it clear and student-friendly.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Concept Explanation Error:', error);
    throw new Error('Failed to explain concept');
  }
};

/**
 * Solve a practice problem
 * @param {string} problem - The problem statement
 * @param {string} subject - The subject
 * @returns {Promise<string>} - Step-by-step solution
 */
const solveProblem = async (problem, subject = 'general') => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      }
    });

    const prompt = `Solve this ${subject} problem step-by-step:
    
    Problem: ${problem}
    
    Provide:
    1. Understanding the problem
    2. Approach
    3. Step-by-step solution
    4. Final answer
    5. Key takeaway`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Problem Solving Error:', error);
    throw new Error('Failed to solve problem');
  }
};

module.exports = { 
  getGeminiResponse,
  getSimpleResponse,
  generateStudyPlan,
  explainConcept,
  solveProblem
};