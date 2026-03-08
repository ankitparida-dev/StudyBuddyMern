const StudySession = require('../models/StudySession');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get current date ranges
    const now = new Date();
    
    // Start of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Start of this week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get today's sessions
    const todaySessions = await StudySession.find({
      userId,
      date: { $gte: startOfDay }
    });
    
    const todayTotal = todaySessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Get this week's sessions
    const weekSessions = await StudySession.find({
      userId,
      date: { $gte: startOfWeek }
    });
    
    const weekTotal = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Get this month's sessions
    const monthSessions = await StudySession.find({
      userId,
      date: { $gte: startOfMonth }
    });
    
    const monthTotal = monthSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Get ALL sessions for subject totals
    const allSessions = await StudySession.find({ userId });
    
    // Calculate subject-wise totals
    const subjectTotals = {};
    allSessions.forEach(session => {
      if (!subjectTotals[session.subject]) {
        subjectTotals[session.subject] = 0;
      }
      subjectTotals[session.subject] += session.duration;
    });
    
    // Calculate grand total
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Return COMPLETE stats object
    res.json({
      today: {
        minutes: todayTotal,
        hours: Math.round(todayTotal / 60 * 10) / 10,
        sessions: todaySessions.length
      },
      week: {
        minutes: weekTotal,
        hours: Math.round(weekTotal / 60 * 10) / 10,
        sessions: weekSessions.length
      },
      month: {
        minutes: monthTotal,
        hours: Math.round(monthTotal / 60 * 10) / 10,
        sessions: monthSessions.length
      },
      subjects: subjectTotals,
      total: {
        minutes: totalMinutes,
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        sessions: allSessions.length
      }
    });
    
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get subject progress
// @route   GET /api/dashboard/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get last 30 days of sessions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    const sessions = await StudySession.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });
    
    // Group by date for daily progress
    const dailyProgress = {};
    sessions.forEach(session => {
      const dateStr = session.date.toISOString().split('T')[0];
      if (!dailyProgress[dateStr]) {
        dailyProgress[dateStr] = 0;
      }
      dailyProgress[dateStr] += session.duration;
    });
    
    // Convert to array format for charts
    const progressData = Object.entries(dailyProgress).map(([date, minutes]) => ({
      date,
      minutes,
      hours: Math.round(minutes / 60 * 10) / 10
    }));
    
    // Calculate subject distribution
    const subjectDistribution = {};
    sessions.forEach(session => {
      if (!subjectDistribution[session.subject]) {
        subjectDistribution[session.subject] = 0;
      }
      subjectDistribution[session.subject] += session.duration;
    });
    
    // Calculate totals
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const uniqueDays = new Set(sessions.map(s => s.date.toISOString().split('T')[0])).size;
    
    res.json({
      daily: progressData,
      subjects: subjectDistribution,
      total: {
        days: uniqueDays,
        minutes: totalMinutes,
        hours: Math.round(totalMinutes / 60 * 10) / 10
      }
    });
    
  } catch (error) {
    console.error('Dashboard Progress Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get study streaks
// @route   GET /api/dashboard/streaks
// @access  Private
const getStreaks = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all sessions sorted by date
    const sessions = await StudySession.find({ userId }).sort({ date: 1 });
    
    // Create a map of dates with sessions
    const sessionDates = new Set();
    sessions.forEach(session => {
      const dateStr = session.date.toISOString().split('T')[0];
      sessionDates.add(dateStr);
    });
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (sessionDates.has(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const allDates = Array.from(sessionDates).sort();
    
    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(allDates[i-1]);
        const currDate = new Date(allDates[i]);
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // Get weekly activity (last 7 days)
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
        studied: sessionDates.has(dateStr),
        minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        sessions: daySessions.length
      });
    }
    
    res.json({
      currentStreak,
      longestStreak,
      totalStudyDays: sessionDates.size,
      weekly
    });
    
  } catch (error) {
    console.error('Dashboard Streaks Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a test study session
// @route   POST /api/dashboard/test-session
// @access  Private
const addTestSession = async (req, res) => {
  try {
    const { subject, duration } = req.body;
    
    if (!subject || !duration) {
      return res.status(400).json({ message: 'Subject and duration are required' });
    }
    
    const session = await StudySession.create({
      userId: req.user._id,
      subject: subject,
      duration: duration,
      date: new Date()
    });
    
    res.status(201).json(session);
  } catch (error) {
    console.error('Add Test Session Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export all functions
module.exports = {
  getStats,
  getProgress,
  getStreaks,
  addTestSession
};