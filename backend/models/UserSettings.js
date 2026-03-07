const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  language: {
    type: String,
    default: 'english',
    enum: ['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi']
  },
  dailyGoal: {
    type: Number,
    default: 4,
    min: 1,
    max: 12
  },
  pomodoroDuration: {
    type: Number,
    default: 25,
    min: 15,
    max: 60
  },
  breakDuration: {
    type: Number,
    default: 5,
    min: 5,
    max: 30
  },
  notifications: {
    type: Boolean,
    default: true
  },
  weeklyReport: {
    type: Boolean,
    default: true
  },
  aiRecommendations: {
    type: Boolean,
    default: true
  },
  distractionFree: {
    type: Boolean,
    default: false
  },
  autoPause: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // This line MUST be here
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);