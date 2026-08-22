const mongoose = require('mongoose');

// ============================================
// User Settings Schema
// ============================================
const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  
  // ============================================
  // Language & Localization
  // ============================================
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'or', 'pa'],
    description: 'User interface language preference'
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
    description: 'User timezone for scheduling'
  },
  dateFormat: {
    type: String,
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    default: 'DD/MM/YYYY'
  },
  
  // ============================================
  // Study Preferences
  // ============================================
  dailyGoal: {
    type: Number,
    default: 4,
    min: [1, 'Daily goal must be at least 1 hour'],
    max: [24, 'Daily goal cannot exceed 24 hours'],
    description: 'Daily study goal in hours'
  },
  weeklyGoal: {
    type: Number,
    default: 20,
    min: [1, 'Weekly goal must be at least 1 hour'],
    max: [168, 'Weekly goal cannot exceed 168 hours'],
    description: 'Weekly study goal in hours'
  },
  preferredStudyTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'flexible'],
    default: 'morning',
    description: 'Preferred time of day for studying'
  },
  preferredSubjects: {
    type: [String],
    enum: ['physics', 'chemistry', 'math', 'biology'],
    default: [],
    description: 'Preferred subjects to focus on'
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
    default: 'intermediate',
    description: 'Preferred difficulty level'
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed'],
    default: 'mixed',
    description: 'Preferred learning style'
  },
  
  // ============================================
  // Timer Settings
  // ============================================
  pomodoroDuration: {
    type: Number,
    default: 25,
    min: [5, 'Pomodoro duration must be at least 5 minutes'],
    max: [60, 'Pomodoro duration cannot exceed 60 minutes'],
    description: 'Pomodoro study duration in minutes'
  },
  shortBreakDuration: {
    type: Number,
    default: 5,
    min: [1, 'Short break must be at least 1 minute'],
    max: [30, 'Short break cannot exceed 30 minutes'],
    description: 'Short break duration in minutes'
  },
  longBreakDuration: {
    type: Number,
    default: 15,
    min: [5, 'Long break must be at least 5 minutes'],
    max: [60, 'Long break cannot exceed 60 minutes'],
    description: 'Long break duration in minutes'
  },
  sessionsBeforeLongBreak: {
    type: Number,
    default: 4,
    min: [1, 'Must be at least 1 session'],
    max: [10, 'Cannot exceed 10 sessions'],
    description: 'Number of sessions before a long break'
  },
  autoStartBreaks: {
    type: Boolean,
    default: true,
    description: 'Automatically start breaks after sessions'
  },
  autoStartSessions: {
    type: Boolean,
    default: false,
    description: 'Automatically start next session after break'
  },
  
  // ============================================
  // Notification Settings
  // ============================================
  notifications: {
    type: {
      enabled: { type: Boolean, default: true },
      studyReminders: { type: Boolean, default: true },
      breakReminders: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      aiRecommendations: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      streakAlerts: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true }
    },
    default: () => ({
      enabled: true,
      studyReminders: true,
      breakReminders: true,
      weeklyReport: true,
      aiRecommendations: true,
      achievements: true,
      streakAlerts: true,
      goalReminders: true
    }),
    description: 'Notification preferences'
  },
  reminderSchedule: {
    type: {
      morning: { type: Boolean, default: true },
      afternoon: { type: Boolean, default: true },
      evening: { type: Boolean, default: false },
      customTimes: { type: [String], default: [] }
    },
    default: () => ({
      morning: true,
      afternoon: true,
      evening: false,
      customTimes: []
    }),
    description: 'Schedule for study reminders'
  },
  
  // ============================================
  // Theme & Appearance
  // ============================================
  theme: {
    mode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
      description: 'Theme mode preference'
    },
    accentColor: {
      type: String,
      enum: ['blue', 'purple', 'green', 'orange', 'pink', 'teal', 'red'],
      default: 'blue',
      description: 'Accent color preference'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
      description: 'Font size preference'
    },
    compactMode: {
      type: Boolean,
      default: false,
      description: 'Compact UI mode'
    }
  },
  
  // ============================================
  // Focus & Productivity
  // ============================================
  focusSettings: {
    distractionFree: {
      type: Boolean,
      default: true,
      description: 'Enable distraction-free mode'
    },
    autoPause: {
      type: Boolean,
      default: true,
      description: 'Auto-pause timer when inactive'
    },
    ambientSound: {
      type: String,
      enum: ['none', 'lofi', 'nature', 'white-noise', 'piano'],
      default: 'none',
      description: 'Ambient sound preference'
    },
    soundVolume: {
      type: Number,
      default: 30,
      min: [0, 'Volume must be at least 0'],
      max: [100, 'Volume cannot exceed 100'],
      description: 'Sound volume percentage'
    },
    blockWebsites: {
      type: [String],
      default: [],
      description: 'Websites to block during focus mode'
    },
    blockApps: {
      type: [String],
      default: [],
      description: 'Apps to block during focus mode'
    }
  },
  
  // ============================================
  // Privacy & Security
  // ============================================
  privacy: {
    showActivity: {
      type: Boolean,
      default: true,
      description: 'Show activity status to others'
    },
    shareProgress: {
      type: Boolean,
      default: false,
      description: 'Share progress with friends'
    },
    allowAnalytics: {
      type: Boolean,
      default: true,
      description: 'Allow anonymous usage analytics'
    },
    allowPersonalization: {
      type: Boolean,
      default: true,
      description: 'Allow personalized recommendations'
    }
  },
  
  // ============================================
  // Gamification
  // ============================================
  gamification: {
    showStreaks: { type: Boolean, default: true },
    showXP: { type: Boolean, default: true },
    showLeaderboard: { type: Boolean, default: true },
    showAchievements: { type: Boolean, default: true }
  },
  
  // ============================================
  // Customization
  // ============================================
  customTags: {
    type: [String],
    default: [],
    maxlength: [10, 'Cannot have more than 10 custom tags'],
    description: 'Custom tags for organizing study sessions'
  },
  customSubjects: {
    type: [String],
    default: [],
    maxlength: [10, 'Cannot have more than 10 custom subjects'],
    description: 'Custom subjects beyond the default ones'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// Indexes
// ============================================
userSettingsSchema.index({ userId: 1 });
userSettingsSchema.index({ 'theme.mode': 1 });
userSettingsSchema.index({ 'notifications.enabled': 1 });

// ============================================
// Virtuals
// ============================================
userSettingsSchema.virtual('isDarkMode').get(function() {
  if (this.theme.mode === 'dark') return true;
  if (this.theme.mode === 'system') {
    // System preference check handled client-side
    return false;
  }
  return false;
});

userSettingsSchema.virtual('totalFocusTime').get(function() {
  const total = this.pomodoroDuration * this.sessionsBeforeLongBreak;
  const breakTime = this.shortBreakDuration * (this.sessionsBeforeLongBreak - 1) + this.longBreakDuration;
  return total + breakTime;
});

userSettingsSchema.virtual('displayName').get(function() {
  // For UI display
  return `${this.pomodoroDuration}/${this.shortBreakDuration}`;
});

// ============================================
// Instance Methods
// ============================================

// Toggle a specific notification type
userSettingsSchema.methods.toggleNotification = function(type) {
  if (this.notifications[type] !== undefined) {
    this.notifications[type] = !this.notifications[type];
    return this;
  }
  return this;
};

// Toggle theme mode
userSettingsSchema.methods.toggleTheme = function() {
  const modes = ['light', 'dark', 'system'];
  const currentIndex = modes.indexOf(this.theme.mode);
  this.theme.mode = modes[(currentIndex + 1) % modes.length];
  return this;
};

// Add blocked website
userSettingsSchema.methods.addBlockedWebsite = function(url) {
  if (!this.focusSettings.blockWebsites.includes(url)) {
    this.focusSettings.blockWebsites.push(url);
  }
  return this;
};

// Remove blocked website
userSettingsSchema.methods.removeBlockedWebsite = function(url) {
  this.focusSettings.blockWebsites = this.focusSettings.blockWebsites.filter(w => w !== url);
  return this;
};

// Add custom tag
userSettingsSchema.methods.addCustomTag = function(tag) {
  if (!this.customTags.includes(tag) && this.customTags.length < 10) {
    this.customTags.push(tag);
  }
  return this;
};

// Remove custom tag
userSettingsSchema.methods.removeCustomTag = function(tag) {
  this.customTags = this.customTags.filter(t => t !== tag);
  return this;
};

// Get notification schedule
userSettingsSchema.methods.getNotificationSchedule = function() {
  const schedule = [];
  if (this.reminderSchedule.morning) schedule.push('morning');
  if (this.reminderSchedule.afternoon) schedule.push('afternoon');
  if (this.reminderSchedule.evening) schedule.push('evening');
  if (this.reminderSchedule.customTimes) {
    schedule.push(...this.reminderSchedule.customTimes);
  }
  return schedule;
};

// ============================================
// Static Methods
// ============================================

// Get or create settings
userSettingsSchema.statics.getOrCreate = async function(userId) {
  let settings = await this.findOne({ userId });
  
  if (!settings) {
    settings = new this({ userId });
    await settings.save();
  }
  
  return settings;
};

// Get users with specific theme
userSettingsSchema.statics.findByTheme = function(themeMode) {
  return this.find({ 'theme.mode': themeMode }).populate('userId', 'firstName lastName email');
};

// Get users with notifications enabled
userSettingsSchema.statics.findWithNotifications = function() {
  return this.find({ 'notifications.enabled': true }).populate('userId', 'firstName lastName email');
};

// Update all users' theme
userSettingsSchema.statics.updateThemeForUsers = async function(userIds, themeMode) {
  return this.updateMany(
    { userId: { $in: userIds } },
    { 'theme.mode': themeMode }
  );
};

// ============================================
// Export Model
// ============================================
module.exports = mongoose.model('UserSettings', userSettingsSchema);