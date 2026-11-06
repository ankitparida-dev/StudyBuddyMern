const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PDFParse } = require('pdf-parse');

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the backend');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const GENERATIVE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
];

const EMBEDDING_MODELS = [
  'gemini-embedding-001',
  'gemini-embedding-2',
];

/**
 * Extract text and page metadata from PDF buffer
 */
const extractTextFromPdf = async (buffer) => {
  let parser = null;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const totalPages = result.total || 1;
    const pages = (result.pages || []).map((p) => ({
      pageNumber: p.num || 1,
      text: (p.text || '').replace(/\r\n/g, '\n').trim(),
    }));

    const fullText = (result.text || pages.map((p) => p.text).join('\n\n')).trim();

    if (!fullText || fullText.length < 20) {
      throw new Error(
        'The uploaded PDF appears to be empty or contains scanned images without extractable text. Please upload a PDF with selectable text.'
      );
    }

    return {
      fullText,
      pageCount: totalPages,
      pages,
    };
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch (_) {}
    }
  }
};

/**
 * Split text into semantic chunks with overlap while preserving page context
 */
const chunkDocument = (pages, options = {}) => {
  const { maxChunkLength = 800, overlap = 150 } = options;
  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const text = page.text;
    if (!text) continue;

    if (text.length <= maxChunkLength) {
      chunks.push({
        chunkIndex: chunkIndex++,
        pageNumber: page.pageNumber,
        text,
      });
      continue;
    }

    // Split page into overlapping windows
    let start = 0;
    while (start < text.length) {
      let end = start + maxChunkLength;

      // Try not to cut in the middle of a sentence
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        if (breakPoint > start + maxChunkLength * 0.6) {
          end = breakPoint + 1;
        }
      } else {
        end = text.length;
      }

      const chunkText = text.slice(start, end).trim();
      if (chunkText.length > 30) {
        chunks.push({
          chunkIndex: chunkIndex++,
          pageNumber: page.pageNumber,
          text: chunkText,
        });
      }

      if (end >= text.length) break;
      start = Math.max(end - overlap, start + 1);
    }
  }

  return chunks;
};

/**
 * Generate embedding vector for a single text string
 */
const embedText = async (text) => {
  const genAI = getGeminiClient();
  let lastError = null;

  for (const modelName of EMBEDDING_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text.slice(0, 4000));
      return result.embedding.values;
    } catch (err) {
      lastError = err;
      console.warn(`[Embedding] model ${modelName} failed: ${err.message}`);
    }
  }

  throw new Error(`Embedding generation failed: ${lastError?.message}`);
};

/**
 * Generate embeddings for an array of chunks in controlled batches
 */
const embedChunks = async (chunks, batchSize = 5) => {
  const chunksWithEmbeddings = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchPromises = batch.map(async (chunk) => {
      try {
        const embedding = await embedText(chunk.text);
        return { ...chunk, embedding };
      } catch (err) {
        console.warn(`Failed embedding chunk ${chunk.chunkIndex}:`, err.message);
        return { ...chunk, embedding: [] };
      }
    });

    const embeddedBatch = await Promise.all(batchPromises);
    chunksWithEmbeddings.push(...embeddedBatch);
  }

  return chunksWithEmbeddings;
};

/**
 * Cosine similarity between two float vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || !vecA.length || !vecB.length || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Safely parse JSON from LLM response text
 */
const parseJsonFromResponse = (text) => {
  let clean = text.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  try {
    return JSON.parse(clean);
  } catch (err) {
    // Attempt to extract the first {...} block
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const substring = clean.substring(firstBrace, lastBrace + 1);
      return JSON.parse(substring);
    }
    throw err;
  }
};

/**
 * Generate document summary and flashcards using Gemini structured JSON
 */
