const mongoose = require('mongoose');

// ============================================
// Study Session Schema
// ============================================
const studySessionSchema = new mongoose.Schema({
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
    trim: true,
    maxlength: [100, 'Topic cannot exceed 100 characters'],
    index: true
  },
  subtopic: {
    type: String,
    trim: true,
    maxlength: [100, 'Subtopic cannot exceed 100 characters']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [720, 'Duration cannot exceed 720 minutes'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Duration must be a whole number'
    }
  },
  // Session type
  sessionType: {
    type: String,
    enum: ['study', 'practice', 'revision', 'test', 'focus', 'break'],
    default: 'study',
    index: true
  },
  // Focus level (1-10)
  focusLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Energy level (1-10)
  energyLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Mood tracking
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'tired', 'stressed', 'focused'],
    default: 'neutral'
  },
  // Distractions count
  distractions: {
    type: Number,
    default: 0,
    min: [0, 'Distractions cannot be negative'],
    max: [50, 'Distractions cannot exceed 50']
  },
  // Breaks taken during session
  breaksTaken: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  // Topics covered
  topicsCovered: {
    type: [String],
    default: []
  },
  // Resources used
  resources: {
    type: [{
      type: {
        type: String,
        enum: ['book', 'video', 'notes', 'article', 'practice', 'other'],
        default: 'other'
      },
      name: { type: String, trim: true },
      link: { type: String, trim: true },
      duration: { type: Number, default: 0 }
    }],
    default: []
  },
  // Notes from the session
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Key learnings
  keyLearnings: {
    type: [String],
    default: [],
    validate: {
      validator: function(value) {
        return value.length <= 10;
      },
      message: 'Cannot have more than 10 key learnings'
    }
  },
  // Questions that came up during study
  questions: {
    type: [{
      question: { type: String, required: true },
      answered: { type: Boolean, default: false },
      answer: { type: String }
    }],
    default: []
  },
  // Next steps
  nextSteps: {
    type: [String],
    default: []
  },
  // Completion status
  completed: {
    type: Boolean,
    default: true,
    index: true
  },
  // Completion notes
  completionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Completion notes cannot exceed 500 characters']
  },
  // Session goals achieved
  goalsAchieved: {
    type: [String],
    default: []
  },
  // Metadata
  metadata: {
    type: {
      environment: { 
        type: String, 
        enum: ['home', 'library', 'cafe', 'school', 'other'],
        default: 'home'
      },
      timeOfDay: { 
        type: String, 
        enum: ['morning', 'afternoon', 'evening', 'night'],
        default: 'morning'
      },
      isGroupStudy: { type: Boolean, default: false },
      participants: { type: [String], default: [] },
      tags: { type: [String], default: [] }
    },
    default: () => ({
      environment: 'home',
      timeOfDay: 'morning',
      isGroupStudy: false,
      participants: [],
      tags: []
    })
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
studySessionSchema.index({ userId: 1, date: -1, subject: 1 });
studySessionSchema.index({ userId: 1, sessionType: 1, date: -1 });
studySessionSchema.index({ userId: 1, completed: 1 });
studySessionSchema.index({ userId: 1, 'metadata.timeOfDay': 1 });
studySessionSchema.index({ userId: 1, 'metadata.tags': 1 });

// ============================================
// Virtuals
// ============================================
studySessionSchema.virtual('hours').get(function() {
  return this.duration / 60;
});

studySessionSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
});

studySessionSchema.virtual('focusScore').get(function() {
  return Math.round(((this.focusLevel || 5) / 10) * 100);
});

studySessionSchema.virtual('productivityScore').get(function() {
  const focusScore = (this.focusLevel || 5) / 10;
  const durationScore = Math.min(1, this.duration / 120);
  const distractionPenalty = Math.max(0, 1 - (this.distractions || 0) / 20);
  return Math.round(((focusScore * 0.5 + durationScore * 0.3 + distractionPenalty * 0.2) * 100));
});

