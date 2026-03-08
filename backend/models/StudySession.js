const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
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
  duration: {
    type: Number,  // in minutes
    required: true,
    min: 1
  },
  date: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
studySessionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);