const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const Flashcard = require('../models/Flashcard');
const {
  extractTextFromPdf,
  chunkDocument,
  embedChunks,
  generateSummaryAndFlashcards,
  queryDocumentRAG,
} = require('../services/ragService');

/**
 * Upload and process a notes PDF document
 * Performs PDF parsing, text chunking, vector embedding, summary generation, and flashcard creation
 */
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No PDF file uploaded' });
  }

  const userId = req.user._id;
  const originalName = req.file.originalname || 'Notes.pdf';
  const title = (req.body.title || originalName.replace(/\.[^/.]+$/, '')).trim();
  const subject = ['physics', 'chemistry', 'math', 'biology', 'general'].includes(req.body.subject)
    ? req.body.subject
    : 'general';

  let doc = null;

  try {
    // 1. Parse text from uploaded PDF buffer
    const { fullText, pageCount, pages } = await extractTextFromPdf(req.file.buffer);

    // 2. Create document record in database
    doc = await Document.create({
      userId,
      title,
      subject,
      fileName: originalName,
      fileSize: req.file.size || req.file.buffer.length,
      mimeType: req.file.mimetype || 'application/pdf',
      pageCount,
      status: 'processing',
    });

    // 3. Chunk text into overlapping segments
    const rawChunks = chunkDocument(pages, { maxChunkLength: 800, overlap: 150 });

    if (rawChunks.length === 0) {
      throw new Error('Unable to extract meaningful text chunks from this document.');
    }

    // 4. Generate embeddings for each chunk
    const chunksWithEmbeddings = await embedChunks(rawChunks);

    // 5. Store chunks in database
    const chunkDocs = chunksWithEmbeddings.map((chunk) => ({
      documentId: doc._id,
      userId,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      text: chunk.text,
      embedding: chunk.embedding,
    }));
    await DocumentChunk.insertMany(chunkDocs);

    // 6. Generate AI Summary & Flashcards
    const aiResults = await generateSummaryAndFlashcards(fullText, {
      title,
      subject,
    });

    // 7. Store generated flashcards
    let createdFlashcards = [];
    if (aiResults.flashcards && aiResults.flashcards.length > 0) {
      const flashcardDocs = aiResults.flashcards.map((fc) => ({
        documentId: doc._id,
        userId,
        front: fc.front,
        back: fc.back,
        subject,
        topic: fc.topic || title,
        difficulty: ['easy', 'medium', 'hard'].includes(fc.difficulty) ? fc.difficulty : 'medium',
        mastered: false,
      }));
      createdFlashcards = await Flashcard.insertMany(flashcardDocs);
    }

    // 8. Update Document record to 'ready'
    doc.status = 'ready';
    doc.chunkCount = chunkDocs.length;
    doc.flashcardCount = createdFlashcards.length;
    doc.summary = {
      overview: aiResults.overview,
      keyTopics: aiResults.keyTopics,
      keyFormulas: aiResults.keyFormulas,
      bulletPoints: aiResults.bulletPoints,
      studyTips: aiResults.studyTips,
      rawSummary: aiResults.rawSummary,
    };
    await doc.save();

    return res.status(201).json({
      success: true,
      message: 'PDF notes processed, summarized, and flashcards generated successfully.',
      document: doc,
      flashcards: createdFlashcards,
    });
  } catch (error) {
    console.error('Document upload/processing error:', error);

    if (doc) {
      doc.status = 'failed';
      doc.error = error.message;
      await doc.save().catch(() => {});
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process document',
      documentId: doc?._id,
    });
  }
};

/**
 * List all documents uploaded by the current user
 */
const listDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single document details with its summary
 */
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    return res.json({ success: true, document });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a document along with all its chunks and flashcards
 */
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    await Promise.all([
      Document.deleteOne({ _id: document._id }),
      DocumentChunk.deleteMany({ documentId: document._id }),
      Flashcard.deleteMany({ documentId: document._id }),
    ]);

    return res.json({
      success: true,
      message: 'Document and its associated data were deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * RAG Query: Ask questions grounded in the uploaded notes
 */
const askDocumentQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    if (document.status !== 'ready') {
      return res.status(400).json({
        success: false,
        error: `Document is in "${document.status}" state and cannot be queried yet.`,
      });
    }

    // Retrieve all chunks with embeddings for this document
    const chunks = await DocumentChunk.find({ documentId: document._id })
      .select('chunkIndex pageNumber text embedding')
      .lean();

    if (!chunks.length) {
      return res.status(400).json({
        success: false,
        error: 'No indexed chunks found for this document.',
      });
    }

    const result = await queryDocumentRAG({
      question: question.trim(),
      chunks,
      documentTitle: document.title,
      subject: document.subject,
      topK: 4,
    });

    return res.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error('RAG Q&A error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * List flashcards for a specific document or all documents
 */
const listFlashcards = async (req, res) => {
  try {
    const query = { userId: req.user._id };
    if (req.params.id) {
      query.documentId = req.params.id;
    }
    if (req.query.subject) {
      query.subject = req.query.subject;
    }
    if (req.query.mastered !== undefined) {
      query.mastered = req.query.mastered === 'true';
    }

    const flashcards = await Flashcard.find(query).sort({ createdAt: 1 }).lean();

    return res.json({
      success: true,
      count: flashcards.length,
      flashcards,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Toggle mastered status on a flashcard
 */
const toggleFlashcardMastered = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.cardId,
      userId: req.user._id,
    });

    if (!flashcard) {
      return res.status(404).json({ success: false, error: 'Flashcard not found' });
    }

    flashcard.mastered = req.body.mastered !== undefined ? req.body.mastered : !flashcard.mastered;
    flashcard.reviewCount += 1;
    flashcard.lastReviewedAt = new Date();
    await flashcard.save();

    return res.json({
      success: true,
      flashcard,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Regenerate flashcards for an existing document
 */
const regenerateFlashcards = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const chunks = await DocumentChunk.find({ documentId: document._id })
      .sort({ chunkIndex: 1 })
      .select('text')
      .lean();

    const fullText = chunks.map((c) => c.text).join('\n\n');
    const aiResults = await generateSummaryAndFlashcards(fullText, {
      title: document.title,
      subject: document.subject,
    });

    if (!aiResults.flashcards || aiResults.flashcards.length === 0) {
      return res.status(500).json({ success: false, error: 'AI did not return new flashcards' });
    }

    // Delete existing un-mastered flashcards (or all existing for fresh deck)
    await Flashcard.deleteMany({ documentId: document._id });

    const newDocs = aiResults.flashcards.map((fc) => ({
      documentId: document._id,
      userId: req.user._id,
      front: fc.front,
      back: fc.back,
      subject: document.subject,
      topic: fc.topic || document.title,
      difficulty: ['easy', 'medium', 'hard'].includes(fc.difficulty) ? fc.difficulty : 'medium',
      mastered: false,
    }));

    const inserted = await Flashcard.insertMany(newDocs);

    document.flashcardCount = inserted.length;
    await document.save();

    return res.json({
      success: true,
      message: `Generated ${inserted.length} new flashcards`,
      flashcards: inserted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentById,
  deleteDocument,
  askDocumentQuestion,
  listFlashcards,
  toggleFlashcardMastered,
  regenerateFlashcards,
};

