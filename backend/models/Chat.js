const mongoose = require('mongoose');

// ============================================
// Message Schema
// ============================================
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: [true, 'Message role is required'],
    default: 'user'
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Additional metadata for messages
  metadata: {
    type: {
      subject: { type: String, enum: ['physics', 'chemistry', 'math', 'biology', 'general'] },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
      tokens: { type: Number, default: 0 }
    },
    default: {}
  },
  // For tracking message status
  status: {
    type: String,
    enum: ['sending', 'sent', 'received', 'error'],
    default: 'sent'
  }
}, {
  _id: true,
  timestamps: false
});

// ============================================
// Chat Session Schema
// ============================================
const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    default: 'New Chat',
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  messages: {
    type: [messageSchema],
    default: []
  },
  // Session metadata
  metadata: {
    type: {
      subject: { type: String, enum: ['physics', 'chemistry', 'math', 'biology', 'general'] },
      totalMessages: { type: Number, default: 0 },
      lastMessageAt: { type: Date },
      tags: { type: [String], default: [] },
      isPinned: { type: Boolean, default: false },
      isArchived: { type: Boolean, default: false }
    },
    default: () => ({
      totalMessages: 0,
      tags: [],
      isPinned: false,
      isArchived: false
    })
  },
  // For analytics
  stats: {
    type: {
      userMessages: { type: Number, default: 0 },
      assistantMessages: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 }
    },
    default: () => ({
      userMessages: 0,
      assistantMessages: 0,
      totalTokens: 0,
      averageResponseTime: 0
    })
  },
  // For soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  // For sharing/exporting
  isShared: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// Indexes for Performance
// ============================================
chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ userId: 1, 'metadata.isPinned': 1 });
chatSessionSchema.index({ userId: 1, 'metadata.isArchived': 1 });
chatSessionSchema.index({ userId: 1, isDeleted: 1 });
chatSessionSchema.index({ shareId: 1 }, { unique: true, sparse: true });

// ============================================
// Virtuals
// ============================================
chatSessionSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

chatSessionSchema.virtual('lastMessage').get(function() {
  if (!this.messages || this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

chatSessionSchema.virtual('userMessageCount').get(function() {
  if (!this.messages) return 0;
  return this.messages.filter(m => m.role === 'user').length;
});

chatSessionSchema.virtual('assistantMessageCount').get(function() {
  if (!this.messages) return 0;
  return this.messages.filter(m => m.role === 'assistant').length;
});

// ============================================
// Middleware
// ============================================

// Update timestamps and stats before save
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update metadata
  if (this.messages) {
    this.metadata.totalMessages = this.messages.length;
    this.metadata.lastMessageAt = this.messages.length > 0 
      ? this.messages[this.messages.length - 1].timestamp 
      : null;
    
    // Update stats
    this.stats.userMessages = this.messages.filter(m => m.role === 'user').length;
    this.stats.assistantMessages = this.messages.filter(m => m.role === 'assistant').length;
  }
  
  next();
});

// ============================================
// Instance Methods
// ============================================

// Add a message
chatSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  const message = {
    role,
    content,
    timestamp: new Date(),
    metadata,
    status: 'sent'
  };
  
  this.messages.push(message);
  this.updatedAt = new Date();
  
  // Update stats
  this.stats.totalTokens = (this.stats.totalTokens || 0) + (metadata.tokens || 0);
  
  return message;
};

// Get last N messages
chatSessionSchema.methods.getLastMessages = function(count = 10) {
  if (!this.messages || this.messages.length === 0) return [];
  return this.messages.slice(-count);
};

// Clear messages
chatSessionSchema.methods.clearMessages = function() {
  this.messages = [];
  this.metadata.totalMessages = 0;
  this.stats.userMessages = 0;
  this.stats.assistantMessages = 0;
  this.stats.totalTokens = 0;
  this.updatedAt = new Date();
};

// Toggle pin
chatSessionSchema.methods.togglePin = function() {
  this.metadata.isPinned = !this.metadata.isPinned;
  this.updatedAt = new Date();
  return this.metadata.isPinned;
};

// Toggle archive
chatSessionSchema.methods.toggleArchive = function() {
  this.metadata.isArchived = !this.metadata.isArchived;
  this.updatedAt = new Date();
  return this.metadata.isArchived;
};

// Generate share ID
chatSessionSchema.methods.generateShareId = function() {
  const crypto = require('crypto');
  this.shareId = crypto.randomBytes(16).toString('hex');
  this.isShared = true;
  this.updatedAt = new Date();
  return this.shareId;
};

// ============================================
// Static Methods
// ============================================

// Find user's active sessions
chatSessionSchema.statics.findUserSessions = function(userId, options = {}) {
  const { limit = 20, skip = 0, includeArchived = false, includeDeleted = false } = options;
  
  const filter = { userId };
  if (!includeDeleted) filter.isDeleted = false;
  if (!includeArchived) filter['metadata.isArchived'] = false;
  
  return this.find(filter)
    .sort({ 'metadata.isPinned': -1, updatedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Find or create session
chatSessionSchema.statics.findOrCreate = async function(userId, title = 'New Chat') {
  let session = await this.findOne({ userId, isDeleted: false, 'metadata.isArchived': false })
    .sort({ updatedAt: -1 })
    .limit(1);
  
  if (!session) {
    session = new this({
      userId,
      title,
      messages: []
    });
    await session.save();
  }
  
  return session;
};

// Get session stats
chatSessionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId, isDeleted: false } },
    { 
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMessages: { $sum: '$metadata.totalMessages' },
        avgMessages: { $avg: '$metadata.totalMessages' },
        pinnedCount: { $sum: { $cond: ['$metadata.isPinned', 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { totalSessions: 0, totalMessages: 0, avgMessages: 0, pinnedCount: 0 };
};

// ============================================
// Export Model
// ============================================
module.exports = mongoose.model('Chat', chatSessionSchema);