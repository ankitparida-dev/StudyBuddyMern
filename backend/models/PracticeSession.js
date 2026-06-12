const mongoose = require('mongoose');

const practiceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['physics', 'chemistry', 'math', 'biology']
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 0
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  notes: {
    type: String,
    default: ''
  },
  questions: [{
    questionText: String,
    correct: Boolean,
    timeSpent: Number
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
practiceSessionSchema.index({ userId: 1, date: -1 });
practiceSessionSchema.index({ userId: 1, subject: 1 });
practiceSessionSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);