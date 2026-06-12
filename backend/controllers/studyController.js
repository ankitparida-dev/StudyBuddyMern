const Goal = require('../models/Goal');
const PracticeSession = require('../models/PracticeSession'); // ADD THIS

// ============================================
// GOAL FUNCTIONS (Your existing code)
// ============================================

// @desc    Create a new goal
// @route   POST /api/study/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { title, subject, description, dueDate } = req.body;

    // Validation
    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      subject,
      description: description || '',
      dueDate: dueDate || null
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all goals for user
// @route   GET /api/study/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const { completed, subject, sort } = req.query;
    
    // Build filter object
    const filter = { userId: req.user._id };
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    
    if (subject) {
      filter.subject = subject;
    }
    
    // Build sort object
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'dueDate') {
      sortOption = { dueDate: 1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'completed') {
      sortOption = { completed: 1, createdAt: -1 };
    }
    
    const goals = await Goal.find(filter).sort(sortOption);
    
    // Separate completed and pending goals
    const pending = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);
    
    res.json({
      all: goals,
      pending,
      completed: completedGoals,
      stats: {
        total: goals.length,
        pending: pending.length,
        completed: completedGoals.length
      }
    });
  } catch (error) {
    console.error('Get Goals Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single goal by ID
// @route   GET /api/study/goals/:id
// @access  Private
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Get Goal By ID Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/study/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const { title, subject, description, dueDate, completed } = req.body;
    
    // Find goal and verify ownership
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Update fields if provided
    if (title) goal.title = title;
    if (subject) goal.subject = subject;
    if (description !== undefined) goal.description = description;
    if (dueDate !== undefined) goal.dueDate = dueDate;
    
    // Handle completion status
    if (completed !== undefined) {
      if (completed && !goal.completed) {
        goal.completed = true;
        goal.completedAt = new Date();
      } else if (!completed && goal.completed) {
        goal.completed = false;
        goal.completedAt = null;
      }
    }
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Update Goal Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/study/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete Goal Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark goal as complete
// @route   PATCH /api/study/goals/:id/complete
// @access  Private
const markComplete = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { completed: true, completedAt: new Date() },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Mark Complete Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark goal as incomplete
// @route   PATCH /api/study/goals/:id/incomplete
// @access  Private
const markIncomplete = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { completed: false, completedAt: null },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Mark Incomplete Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// PRACTICE TRACKER FUNCTIONS (NEW for Day 8)
// ============================================

// @desc    Save a practice session
// @route   POST /api/study/practice
// @access  Private
const savePracticeSession = async (req, res) => {
  try {
    const { subject, topic, totalQuestions, correctAnswers, timeSpent, difficulty, notes, questions } = req.body;

    // Validation
    if (!subject || !topic || totalQuestions === undefined || correctAnswers === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (correctAnswers > totalQuestions) {
      return res.status(400).json({ message: 'Correct answers cannot exceed total questions' });
    }

    // Calculate accuracy
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const session = await PracticeSession.create({
      userId: req.user._id,
      subject,
      topic,
      totalQuestions,
      correctAnswers,
      accuracy,
      timeSpent: timeSpent || 0,
      difficulty: difficulty || 'mixed',
      notes: notes || '',
      questions: questions || []
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Save Practice Session Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all practice sessions for user
// @route   GET /api/study/practice
// @access  Private
const getPracticeSessions = async (req, res) => {
  try {
    const { subject, limit = 20, page = 1 } = req.query;
    
    const filter = { userId: req.user._id };
    if (subject) filter.subject = subject;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sessions = await PracticeSession.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await PracticeSession.countDocuments(filter);
    
    res.json({
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get Practice Sessions Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get practice stats (accuracy over time)
// @route   GET /api/study/practice/stats
// @access  Private
const getPracticeStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get sessions in date range
    const sessions = await PracticeSession.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    // Calculate overall stats
    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    
    // Subject-wise stats
    const subjectStats = {};
    sessions.forEach(session => {
      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          totalQuestions: 0,
          correctAnswers: 0,
          sessions: 0
        };
      }
      subjectStats[session.subject].totalQuestions += session.totalQuestions;
      subjectStats[session.subject].correctAnswers += session.correctAnswers;
      subjectStats[session.subject].sessions++;
    });
    
    // Calculate accuracy for each subject
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
    });
    
    // Daily accuracy trend
    const dailyTrend = {};
    sessions.forEach(session => {
      const dateStr = session.date.toISOString().split('T')[0];
      if (!dailyTrend[dateStr]) {
        dailyTrend[dateStr] = {
          totalQuestions: 0,
          correctAnswers: 0,
          sessions: 0
        };
      }
      dailyTrend[dateStr].totalQuestions += session.totalQuestions;
      dailyTrend[dateStr].correctAnswers += session.correctAnswers;
      dailyTrend[dateStr].sessions++;
    });
    
    const trendData = Object.entries(dailyTrend).map(([date, data]) => ({
      date,
      accuracy: data.totalQuestions > 0 ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0,
      questions: data.totalQuestions,
      sessions: data.sessions
    }));
    
    res.json({
      overview: {
        totalSessions: sessions.length,
        totalQuestions,
        totalCorrect,
        overallAccuracy,
        daysCovered: parseInt(days)
      },
      subjectWise: subjectStats,
      trend: trendData
    });
  } catch (error) {
    console.error('Get Practice Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single practice session by ID
// @route   GET /api/study/practice/:id
// @access  Private
const getPracticeSessionById = async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get Practice Session By ID Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a practice session
// @route   DELETE /api/study/practice/:id
// @access  Private
const deletePracticeSession = async (req, res) => {
  try {
    const session = await PracticeSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    res.json({ message: 'Practice session deleted successfully' });
  } catch (error) {
    console.error('Delete Practice Session Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get topic performance breakdown
// @route   GET /api/study/practice/topics
// @access  Private
const getTopicPerformance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject } = req.query;
    
    const filter = { userId };
    if (subject) filter.subject = subject;
    
    const sessions = await PracticeSession.find(filter);
    
    // Group by topic
    const topicStats = {};
    sessions.forEach(session => {
      if (!topicStats[session.topic]) {
        topicStats[session.topic] = {
          subject: session.subject,
          totalQuestions: 0,
          correctAnswers: 0,
          sessions: 0
        };
      }
      topicStats[session.topic].totalQuestions += session.totalQuestions;
      topicStats[session.topic].correctAnswers += session.correctAnswers;
      topicStats[session.topic].sessions++;
    });
    
    // Calculate accuracy for each topic
    const topics = Object.entries(topicStats).map(([topic, data]) => ({
      topic,
      subject: data.subject,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      sessions: data.sessions,
      accuracy: data.totalQuestions > 0 ? Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0
    }));
    
    // Sort by accuracy (lowest first - areas needing improvement)
    topics.sort((a, b) => a.accuracy - b.accuracy);
    
    res.json(topics);
  } catch (error) {
    console.error('Get Topic Performance Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  // Goal functions
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  markComplete,
  markIncomplete,
  
  // Practice Tracker functions (NEW)
  savePracticeSession,
  getPracticeSessions,
  getPracticeStats,
  getPracticeSessionById,
  deletePracticeSession,
  getTopicPerformance
};