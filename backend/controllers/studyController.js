const StudySession = require('../models/StudySession');
const Goal = require('../models/Goal');
const PracticeSession = require('../models/PracticeSession');

// ============================================
// Helper Functions
// ============================================
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const formatDuration = (minutes) => ({
  minutes,
  hours: Math.round(minutes / 60 * 10) / 10,
  display: minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`
});

// ============================================
// Controller Functions
// ============================================

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get date ranges
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get sessions for different time periods
    const [todaySessions, weekSessions, monthSessions, allSessions] = await Promise.all([
      StudySession.find({ userId, date: { $gte: startOfDay } }),
      StudySession.find({ userId, date: { $gte: startOfWeek } }),
      StudySession.find({ userId, date: { $gte: startOfMonth } }),
      StudySession.find({ userId })
    ]);
    
    // Calculate totals
    const calculateTotal = (sessions) => sessions.reduce((sum, s) => sum + s.duration, 0);
    
    const todayTotal = calculateTotal(todaySessions);
    const weekTotal = calculateTotal(weekSessions);
    const monthTotal = calculateTotal(monthSessions);
    const totalMinutes = calculateTotal(allSessions);
    
    // Calculate subject-wise totals
    const subjectTotals = {};
    allSessions.forEach(session => {
      const subject = session.subject || 'general';
      subjectTotals[subject] = (subjectTotals[subject] || 0) + session.duration;
    });
    
    res.json({
      success: true,
      today: {
        ...formatDuration(todayTotal),
        sessions: todaySessions.length
      },
      week: {
        ...formatDuration(weekTotal),
        sessions: weekSessions.length
      },
      month: {
        ...formatDuration(monthTotal),
        sessions: monthSessions.length
      },
      subjects: subjectTotals,
      total: {
        ...formatDuration(totalMinutes),
        sessions: allSessions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get stats'
    });
  }
};

/**
 * @desc    Get subject progress
 * @route   GET /api/dashboard/progress
 * @access  Private
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { start, end, days = 30 } = req.query;
    
    const dateRange = getDateRange(parseInt(days));
    
    const sessions = await StudySession.find({
      userId,
      date: { $gte: dateRange.start, $lte: dateRange.end }
    }).sort({ date: 1 });
    
    // Group by date
    const dailyProgress = {};
    sessions.forEach(session => {
      const dateStr = session.date.toISOString().split('T')[0];
      dailyProgress[dateStr] = (dailyProgress[dateStr] || 0) + session.duration;
    });
    
    const progressData = Object.entries(dailyProgress).map(([date, minutes]) => ({
      date,
      ...formatDuration(minutes)
    }));
    
    // Subject distribution
    const subjectDistribution = {};
    sessions.forEach(session => {
      const subject = session.subject || 'general';
      subjectDistribution[subject] = (subjectDistribution[subject] || 0) + session.duration;
    });
    
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const uniqueDays = new Set(sessions.map(s => s.date.toISOString().split('T')[0])).size;
    
    res.json({
      success: true,
      daily: progressData,
      subjects: subjectDistribution,
      total: {
        days: uniqueDays,
        ...formatDuration(totalMinutes),
        sessions: sessions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Dashboard Progress Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get progress'
    });
  }
};

/**
 * @desc    Get study streaks
 * @route   GET /api/dashboard/streaks
 * @access  Private
 */
const getStreaks = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const sessions = await StudySession.find({ userId }).sort({ date: 1 });
    
    // Get unique study dates
    const studyDates = new Set(
      sessions.map(s => s.date.toISOString().split('T')[0])
    );
    const sortedDates = Array.from(studyDates).sort();
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (studyDates.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // Weekly activity (last 7 days)
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => 
        s.date.toISOString().split('T')[0] === dateStr
      );
      
      weekly.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        studied: studyDates.has(dateStr),
        minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        sessions: daySessions.length
      });
    }
    
    res.json({
      success: true,
      currentStreak,
      longestStreak,
      totalStudyDays: studyDates.size,
      weekly
    });
    
  } catch (error) {
    console.error('❌ Dashboard Streaks Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get streaks'
    });
  }
};

/**
 * @desc    Add a test study session
 * @route   POST /api/dashboard/test-session
 * @access  Private
 */
const addTestSession = async (req, res) => {
  try {
    const { subject, duration, topic, notes } = req.body;
    
    if (!subject || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Subject and duration are required'
      });
    }
    
    if (duration < 1 || duration > 720) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 1 and 720 minutes'
      });
    }
    
    const session = await StudySession.create({
      userId: req.user._id,
      subject,
      topic: topic || 'general',
      duration,
      notes: notes || '',
      date: new Date()
    });
    
    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('❌ Add Test Session Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add test session'
    });
  }
};

const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Failed to create goal' });
  }
};

const getGoals = async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
  res.json({ success: true, goals });
};

const getGoalById = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: false });
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  res.json({ success: true, goal });
};

const updateGoal = async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDeleted: false },
    req.body,
    { new: true, runValidators: true }
  );
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  res.json({ success: true, goal });
};

const deleteGoal = async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  res.json({ success: true, message: 'Goal deleted successfully' });
};

const markComplete = async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDeleted: false },
    { completed: true, progress: 100, completedAt: new Date() },
    { new: true }
  );
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  res.json({ success: true, goal });
};

const markIncomplete = async (req, res) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, isDeleted: false },
    { completed: false, completedAt: null, progress: 0 },
    { new: true }
  );
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  res.json({ success: true, goal });
};

const savePracticeSession = async (req, res) => {
  try {
    const session = await PracticeSession.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message || 'Failed to save practice session' });
  }
};

const getPracticeSessions = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const sessions = await PracticeSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  res.json({ success: true, sessions, page, limit });
};

const getPracticeStats = async (req, res) => {
  const sessions = await PracticeSession.find({ userId: req.user._id });
  const totalQuestions = sessions.reduce((sum, session) => sum + session.totalQuestions, 0);
  const correctAnswers = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);
  res.json({ success: true, overview: { totalSessions: sessions.length, totalQuestions, correctAnswers, accuracy: totalQuestions ? Math.round(correctAnswers / totalQuestions * 100) : 0 } });
};

const getPracticeSessionById = async (req, res) => {
  const session = await PracticeSession.findOne({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, error: 'Practice session not found' });
  res.json({ success: true, session });
};

const deletePracticeSession = async (req, res) => {
  const session = await PracticeSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!session) return res.status(404).json({ success: false, error: 'Practice session not found' });
  res.json({ success: true, message: 'Practice session deleted successfully' });
};

const getTopicPerformance = async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.subject) filter.subject = req.query.subject;
  const sessions = await PracticeSession.find(filter);
  const topics = {};
  sessions.forEach(session => {
    if (!topics[session.topic]) topics[session.topic] = { sessions: 0, questions: 0, correct: 0 };
    topics[session.topic].sessions += 1;
    topics[session.topic].questions += session.totalQuestions;
    topics[session.topic].correct += session.correctAnswers;
  });
  res.json({ success: true, topics });
};

module.exports = {
  getStats,
  getProgress,
  getStreaks,
  addTestSession,
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  markComplete,
  markIncomplete,
  savePracticeSession,
  getPracticeSessions,
  getPracticeStats,
  getPracticeSessionById,
  deletePracticeSession,
  getTopicPerformance
};