const generateSummaryAndFlashcards = async (fullText, { title, subject = 'general' }) => {
  const genAI = getGeminiClient();

  // Truncate text if excessively long to stay well within token limits
  const maxContentChars = 35000;
  const content = fullText.length > maxContentChars
    ? fullText.slice(0, maxContentChars) + '\n\n[... Remaining content truncated for summary ...]'
    : fullText;

  const prompt = `You are StudyBuddy AI, an expert educational assistant for competitive exams (JEE, NEET, CBSE).
Analyze the following student study notes titled "${title}" (${subject} subject).

Extract comprehensive study assets and return ONLY a valid JSON object matching the exact schema below:

{
  "overview": "A clear, well-structured 2-3 paragraph executive summary explaining the main concepts covered, their significance, and foundational ideas.",
  "keyTopics": [
    "Topic or Sub-unit 1",
    "Topic or Sub-unit 2",
    "..."
  ],
  "keyFormulas": [
    "Formula 1: Description and variables (e.g., F = ma where F=force, m=mass, a=acceleration)",
    "Formula 2: ...",
    "..."
  ],
  "bulletPoints": [
    "High-yield takeaway 1",
    "High-yield takeaway 2",
    "High-yield takeaway 3",
    "..."
  ],
  "studyTips": [
    "Specific revision or problem-solving advice 1",
    "Common trap or mistake to avoid 2",
    "..."
  ],
  "flashcards": [
    {
      "front": "Clear question, definition prompt, or concept check",
      "back": "Concise, precise answer, explanation, or formula",
      "topic": "Specific subtopic or chapter concept",
      "difficulty": "easy"
    },
    {
      "front": "Question 2",
      "back": "Answer 2",
      "topic": "Subtopic",
      "difficulty": "medium"
    },
    {
      "front": "Question 3",
      "back": "Answer 3",
      "topic": "Subtopic",
      "difficulty": "hard"
    }
  ]
}

Guidelines:
- Provide 10 to 18 high-yield flashcards covering all key aspects of the notes.
- Ensure 'difficulty' is strictly one of: 'easy', 'medium', or 'hard'.
- Format formulas and terms cleanly.
- Keep answers concise and student-friendly.

STUDY NOTES CONTENT:
"""
${content}
"""`;

  let lastError = null;

  for (const modelName of GENERATIVE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 6000,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = parseJsonFromResponse(text);

      return {
        overview: parsed.overview || 'Summary generated from notes.',
        keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
        keyFormulas: Array.isArray(parsed.keyFormulas) ? parsed.keyFormulas : [],
        bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints : [],
        studyTips: Array.isArray(parsed.studyTips) ? parsed.studyTips : [],
        rawSummary: text,
        flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Summary/Flashcard generation] Model ${modelName} failed: ${err.message}`);
    }
  }

  throw new Error(`Failed to generate summary and flashcards: ${lastError?.message}`);
};

/**
 * RAG Query: retrieve top relevant chunks and synthesize grounded answer
 */
const queryDocumentRAG = async ({
  question,
  chunks,
  documentTitle,
  subject = 'general',
  topK = 4,
}) => {
  if (!chunks || chunks.length === 0) {
    throw new Error('No document chunks available for retrieval.');
  }

  // 1. Embed user question
  const questionEmbedding = await embedText(question);

  // 2. Score chunks by cosine similarity
  const scoredChunks = chunks
    .map((chunk) => {
      const score = cosineSimilarity(questionEmbedding, chunk.embedding);
      return {
        ...chunk,
        similarity: Math.round(score * 1000) / 1000,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  // 3. Take top K chunks
  const topChunks = scoredChunks.slice(0, topK);

  // 4. Construct grounded prompt
  const contextSnippet = topChunks
    .map(
      (c, idx) =>
        `[Source ${idx + 1} | Page ${c.pageNumber || 1} | Relevance ${(c.similarity * 100).toFixed(1)}%]:\n${c.text}`
    )
    .join('\n\n---\n\n');

  const ragPrompt = `You are StudyBuddy AI, an expert academic tutor for competitive exams (JEE/NEET).
A student is asking a question about their uploaded notes titled "${documentTitle}" (${subject}).

Answer the student's question based primarily and accurately on the provided context excerpts from their notes.
Cite the relevant source and page number when explaining (e.g. "According to Page 2...").
If the notes do not contain the complete answer, mention what the notes say first, and then supplement with standard academic knowledge while making it clear what was supplementary.
Format the response using clear Markdown, bullet points, bold key terms, and code blocks for formulas.

CONTEXT FROM NOTES:
"""
${contextSnippet}
"""

STUDENT QUESTION:
"${question}"

Provide a clear, detailed, step-by-step educational answer:`;

  const genAI = getGeminiClient();
  let lastError = null;

  for (const modelName of GENERATIVE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent(ragPrompt);
      const answer = result.response.text();

      return {
        answer,
        sources: topChunks.map((c) => ({
          pageNumber: c.pageNumber,
          text: c.text,
          similarity: c.similarity,
          chunkIndex: c.chunkIndex,
        })),
      };
    } catch (err) {
      lastError = err;
      console.warn(`[RAG Query] Model ${modelName} failed: ${err.message}`);
    }
  }

  throw new Error(`RAG synthesis failed: ${lastError?.message}`);
};

module.exports = {
  extractTextFromPdf,
  chunkDocument,
  embedText,
  embedChunks,
  cosineSimilarity,
  generateSummaryAndFlashcards,
  queryDocumentRAG,
};