studySessionSchema.virtual('isLongSession').get(function() {
  return this.duration >= 120;
});

studySessionSchema.virtual('isShortSession').get(function() {
  return this.duration < 30;
});

studySessionSchema.virtual('dayOfWeek').get(function() {
  return this.date.toLocaleDateString('en-US', { weekday: 'long' });
});

// ============================================
// Middleware
// ============================================
studySessionSchema.pre('save', function(next) {
  // Auto-set completed if session exists
  if (this.duration > 0) {
    this.completed = true;
  }
  
  // Set time of day automatically if not provided
  if (!this.metadata.timeOfDay) {
    const hour = new Date().getHours();
    if (hour < 12) this.metadata.timeOfDay = 'morning';
    else if (hour < 17) this.metadata.timeOfDay = 'afternoon';
    else if (hour < 21) this.metadata.timeOfDay = 'evening';
    else this.metadata.timeOfDay = 'night';
  }
  
  next();
});

// ============================================
// Instance Methods
// ============================================

// Add a topic covered
studySessionSchema.methods.addTopic = function(topic) {
  if (!this.topicsCovered.includes(topic)) {
    this.topicsCovered.push(topic);
  }
  return this;
};

// Add a key learning
studySessionSchema.methods.addKeyLearning = function(learning) {
  if (this.keyLearnings.length < 10 && !this.keyLearnings.includes(learning)) {
    this.keyLearnings.push(learning);
  }
  return this;
};

// Add a question
studySessionSchema.methods.addQuestion = function(question) {
  this.questions.push({ question, answered: false });
  return this;
};

// Answer a question
studySessionSchema.methods.answerQuestion = function(index, answer) {
  if (this.questions[index]) {
    this.questions[index].answered = true;
    this.questions[index].answer = answer;
  }
  return this;
};

// Add next step
studySessionSchema.methods.addNextStep = function(step) {
  if (!this.nextSteps.includes(step)) {
    this.nextSteps.push(step);
  }
  return this;
};

// Add resource
studySessionSchema.methods.addResource = function(type, name, link = '') {
  this.resources.push({ type, name, link, duration: 0 });
  return this;
};

// Add tag
studySessionSchema.methods.addTag = function(tag) {
  if (!this.metadata.tags.includes(tag)) {
    this.metadata.tags.push(tag);
  }
  return this;
};

// ============================================
// Static Methods
// ============================================

// Get user's study stats
studySessionSchema.statics.getUserStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate },
        completed: true
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' },
        maxDuration: { $max: '$duration' },
        minDuration: { $min: '$duration' },
        avgFocus: { $avg: '$focusLevel' },
        avgEnergy: { $avg: '$energyLevel' },
        totalDistractions: { $sum: '$distractions' },
        uniqueTopics: { $addToSet: '$topic' }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalSessions: 0,
    totalMinutes: 0,
    avgDuration: 0,
    maxDuration: 0,
    minDuration: 0,
    avgFocus: 0,
    avgEnergy: 0,
    totalDistractions: 0,
    uniqueTopics: []
  };
  
  result.totalHours = Math.round(result.totalMinutes / 60 * 10) / 10;
  result.uniqueTopicsCount = result.uniqueTopics?.length || 0;
  delete result.uniqueTopics;
  
  return result;
};

// Get subject-wise stats
studySessionSchema.statics.getSubjectStats = async function(userId) {
  return this.aggregate([
    {
      $match: { userId, completed: true }
    },
    {
      $group: {
        _id: '$subject',
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' },
        avgFocus: { $avg: '$focusLevel' },
        avgEnergy: { $avg: '$energyLevel' }
      }
    },
    {
      $project: {
        subject: '$_id',
        _id: 0,
        totalSessions: 1,
        totalMinutes: 1,
        avgDuration: { $round: ['$avgDuration', 0] },
        avgFocus: { $round: ['$avgFocus', 1] },
        avgEnergy: { $round: ['$avgEnergy', 1] },
        totalHours: { $round: [{ $divide: ['$totalMinutes', 60] }, 1] }
      }
    }
  ]);
};

