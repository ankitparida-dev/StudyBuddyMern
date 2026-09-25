const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model name — use this consistently everywhere
const MODEL_NAME = 'gemini-flash-latest';

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
 * Get response from Gemini AI (with proper history handling)
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Optional chat history [{role, content}]
 * @returns {Promise<string>} - The AI response
 */
const getGeminiResponse = async (userMessage, chatHistory = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40,
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: STUDY_ASSISTANT_PROMPT }],
      },
    });

    // Build history from prior messages, EXCLUDING the current user message
    // (because we send that via sendMessage)
    let history = (chatHistory || [])
      .filter((m) => m && m.role && m.content)
      .slice(0, -1) // drop the last message if it's the current user msg
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Gemini requires history to:
    //   1. Start with 'user'
    //   2. Alternate user → model → user → model
    //   3. End with 'model' before calling sendMessage
    while (history.length && history[0].role !== 'user') {
      history.shift();
    }
    if (history.length && history[history.length - 1].role === 'user') {
      history.pop();
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('❌ Gemini API Error:', error?.message || error);

    if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your .env file.');
    } else if (error.message?.includes('model')) {
      throw new Error('Model not available. Please check your API key and model name.');
    } else if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error.message?.includes('blocked')) {
      throw new Error('Request blocked by content safety filters. Please modify your question.');
    } else {
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }
};

/**
 * Get a simple one-shot response without chat history
 */
const getSimpleResponse = async (userMessage) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: STUDY_ASSISTANT_PROMPT }],
      },
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Gemini Simple API Error:', error?.message || error);
    throw new Error('Failed to get AI response');
  }
};

/**
 * Generate study plan based on user input
 */
const generateStudyPlan = async (examType, subjects, duration = 4) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 4096,
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: STUDY_ASSISTANT_PROMPT }],
      },
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
    console.error('❌ Study Plan Generation Error:', error?.message || error);
    throw new Error('Failed to generate study plan');
  }
};

/**
 * Explain a concept in simple terms
 */
const explainConcept = async (concept, subject = 'general') => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: STUDY_ASSISTANT_PROMPT }],
      },
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
    console.error('❌ Concept Explanation Error:', error?.message || error);
    throw new Error('Failed to explain concept');
  }
};

/**
 * Solve a practice problem step-by-step
 */
const solveProblem = async (problem, subject = 'general') => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
      systemInstruction: {
        role: 'system',
        parts: [{ text: STUDY_ASSISTANT_PROMPT }],
      },
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
    console.error('❌ Problem Solving Error:', error?.message || error);
    throw new Error('Failed to solve problem');
  }
};

module.exports = {
  getGeminiResponse,
  getSimpleResponse,
  generateStudyPlan,
  explainConcept,
  solveProblem,
};