const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    front: {
      type: String,
      required: true,
      trim: true,
    },
    back: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      enum: ['physics', 'chemistry', 'math', 'biology', 'general'],
      default: 'general',
      index: true,
    },
    topic: {
      type: String,
      default: 'General',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    mastered: {
      type: Boolean,
      default: false,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

flashcardSchema.index({ userId: 1, documentId: 1, mastered: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);

