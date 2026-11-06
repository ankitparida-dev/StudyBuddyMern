const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadDocument,
  listDocuments,
  getDocumentById,
  deleteDocument,
  askDocumentQuestion,
  listFlashcards,
  toggleFlashcardMastered,
  regenerateFlashcards,
} = require('../controllers/documentController');

const router = express.Router();

// Configure multer for PDF uploads (memory storage, max 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files (.pdf) are currently supported.'));
    }
  },
});

// All document and flashcard routes require authentication
router.use(protect);

// Document upload & library routes
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File is too large. Maximum PDF size is 15MB.',
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, uploadDocument);

router.get('/', listDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

// RAG Question & Answering grounded in notes
router.post('/:id/ask', askDocumentQuestion);

// Flashcards management
router.get('/:id/flashcards', listFlashcards);
router.post('/:id/regenerate-flashcards', regenerateFlashcards);
router.patch('/flashcards/:cardId/master', toggleFlashcardMastered);

// Global user flashcard review list
router.get('/flashcards/all', listFlashcards);

module.exports = router;

