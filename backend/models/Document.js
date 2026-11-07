const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
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
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
      index: true,
    },
    error: {
      type: String,
      default: null,
    },
    summary: {
      overview: { type: String, default: '' },
      keyTopics: [{ type: String }],
      keyFormulas: [{ type: String }],
      bulletPoints: [{ type: String }],
      studyTips: [{ type: String }],
      rawSummary: { type: String, default: '' },
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    flashcardCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);

