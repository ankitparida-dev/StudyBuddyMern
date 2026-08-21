import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { dashboardAPI, userAPI, practiceAPI, planAPI } from '../services/api';

export const useDashboard = () => {
  const [data, setData] = useState({
    user: null,
    stats: null,
    progress: null,
    streaks: null,
    recentSessions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const abortControllerRef = useRef(null);

  // Mock data fallback
  const mockData = useMemo(() => ({
    user: { 
      firstName: 'Rahul', 
      lastName: 'Sharma',
      email: 'rahul@example.com',
      currentGrade: '12',
      examType: 'jee'
    },
    stats: {
      overview: {
        totalSessions: 12,
        totalQuestions: 85,
        totalCorrect: 68,
        overallAccuracy: 80,
        totalTime: 480,
        daysCovered: 7,
        currentStreak: 7,
        bestStreak: 15,
        weeklyProgress: 85,
        monthlyProgress: 72
      },
      subjectWise: {
        physics: { accuracy: 75, topicsCompleted: 12, totalTopics: 20 },
        chemistry: { accuracy: 65, topicsCompleted: 8, totalTopics: 18 },
        math: { accuracy: 55, topicsCompleted: 6, totalTopics: 15 },
        biology: { accuracy: 70, topicsCompleted: 10, totalTopics: 16 }
      }
    },
    progress: {
      physics: 60,
      chemistry: 45,
      math: 30,
      biology: 65,
      overall: 50
    },
    streaks: {
      current: 7,
      longest: 15,
      weekly: [true, true, true, true, true, false, false]
    },
    recentSessions: [
      { subject: 'Physics', accuracy: 85, timeSpent: 45, date: new Date().toISOString(), topics: ['Kinematics', 'Laws of Motion'] },
      { subject: 'Chemistry', accuracy: 72, timeSpent: 30, date: new Date().toISOString(), topics: ['Mole Concept', 'Atomic Structure'] },
      { subject: 'Mathematics', accuracy: 68, timeSpent: 60, date: new Date().toISOString(), topics: ['Trigonometry', 'Calculus'] }
    ],
    upcomingTests: [
      { subject: 'Physics', date: '2024-01-15', topics: ['Kinematics', 'Laws of Motion'] },
      { subject: 'Chemistry', date: '2024-01-20', topics: ['Mole Concept', 'Chemical Bonding'] }
    ],
    dailyGoal: {
      target: 4,
      progress: 2.5,
      percentage: 62
    }
  }), []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Set timeout
      const timeoutId = setTimeout(() => {
        console.log('Dashboard loading timeout - using mock data');
        setData(mockData);
        setUsingMockData(true);
        setLoading(false);
      }, 5000);

      // Fetch data with individual timeouts
      const fetchWithTimeout = async (promise, timeout = 3000) => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        );
        return Promise.race([promise, timeoutPromise]);
      };

      const [userData, statsData, progressData, streaksData, sessionsData] = await Promise.all([
        fetchWithTimeout(userAPI.getProfile().catch(() => null)),
        fetchWithTimeout(dashboardAPI.getStats().catch(() => null)),
        fetchWithTimeout(dashboardAPI.getProgress().catch(() => null)),
        fetchWithTimeout(dashboardAPI.getStreaks().catch(() => null)),
        fetchWithTimeout(practiceAPI.getSessions(1, 5).catch(() => null))
      ]);

      clearTimeout(timeoutId);

      // Check if any data was fetched
      const hasData = userData || statsData || progressData || streaksData || sessionsData?.sessions?.length > 0;

      if (hasData) {
        setData({
          user: userData || mockData.user,
          stats: statsData || mockData.stats,
          progress: progressData || mockData.progress,
          streaks: streaksData || mockData.streaks,
          recentSessions: sessionsData?.sessions || mockData.recentSessions,
          upcomingTests: statsData?.upcomingTests || mockData.upcomingTests,
          dailyGoal: statsData?.dailyGoal || mockData.dailyGoal
        });
        setUsingMockData(false);
      } else {
        setData(mockData);
        setUsingMockData(true);
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Dashboard request aborted');
        return;
      }
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
      setData(mockData);
      setUsingMockData(true);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [mockData]);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDashboardData, refreshCounter]);

  // Refresh dashboard
  const refreshDashboard = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  // Calculate combined metrics
  const combinedStats = useMemo(() => {
    const d = data;
    const overview = d.stats?.overview || {};
    const subjectWise = d.stats?.subjectWise || {};
    
    // Calculate accuracy from overview or subjectWise
    let accuracy = overview.overallAccuracy || d.stats?.accuracy || 0;
    if (!accuracy && Object.keys(subjectWise).length > 0) {
      const subjects = Object.values(subjectWise);
      accuracy = subjects.reduce((sum, s) => sum + (s.accuracy || 0), 0) / subjects.length;
    }
    
    return {
      totalHours: Math.round((overview.totalTime / 60) || d.stats?.totalHours || 0),
      totalMinutes: overview.totalTime || d.stats?.totalMinutes || 0,
      totalSessions: overview.totalSessions || d.stats?.totalSessions || d.recentSessions?.length || 0,
      accuracy: Math.round(accuracy),
      streak: d.streaks?.current || overview.currentStreak || 0,
      longestStreak: d.streaks?.longest || overview.bestStreak || 0,
      weeklyGoal: d.streaks?.weekly?.filter(w => w === true)?.length || 0,
      weeklyTotal: 7,
      physics: d.progress?.physics || subjectWise.physics?.topicsCompleted || 0,
      chemistry: d.progress?.chemistry || subjectWise.chemistry?.topicsCompleted || 0,
      math: d.progress?.math || subjectWise.math?.topicsCompleted || 0,
      biology: d.progress?.biology || subjectWise.biology?.topicsCompleted || 0,
      weeklyProgress: overview.weeklyProgress || 0,
      monthlyProgress: overview.monthlyProgress || 0,
      dailyGoal: d.dailyGoal || { target: 4, progress: 0, percentage: 0 },
      subjectWise: subjectWise
    };
  }, [data]);

  // Get subject performance
  const getSubjectPerformance = useCallback((subject) => {
    const subjectWise = data.stats?.subjectWise || {};
    return subjectWise[subject?.toLowerCase()] || { accuracy: 0, topicsCompleted: 0, totalTopics: 0 };
  }, [data]);

  // Get upcoming tests
  const upcomingTests = useMemo(() => {
    return data.upcomingTests || [];
  }, [data]);

  // Get daily goal
  const dailyGoal = useMemo(() => {
    return data.dailyGoal || { target: 4, progress: 0, percentage: 0 };
  }, [data]);

  return {
    ...data,
    combinedStats,
    upcomingTests,
    dailyGoal,
    loading,
    error,
    usingMockData,
    refreshDashboard,
    getSubjectPerformance
  };
};