// Get daily study activity
studySessionSchema.statics.getDailyActivity = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: startDate },
        completed: true
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$date' }
        },
        dayName: {
          $first: {
            $dateToString: { format: '%A', date: '$date' }
          }
        },
        sessions: { $sum: 1 },
        minutes: { $sum: '$duration' },
        avgFocus: { $avg: '$focusLevel' },
        avgEnergy: { $avg: '$energyLevel' },
        topics: { $addToSet: '$topic' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Get time-of-day analysis
studySessionSchema.statics.getTimeOfDayAnalysis = async function(userId) {
  return this.aggregate([
    {
      $match: { userId, completed: true }
    },
    {
      $group: {
        _id: '$metadata.timeOfDay',
        sessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
        avgFocus: { $avg: '$focusLevel' }
      }
    },
    {
      $project: {
        timeOfDay: '$_id',
        _id: 0,
        sessions: 1,
        totalMinutes: 1,
        totalHours: { $round: [{ $divide: ['$totalMinutes', 60] }, 1] },
        avgFocus: { $round: ['$avgFocus', 1] }
      }
    }
  ]);
};

// Get weekly streak
studySessionSchema.statics.getStreak = async function(userId) {
  const sessions = await this.find({ userId, completed: true })
    .sort({ date: -1 })
    .select('date');
  
  if (sessions.length === 0) return { current: 0, longest: 0 };
  
  // Get unique study days
  const studyDays = new Set();
  sessions.forEach(s => {
    const dateStr = s.date.toISOString().split('T')[0];
    studyDays.add(dateStr);
  });
  
  const sortedDays = Array.from(studyDays).sort();
  
  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (studyDays.has(dateStr)) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDays[i - 1]);
      const currDate = new Date(sortedDays[i]);
      const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  
  return { current: currentStreak, longest: longestStreak };
};

// Get recent sessions
studySessionSchema.statics.getRecentSessions = async function(userId, limit = 10) {
  return this.find({ userId, completed: true })
    .sort({ date: -1 })
    .limit(limit)
    .select('subject topic duration date focusLevel energyLevel');
};

// Get productivity insights
studySessionSchema.statics.getProductivityInsights = async function(userId) {
  const sessions = await this.find({ userId, completed: true })
    .select('duration focusLevel energyLevel distractions date');
  
  if (sessions.length === 0) {
    return { bestTime: null, avgProductivity: 0, bestFocus: 0 };
  }
  
  const totalSessions = sessions.length;
  const avgFocus = sessions.reduce((sum, s) => sum + (s.focusLevel || 5), 0) / totalSessions;
  const avgEnergy = sessions.reduce((sum, s) => sum + (s.energyLevel || 5), 0) / totalSessions;
  const avgDistractions = sessions.reduce((sum, s) => sum + (s.distractions || 0), 0) / totalSessions;
  
  // Find most productive time of day
  const timeOfDayStats = {};
  sessions.forEach(s => {
    const timeOfDay = s.metadata?.timeOfDay || 'morning';
    if (!timeOfDayStats[timeOfDay]) {
      timeOfDayStats[timeOfDay] = { total: 0, count: 0 };
    }
    timeOfDayStats[timeOfDay].total += s.duration;
    timeOfDayStats[timeOfDay].count++;
  });
  
  let bestTime = null;
  let bestTimeDuration = 0;
  Object.entries(timeOfDayStats).forEach(([time, stats]) => {
    const avg = stats.total / stats.count;
    if (avg > bestTimeDuration) {
      bestTimeDuration = avg;
      bestTime = time;
    }
  });
  
  return {
    bestTime,
    avgFocus: Math.round(avgFocus * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    avgDistractions: Math.round(avgDistractions * 10) / 10,
    totalSessions,
    avgDuration: Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions)
  };
};

// ============================================
// Export Model
// ============================================
module.exports = mongoose.model('StudySession', studySessionSchema);