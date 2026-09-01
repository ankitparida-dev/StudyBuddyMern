const mongoose = require('mongoose');

// ============================================
// Question Sub-Schema
// ============================================
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question cannot exceed 1000 characters']
  },
  options: {
    type: [String],
    default: [],
    validate: {
      validator: function(value) {
        return value.length <= 6;
      },
      message: 'Cannot have more than 6 options'
    }
  },
  correctAnswer: {
    type: String,
    trim: true
  },
  userAnswer: {
    type: String,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: [0, 'Time spent cannot be negative'],
    max: [600, 'Time spent cannot exceed 600 seconds']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topic: {
    type: String,
    trim: true
  },
  subtopic: {
    type: String,
    trim: true
  },
  hintsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  isSkipped: {
    type: Boolean,
    default: false
  },
  markedForReview: {
    type: Boolean,
    default: false
  }
}, {
  _id: true,
  timestamps: false
});

// ============================================
// Practice Session Schema
// ============================================
const practiceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['physics', 'chemistry', 'math', 'biology', 'general'],
    index: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [100, 'Topic cannot exceed 100 characters'],
    index: true
  },
  subtopic: {
    type: String,
    trim: true,
    maxlength: [100, 'Subtopic cannot exceed 100 characters']
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: [0, 'Total questions cannot be negative'],
    default: 0
  },
  attemptedQuestions: {
    type: Number,
    default: 0,
    min: [0, 'Attempted questions cannot be negative']
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: [0, 'Correct answers cannot be negative'],
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0,
    min: [0, 'Wrong answers cannot be negative']
  },
  skippedQuestions: {
    type: Number,
    default: 0,
    min: [0, 'Skipped questions cannot be negative']
  },
  accuracy: {
    type: Number,
    default: 0,
    min: [0, 'Accuracy cannot be negative'],
    max: [100, 'Accuracy cannot exceed 100']
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0,
    min: [0, 'Time spent cannot be negative'],
    max: [720, 'Time spent cannot exceed 720 minutes']
  },
  averageTimePerQuestion: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Average time cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  // Session type
  sessionType: {
    type: String,
    enum: ['practice', 'quiz', 'test', 'revision', 'mock'],
    default: 'practice',
    index: true
  },
  // Score tracking
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Percentage score
  percentageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Questions array
  questions: {
    type: [questionSchema],
    default: [],
    validate: {
      validator: function(value) {
        return value.length <= 200;
      },
      message: 'Cannot have more than 200 questions'
    }
  },
  // Metadata
  metadata: {
    type: {
      source: { type: String, enum: ['custom', 'ai-generated', 'imported'], default: 'custom' },
      tags: { type: [String], default: [] },
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
      isTimed: { type: Boolean, default: false },
      timeLimit: { type: Number, default: 0 },
      scoreGoal: { type: Number, default: 70 }
    },
    default: () => ({
      source: 'custom',
      tags: [],
      isCompleted: false,
      completedAt: null,
      isTimed: false,
      timeLimit: 0,
      scoreGoal: 70
    })
  },
  // Weak areas identified
  weakAreas: {
    type: [{
      topic: { type: String, required: true },
      accuracy: { type: Number, min: 0, max: 100 },
      questionsAttempted: { type: Number, default: 0 }
    }],
    default: []
  },
  // Notes
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// Indexes for Performance
// ============================================
practiceSessionSchema.index({ userId: 1, date: -1, subject: 1 });
practiceSessionSchema.index({ userId: 1, subject: 1, 'metadata.isCompleted': 1 });
practiceSessionSchema.index({ userId: 1, sessionType: 1, date: -1 });
practiceSessionSchema.index({ userId: 1, 'metadata.tags': 1 });

// ============================================
// Virtuals
// ============================================
practiceSessionSchema.virtual('totalAttempted').get(function() {
  return this.attemptedQuestions || 0;
});

practiceSessionSchema.virtual('completionRate').get(function() {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.attemptedQuestions / this.totalQuestions) * 100);
});

practiceSessionSchema.virtual('isPassed').get(function() {
  return this.accuracy >= 60;
});

practiceSessionSchema.virtual('performanceLabel').get(function() {
  const acc = this.accuracy;
  if (acc >= 90) return '🏆 Excellent';
  if (acc >= 75) return '🌟 Great';
  if (acc >= 60) return '📈 Good';
  if (acc >= 40) return '📚 Needs Improvement';
  return '💪 Practice More';
});

