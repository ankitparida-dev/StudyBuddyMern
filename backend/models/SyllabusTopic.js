const mongoose = require('mongoose');

const syllabusTopicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['physics', 'chemistry', 'math', 'biology'],
    index: true
  },
  chapter: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started',
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedMinutes: {
    type: Number,
    min: 0,
    default: 0
  },
  completedAt: Date,
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  }
}, { timestamps: true });

syllabusTopicSchema.index({ userId: 1, subject: 1, chapter: 1, name: 1 }, { unique: true });

syllabusTopicSchema.pre('save', function() {
  if (this.progress >= 100) {
    this.progress = 100;
    this.status = 'completed';
    this.completedAt = this.completedAt || new Date();
  } else if (this.progress > 0 && this.status === 'not-started') {
    this.status = 'in-progress';
  }
});

module.exports = mongoose.model('SyllabusTopic', syllabusTopicSchema);
