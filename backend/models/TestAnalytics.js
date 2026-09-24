const mongoose = require('mongoose');

const testAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  testName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  subject: {
    type: String,
    required: true,
    enum: ['physics', 'chemistry', 'math', 'biology', 'mixed'],
    index: true
  },
  testType: {
    type: String,
    enum: ['practice', 'mock', 'sectional', 'full-length'],
    default: 'practice'
  },
  totalQuestions: { type: Number, required: true, min: 1 },
  attempted: { type: Number, required: true, min: 0 },
  correct: { type: Number, required: true, min: 0 },
  incorrect: { type: Number, required: true, min: 0 },
  skipped: { type: Number, required: true, min: 0 },
  score: { type: Number, min: 0, default: 0 },
  percentage: { type: Number, min: 0, max: 100, default: 0 },
  timeSpentMinutes: { type: Number, min: 0, default: 0 },
  topicBreakdown: [{
    topic: { type: String, required: true, trim: true },
    attempted: { type: Number, min: 0, default: 0 },
    correct: { type: Number, min: 0, default: 0 },
    percentage: { type: Number, min: 0, max: 100, default: 0 }
  }],
  takenAt: { type: Date, default: Date.now, index: true },
  notes: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true });

testAnalyticsSchema.pre('validate', function() {
  this.attempted = Math.min(this.totalQuestions, this.attempted);
  this.skipped = Math.max(0, this.totalQuestions - this.attempted);
  this.incorrect = Math.max(0, this.attempted - this.correct);
  this.percentage = this.totalQuestions ? Math.round((this.correct / this.totalQuestions) * 10000) / 100 : 0;
  this.score = this.correct;
});

testAnalyticsSchema.index({ userId: 1, takenAt: -1 });

testAnalyticsSchema.virtual('accuracy').get(function() {
  return this.attempted ? Math.round((this.correct / this.attempted) * 10000) / 100 : 0;
});

testAnalyticsSchema.set('toJSON', { virtuals: true });

testAnalyticsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TestAnalytics', testAnalyticsSchema);