practiceSessionSchema.virtual('formattedTime').get(function() {
  const hours = Math.floor(this.timeSpent / 60);
  const minutes = this.timeSpent % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// ============================================
// Middleware
// ============================================
practiceSessionSchema.pre('save', function() {
  // Calculate accuracy
  if (this.totalQuestions > 0) {
    this.accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
    this.percentageScore = this.accuracy;
  } else {
    this.accuracy = 0;
    this.percentageScore = 0;
  }
  
  // Calculate attempted questions
  this.attemptedQuestions = this.correctAnswers + this.wrongAnswers;
  
  // Calculate average time per question
  if (this.attemptedQuestions > 0) {
    this.averageTimePerQuestion = Math.round((this.timeSpent * 60) / this.attemptedQuestions);
  }
  
  // Calculate score (if not set)
  if (this.score === 0 && this.totalQuestions > 0) {
    this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }
  
  // Check if completed
  if (this.attemptedQuestions >= this.totalQuestions && this.totalQuestions > 0) {
    this.metadata.isCompleted = true;
    if (!this.metadata.completedAt) {
      this.metadata.completedAt = new Date();
    }
  }
  
  // Update weak areas from questions
  this.updateWeakAreas();
  
});

// ============================================
// Instance Methods
// ============================================

// Add question
practiceSessionSchema.methods.addQuestion = function(questionData) {
  const question = {
    ...questionData,
    isCorrect: questionData.userAnswer === questionData.correctAnswer
  };
  
  this.questions.push(question);
  this.totalQuestions = this.questions.length;
  
  // Update stats
  this.correctAnswers = this.questions.filter(q => q.isCorrect).length;
  this.wrongAnswers = this.questions.filter(q => !q.isCorrect && !q.isSkipped).length;
  this.skippedQuestions = this.questions.filter(q => q.isSkipped).length;
  this.attemptedQuestions = this.correctAnswers + this.wrongAnswers;
  
  return question;
};

// Update weak areas
practiceSessionSchema.methods.updateWeakAreas = function() {
  const topicStats = {};
  
  this.questions.forEach(q => {
    const topic = q.topic || this.topic;
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, wrong: 0 };
    }
    if (q.isCorrect) {
      topicStats[topic].correct++;
    } else if (!q.isSkipped) {
      topicStats[topic].wrong++;
    }
  });
  
  this.weakAreas = Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      accuracy: stats.correct + stats.wrong > 0 
        ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
        : 0,
      questionsAttempted: stats.correct + stats.wrong
    }))
    .filter(area => area.accuracy < 60 && area.questionsAttempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy);
};

// Get question analysis
practiceSessionSchema.methods.getQuestionAnalysis = function() {
  const total = this.questions.length;
  const correct = this.questions.filter(q => q.isCorrect).length;
  const wrong = this.questions.filter(q => !q.isCorrect && !q.isSkipped).length;
  const skipped = this.questions.filter(q => q.isSkipped).length;
  const marked = this.questions.filter(q => q.markedForReview).length;
  
  return { total, correct, wrong, skipped, marked };
};

// Get topic breakdown
practiceSessionSchema.methods.getTopicBreakdown = function() {
  const topics = {};
  
  this.questions.forEach(q => {
    const topic = q.topic || this.topic;
    if (!topics[topic]) {
      topics[topic] = { correct: 0, wrong: 0, total: 0 };
    }
    topics[topic].total++;
    if (q.isCorrect) {
      topics[topic].correct++;
    } else if (!q.isSkipped) {
      topics[topic].wrong++;
    }
  });
  
  return Object.entries(topics).map(([topic, data]) => ({
    topic,
    ...data,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
  }));
};

// ============================================
// Static Methods
// ============================================

// Get user practice stats
practiceSessionSchema.statics.getUserStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalQuestions: { $sum: '$totalQuestions' },
        correctAnswers: { $sum: '$correctAnswers' },
        wrongAnswers: { $sum: '$wrongAnswers' },
        totalTime: { $sum: '$timeSpent' },
        avgAccuracy: { $avg: '$accuracy' },
        completedSessions: {
          $sum: { $cond: ['$metadata.isCompleted', 1, 0] }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalSessions: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalTime: 0,
    avgAccuracy: 0,
    completedSessions: 0
  };
  
  result.overallAccuracy = result.totalQuestions > 0
    ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
    : 0;
  
  return result;
};

// Get subject-wise stats
practiceSessionSchema.statics.getSubjectStats = async function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$subject',
        totalSessions: { $sum: 1 },
        totalQuestions: { $sum: '$totalQuestions' },
        correctAnswers: { $sum: '$correctAnswers' },
        wrongAnswers: { $sum: '$wrongAnswers' },
        avgAccuracy: { $avg: '$accuracy' },
        totalTime: { $sum: '$timeSpent' }
      }
    },
    {
      $project: {
        subject: '$_id',
        _id: 0,
        totalSessions: 1,
        totalQuestions: 1,
        correctAnswers: 1,
        wrongAnswers: 1,
        totalTime: 1,
        accuracy: {
          $cond: [
            { $eq: ['$totalQuestions', 0] },
            0,
            { $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }
          ]
        }
      }
    }
  ]);
};

// Get daily activity
practiceSessionSchema.statics.getDailyActivity = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        sessions: { $sum: 1 },
        questions: { $sum: '$totalQuestions' },
        correct: { $sum: '$correctAnswers' },
        time: { $sum: '$timeSpent' },
        accuracy: { $avg: '$accuracy' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Get recent sessions
practiceSessionSchema.statics.getRecentSessions = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .select('subject topic totalQuestions correctAnswers accuracy timeSpent date');
};

// Get weak topics
practiceSessionSchema.statics.getWeakTopics = async function(userId, threshold = 60) {
  const sessions = await this.find({ userId });
  const topicStats = {};
  
  sessions.forEach(session => {
    if (session.questions && session.questions.length > 0) {
      session.questions.forEach(q => {
        const topic = q.topic || session.topic;
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, wrong: 0 };
        }
        if (q.isCorrect) {
          topicStats[topic].correct++;
        } else if (!q.isSkipped) {
          topicStats[topic].wrong++;
        }
      });
    }
  });
  
  return Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      accuracy: stats.correct + stats.wrong > 0
        ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
        : 0,
      attempted: stats.correct + stats.wrong
    }))
    .filter(t => t.accuracy < threshold && t.attempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy);
};

// ============================================
// Export Model
// ============================================
module.exports = mongoose.model('PracticeSession', practiceSessionSchema);