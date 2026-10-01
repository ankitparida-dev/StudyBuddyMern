const { GoogleGenerativeAI } = require('@google/generative-ai');

// ============================================
// Init Gemini client
// ============================================
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model chain — tries each until one works
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
];

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

// ============================================
// Core: chat with history and fallback
// ============================================
const getGeminiResponse = async (userMessage, chatHistory = []) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  // Clean history
  let history = (chatHistory || [])
    .filter((m) => m && m.role && m.content)
    .slice(0, -1)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  while (history.length && history[0].role !== 'user') history.shift();
  if (history.length && history[history.length - 1].role === 'user') history.pop();

  let lastError = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
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

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ Gemini response via "${modelName}"`);
      return text;
    } catch (err) {
      const msg = err?.message || String(err);
      console.warn(`⚠️ Model "${modelName}" failed: ${msg.slice(0, 150)}`);

      if (
        msg.includes('API key') ||
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED')
      ) {
        throw new Error('Invalid Gemini API key. Please check your .env file.');
      }
      lastError = err;
    }
  }

  console.error('❌ All Gemini models failed');
  throw new Error(
    `AI Service Error: ${lastError?.message || 'All models unavailable'}`
  );
};

// ============================================
// Simple one-shot (no history)
// ============================================
const getSimpleResponse = async (userMessage) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        systemInstruction: {
          role: 'system',
          parts: [{ text: STUDY_ASSISTANT_PROMPT }],
        },
      });
      const result = await model.generateContent(userMessage);
      return (await result.response).text();
    } catch (err) {
      console.warn(`⚠️ Simple "${modelName}" failed: ${err?.message?.slice(0, 100)}`);
    }
  }
  throw new Error('Failed to get AI response');
};

// ============================================
// Study plan
// ============================================
const generateStudyPlan = async (examType, subjects, duration = 4) => {
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
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
      return (await result.response).text();
    } catch (err) {
      console.warn(`⚠️ StudyPlan "${modelName}" failed: ${err?.message?.slice(0, 100)}`);
    }
  }
  throw new Error('Failed to generate study plan');
};

// ============================================
// Concept explainer
// ============================================
const explainConcept = async (concept, subject = 'general') => {
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
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
      return (await result.response).text();
    } catch (err) {
      console.warn(`⚠️ Explain "${modelName}" failed: ${err?.message?.slice(0, 100)}`);
    }
  }
  throw new Error('Failed to explain concept');
};

// ============================================
// Problem solver
// ============================================
const solveProblem = async (problem, subject = 'general') => {
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
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
      return (await result.response).text();
    } catch (err) {
      console.warn(`⚠️ Solve "${modelName}" failed: ${err?.message?.slice(0, 100)}`);
    }
  }
  throw new Error('Failed to solve problem');
};

module.exports = {
  getGeminiResponse,
  getSimpleResponse,
  generateStudyPlan,
  explainConcept,
  solveProblem,
};