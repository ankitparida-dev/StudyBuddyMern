const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the backend');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// ============================================
// Model chain — tries each until one works.
// Only includes currently available + free-tier-friendly models.
// gemini-1.5-flash and gemini-1.5-pro are RETIRED — do not add them back.
// ============================================
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-flash-latest',
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

  // Clean history — Gemini requires user → model alternation, starting with user, ending with model
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
      const model = getGeminiClient().getGenerativeModel({
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

      // Only bail out immediately on true auth errors — not on 404/503
      if (
        msg.includes('API_KEY_INVALID') ||
        msg.includes('PERMISSION_DENIED') ||
        msg.includes('API key not valid')
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
// Simple one-shot (no history) — used by AI insights
// Uses generateContent REST endpoint
// ============================================
const getSimpleResponse = async (userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const models = [
    process.env.GEMINI_INSIGHT_MODEL,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
  ].filter(Boolean);
  const uniqueModels = [...new Set(models)];
  let lastError;

  for (const modelName of uniqueModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: STUDY_ASSISTANT_PROMPT }],
            },
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
          signal: controller.signal,
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          data.error?.message || `Gemini returned HTTP ${response.status}`;
        console.warn(
          `[Gemini insight] model=${modelName} status=${response.status}: ${message.slice(0, 160)}`
        );
        if (response.status === 401 || response.status === 403) {
          throw new Error(message);
        }
        lastError = new Error(message);
        continue;
      }

      const text = (data?.candidates?.[0]?.content?.parts || [])
        .map((p) => p.text)
        .filter(Boolean)
        .join('\n')
        .trim();
      if (!text) throw new Error('Gemini returned no text response');
      return text;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[Gemini insight] model=${modelName} timed out`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    `Gemini insight failed: ${lastError?.message || 'No configured model responded'}`
  );
};

// ============================================
// Study plan
// ============================================
const generateStudyPlan = async (examType, subjects, duration = 4) => {
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = getGeminiClient().getGenerativeModel({
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
      console.warn(
        `⚠️ StudyPlan "${modelName}" failed: ${err?.message?.slice(0, 100)}`
      );
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
      const model = getGeminiClient().getGenerativeModel({
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
      console.warn(
        `⚠️ Explain "${modelName}" failed: ${err?.message?.slice(0, 100)}`
      );
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
      const model = getGeminiClient().getGenerativeModel({
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
      console.warn(
        `⚠️ Solve "${modelName}" failed: ${err?.message?.slice(0, 100)}`
      );
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