const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ============================================
// User Schema
// ============================================
const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'First name must contain only letters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Last name must contain only letters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // Academic Information
  currentGrade: {
    type: String,
    required: [true, 'Current grade is required'],
    enum: ['Class 11', 'Class 12', 'Dropper']
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: ['JEE', 'NEET']
  },
  
  // Contact Information
  phone: {
    type: String,
    default: '',
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  alternateEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  
  // Profile
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // Last Activity
  lastLogin: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Password Reset
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  
  // Email Verification
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpire: {
    type: Date,
    select: false
  },
  
  // Preferences
  preferences: {
    preferredStudyTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning'
    },
    preferredSubjects: {
      type: [String],
      enum: ['physics', 'chemistry', 'math', 'biology'],
      default: []
    },
    dailyGoal: {
      type: Number,
      default: 4,
      min: [1, 'Daily goal must be at least 1 hour'],
      max: [24, 'Daily goal cannot exceed 24 hours']
    },
    weeklyGoal: {
      type: Number,
      default: 20,
      min: [1, 'Weekly goal must be at least 1 hour'],
      max: [168, 'Weekly goal cannot exceed 168 hours']
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
      default: 'reading'
    },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  
  // Settings
  settings: {
    pomodoroDuration: {
      type: Number,
      default: 25,
      min: [5, 'Pomodoro duration must be at least 5 minutes'],
      max: [60, 'Pomodoro duration cannot exceed 60 minutes']
    },
    shortBreakDuration: {
      type: Number,
      default: 5,
      min: [1, 'Break duration must be at least 1 minute'],
      max: [30, 'Break duration cannot exceed 30 minutes']
    },
    longBreakDuration: {
      type: Number,
      default: 15,
      min: [5, 'Long break duration must be at least 5 minutes'],
      max: [60, 'Long break duration cannot exceed 60 minutes']
    },
    notifications: {
      type: {
        enabled: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: true },
        aiRecommendations: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true }
      },
      default: () => ({
        enabled: true,
        reminders: true,
        weeklyReport: true,
        aiRecommendations: true,
        achievements: true
      })
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    focusMode: {
      type: {
        distractionFree: { type: Boolean, default: true },
        autoPause: { type: Boolean, default: true },
        ambientSound: { type: String, default: 'none' }
      },
      default: () => ({
        distractionFree: true,
        autoPause: true,
        ambientSound: 'none'
      })
    }
  },
  
  // Statistics
  stats: {
    totalStudyTime: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStudyDate: { type: Date, default: null },
    totalQuestionsAnswered: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    overallAccuracy: { type: Number, default: 0 }
  },
  
  // Achievements
  achievements: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    icon: { type: String, default: '🏆' }
  }],
  
  // Referral
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referrals: {
    type: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      joinedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  
  // Payment/Subscription
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiresAt: {
    type: Date,
    default: null
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'premium'],
    default: 'free'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// Indexes for Performance
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ isActive: 1, lastLogin: -1 });
userSchema.index({ 'stats.currentStreak': -1 });

// ============================================
// Virtuals
// ============================================
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isPremiumActive').get(function() {
  if (!this.isPremium || !this.premiumExpiresAt) return false;
  return new Date() < this.premiumExpiresAt;
});

userSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

userSchema.virtual('studyStats').get(function() {
  return {
    totalHours: Math.round(this.stats.totalStudyTime / 60),
    totalSessions: this.stats.totalSessions,
    currentStreak: this.stats.currentStreak,
    longestStreak: this.stats.longestStreak,
    overallAccuracy: this.stats.overallAccuracy
  };
});

// ============================================
// Middleware
// ============================================

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastActive on save
userSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

// Generate referral code
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate referral code
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate reset token
userSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpire = Date.now() + 3600000; // 1 hour
  return token;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpire = Date.now() + 86400000; // 24 hours
  return token;
};

// Update study stats
userSchema.methods.updateStudyStats = function(minutes) {
  this.stats.totalStudyTime += minutes;
  this.stats.totalSessions += 1;
  this.stats.lastStudyDate = new Date();
  
  // Update streak
  this.updateStreak();
  
  return this;
};

// Update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.stats.lastStudyDate) {
    this.stats.currentStreak = 1;
    this.stats.longestStreak = 1;
    return;
  }
  
  const lastStudy = new Date(this.stats.lastStudyDate);
  lastStudy.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Already studied today
    return;
  } else if (diffDays === 1) {
    // Consecutive day
    this.stats.currentStreak += 1;
  } else {
    // Streak broken
    this.stats.currentStreak = 1;
  }
  
  // Update longest streak
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
};

// Update accuracy
userSchema.methods.updateAccuracy = function(correct, total) {
  this.stats.totalQuestionsAnswered += total;
  this.stats.totalCorrectAnswers += correct;
  this.stats.overallAccuracy = this.stats.totalQuestionsAnswered > 0
    ? Math.round((this.stats.totalCorrectAnswers / this.stats.totalQuestionsAnswered) * 100)
    : 0;
  return this;
};

// Unlock achievement
userSchema.methods.unlockAchievement = function(id, name, description, icon = '🏆') {
  if (!this.achievements.find(a => a.id === id)) {
    this.achievements.push({ id, name, description, icon, unlockedAt: new Date() });
    return true;
  }
  return false;
};

// Check premium status
userSchema.methods.checkPremiumStatus = function() {
  if (this.isPremium && this.premiumExpiresAt && new Date() > this.premiumExpiresAt) {
    this.isPremium = false;
    this.subscriptionTier = 'free';
    this.premiumExpiresAt = null;
    return false;
  }
  return this.isPremium;
};

// ============================================
// Static Methods
// ============================================

// Find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Get top streak users
userSchema.statics.getTopStreaks = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'stats.currentStreak': -1 })
    .limit(limit)
    .select('firstName lastName stats.currentStreak');
};

// Get user statistics
userSchema.statics.getUserStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        premiumUsers: { $sum: { $cond: ['$isPremium', 1, 0] } },
        totalStudyTime: { $sum: '$stats.totalStudyTime' },
        totalSessions: { $sum: '$stats.totalSessions' },
        avgAccuracy: { $avg: '$stats.overallAccuracy' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalStudyTime: 0,
    totalSessions: 0,
    avgAccuracy: 0
  };
};

// Find users who haven't logged in recently
userSchema.statics.findInactive = function(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.find({
    isActive: true,
    lastLogin: { $lt: cutoff }
  });
};

// ============================================
// Export Model
// ============================================
module.exports = mongoose.model('User', userSchema);