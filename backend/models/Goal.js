const mongoose = require('mongoose');

// ============================================
// Goal Schema
// ============================================
const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['physics', 'chemistry', 'math', 'biology', 'general'],
    index: true
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Priority level
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  // Goal type
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    default: 'daily'
  },
  // Progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    validate: {
      validator: function(value) {
        return value >= 0 && value <= 100;
      },
      message: 'Progress must be between 0 and 100'
    }
  },
  // Target metrics
  target: {
    type: {
      value: { type: Number, default: 1 },
      unit: { 
        type: String, 
        enum: ['questions', 'chapters', 'hours', 'minutes', 'sessions', 'percent'],
        default: 'questions'
      },
      current: { type: Number, default: 0 }
    },
    default: () => ({
      value: 1,
      unit: 'questions',
      current: 0
    })
  },
  // Completed status
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  // Time tracking
  dueDate: {
    type: Date,
    default: null,
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'push'
    },
    time: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  // Tags for categorization
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(value) {
        return value.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  // Recurring goal
  recurring: {
    type: {
      enabled: { type: Boolean, default: false },
      frequency: { 
        type: String, 
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
      },
      interval: { type: Number, default: 1 },
      endDate: { type: Date, default: null },
      lastReset: { type: Date, default: null }
    },
    default: () => ({
      enabled: false,
      frequency: 'daily',
      interval: 1,
      endDate: null,
      lastReset: null
    })
  },
  // For soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  // For analytics
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  sessionsCompleted: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// Indexes for Performance
// ============================================
goalSchema.index({ userId: 1, completed: 1, isDeleted: 1 });
goalSchema.index({ userId: 1, dueDate: 1, isDeleted: 1 });
goalSchema.index({ userId: 1, priority: 1, completed: 1 });
goalSchema.index({ userId: 1, type: 1, completed: 1 });
goalSchema.index({ userId: 1, 'recurring.enabled': 1 });

// ============================================
// Virtuals
// ============================================
goalSchema.virtual('isOverdue').get(function() {
  if (this.completed || !this.dueDate) return false;
  return new Date() > this.dueDate;
});

goalSchema.virtual('daysRemaining').get(function() {
  if (this.completed || !this.dueDate) return null;
  const now = new Date();
  const diff = this.dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

goalSchema.virtual('progressPercent').get(function() {
  if (this.progress > 0) return this.progress;
  if (this.target.value > 0) {
    return Math.min(100, Math.round((this.target.current / this.target.value) * 100));
  }
  return this.completed ? 100 : 0;
});

goalSchema.virtual('status').get(function() {
  if (this.completed) return 'completed';
  if (this.isOverdue) return 'overdue';
  if (this.progressPercent > 0) return 'in-progress';
  return 'pending';
});

goalSchema.virtual('priorityLabel').get(function() {
  const labels = {
    high: '🔥 High',
    medium: '⚡ Medium',
    low: '💤 Low'
  };
  return labels[this.priority] || 'Medium';
});

// ============================================
// Middleware
// ============================================
goalSchema.pre('save', function() {
  // Auto-complete if progress reaches 100%
  if (this.progress >= 100 && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }
  
  // If completed, ensure completedAt is set
  if (this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // If not completed, clear completedAt
  if (!this.completed) {
    this.completedAt = null;
  }
  
});

// ============================================
// Instance Methods
// ============================================

// Update progress
goalSchema.methods.updateProgress = function(current) {
  this.target.current = current;
  if (this.target.value > 0) {
    this.progress = Math.min(100, Math.round((current / this.target.value) * 100));
  }
  return this.progress;
};

// Complete goal
goalSchema.methods.complete = function() {
  this.completed = true;
  this.completedAt = new Date();
  this.progress = 100;
  this.target.current = this.target.value;
  return this;
};

// Reset goal (for recurring)
goalSchema.methods.reset = function() {
  if (!this.recurring.enabled) return this;
  
  this.completed = false;
  this.completedAt = null;
  this.progress = 0;
  this.target.current = 0;
  this.recurring.lastReset = new Date();
  
  // Update due date for recurring
  if (this.dueDate) {
    const newDate = new Date(this.dueDate);
    switch (this.recurring.frequency) {
      case 'daily':
        newDate.setDate(newDate.getDate() + this.recurring.interval);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (7 * this.recurring.interval));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + this.recurring.interval);
        break;
    }
    this.dueDate = newDate;
  }
  
  return this;
};

// Add reminder
goalSchema.methods.addReminder = function(time, type = 'push') {
  this.reminders.push({ time, type, sent: false });
  return this;
};

// Add tag
goalSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag) && this.tags.length < 10) {
    this.tags.push(tag);
  }
  return this;
};

// Remove tag
goalSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this;
};

// ============================================
// Static Methods
// ============================================

// Get user's active goals
goalSchema.statics.getActive = function(userId, options = {}) {
  const { limit = 20, skip = 0, subject, priority } = options;
  
  const filter = { 
    userId, 
    isDeleted: false, 
    completed: false 
  };
  
  if (subject) filter.subject = subject;
  if (priority) filter.priority = priority;
  
  return this.find(filter)
    .sort({ priority: 1, dueDate: 1, createdAt: 1 })
    .skip(skip)
    .limit(limit);
};

// Get user's completed goals
goalSchema.statics.getCompleted = function(userId, options = {}) {
  const { limit = 20, skip = 0, days = 30 } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    userId,
    isDeleted: false,
    completed: true,
    completedAt: { $gte: startDate }
  })
    .sort({ completedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Get goal statistics
goalSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { 
      $match: { 
        userId, 
        isDeleted: false 
      } 
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { 
          $sum: { $cond: ['$completed', 1, 0] } 
        },
        pending: { 
          $sum: { $cond: ['$completed', 0, 1] } 
        },
        overdue: { 
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $not: ['$completed'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              }, 
              1, 
              0
            ]
          } 
        },
        highPriority: { 
          $sum: { 
            $cond: [
              { $eq: ['$priority', 'high'] }, 
              1, 
              0
            ]
          } 
        }
      }
    }
  ]);
  
  return stats[0] || { 
    total: 0, 
    completed: 0, 
    pending: 0, 
    overdue: 0, 
    highPriority: 0 
  };
};

// Get subject-wise stats
goalSchema.statics.getSubjectStats = async function(userId) {
  return this.aggregate([
    { 
      $match: { 
        userId, 
        isDeleted: false 
      } 
    },
    {
      $group: {
        _id: '$subject',
        total: { $sum: 1 },
        completed: { 
          $sum: { $cond: ['$completed', 1, 0] } 
        }
      }
    }
  ]);
};

// Find goals due soon
goalSchema.statics.findDueSoon = async function(userId, days = 3) {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  return this.find({
    userId,
    isDeleted: false,
    completed: false,
    dueDate: { $gte: now, $lte: future }
  }).sort({ dueDate: 1 });
};

// ============================================
// Export Model
// ============================================
module.exports = mongoose.model('Goal', goalSchema);