const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

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

const requestGemini = async (input) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the backend');
  }

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({ model: GEMINI_MODEL, input }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API returned HTTP ${response.status}`);
  }

  const text = (data.steps || [])
    .filter((step) => step.type === 'model_output')
    .flatMap((step) => step.content || [])
    .filter((part) => part.type === 'text' && part.text)
    .map((part) => part.text)
    .join('\n')
    .trim();

  if (!text) throw new Error('Gemini returned no text response');
  return text;
};

/**
 * Get response from Gemini AI
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Optional chat history for context
 * @returns {Promise<string>} - The AI response
 */
const getGeminiResponse = async (userMessage, chatHistory = []) => {
  try {
    const history = chatHistory
      .filter((entry) => (entry.role === 'user' || entry.role === 'assistant') && entry.content)
      .slice(-10);
    const lastEntry = history[history.length - 1];
    if (lastEntry?.role === 'user' && lastEntry.content === userMessage) history.pop();

    const conversation = history
      .map((entry) => `${entry.role === 'assistant' ? 'StudyBuddy AI' : 'Student'}: ${entry.content}`)
      .join('\n');
    const prompt = [
      STUDY_ASSISTANT_PROMPT,
      conversation && `Conversation so far:\n${conversation}`,
      `Student: ${userMessage}`,
      'StudyBuddy AI:',
    ].filter(Boolean).join('\n\n');

    return await requestGemini(prompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Gemini request failed: ${error.message}`);
  }
};

/**
 * Get a simple response without chat history
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
const getSimpleResponse = async (userMessage) => {
  return getGeminiResponse(userMessage);
};

/**
 * Generate study plan based on user input
 * @param {string} examType - 'jee' or 'neet'
 * @param {string} subjects - Subjects to focus on
 * @param {number} duration - Duration in weeks
 * @returns {Promise<string>} - The AI generated study plan
 */
const generateStudyPlan = async (examType, subjects, duration = 4) => {
  return getGeminiResponse(`Create a detailed ${duration}-week study plan for ${examType.toUpperCase()} preparation. Focus subjects: ${subjects}. Include weekly topics, daily schedule, practice and revision, mock tests, and actionable tips.`);
};

/**
 * Explain a concept in simple terms
 * @param {string} concept - The concept to explain
 * @param {string} subject - The subject category
 * @returns {Promise<string>} - The explanation
 */
const explainConcept = async (concept, subject = 'general') => {
  return getGeminiResponse(`Explain "${concept}" in simple terms for a ${subject} student. Include a definition, key points, an example, common mistakes, and a practice tip.`);
};

/**
 * Solve a practice problem
 * @param {string} problem - The problem statement
 * @param {string} subject - The subject
 * @returns {Promise<string>} - Step-by-step solution
 */
const solveProblem = async (problem, subject = 'general') => {
  return getGeminiResponse(`Solve this ${subject} problem step by step. Explain the approach, show the working, state the final answer, and give the key takeaway.\n\nProblem: ${problem}`);
};

module.exports = { 
  getGeminiResponse,
  getSimpleResponse,
  generateStudyPlan,
  explainConcept,
  solveProblem
};