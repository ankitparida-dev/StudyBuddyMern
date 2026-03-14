import { useState, useEffect } from 'react';
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

  // Mock data fallback
  const mockData = {
    user: { firstName: 'Rahul', lastName: 'Sharma' },
    stats: {
      totalHours: 124,
      topicsCompleted: 45,
      streak: 7,
      accuracy: 78,
      totalSessions: 32,
      weeklyAverage: 8.5
    },
    progress: {
      physics: 60,
      chemistry: 45,
      math: 30,
      biology: 65
    },
    streaks: {
      current: 7,
      longest: 15,
      weekly: [true, true, true, true, false, false, false]
    },
    recentSessions: []
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from real APIs
        let userData = null;
        let statsData = null;
        let progressData = null;
        let streaksData = null;
        let sessionsData = [];
        
        try {
          userData = await userAPI.getProfile();
        } catch (e) {
          console.log('User API not available');
        }
        
        try {
          statsData = await dashboardAPI.getStats();
        } catch (e) {
          console.log('Stats API not available');
        }
        
        try {
          progressData = await dashboardAPI.getProgress();
        } catch (e) {
          console.log('Progress API not available');
        }
        
        try {
          streaksData = await dashboardAPI.getStreaks();
        } catch (e) {
          console.log('Streaks API not available');
        }
        
        // Try to get practice sessions from Day 8 API
        try {
          const practiceData = await practiceAPI.getSessions(1, 5);
          sessionsData = practiceData.sessions || [];
        } catch (e) {
          console.log('Practice API not available');
        }

        // Check if any API succeeded
        if (userData || statsData || progressData || streaksData || sessionsData.length > 0) {
          setData({
            user: userData || mockData.user,
            stats: statsData || mockData.stats,
            progress: progressData || mockData.progress,
            streaks: streaksData || mockData.streaks,
            recentSessions: sessionsData
          });
          setUsingMockData(false);
        } else {
          // All APIs failed, use mock data
          setData(mockData);
          setUsingMockData(true);
        }
        
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
        setData(mockData);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate combined metrics from real data
  const getCombinedStats = () => {
    const d = data;
    
    // Try to get accuracy from practice stats if available
    const accuracy = d.stats?.accuracy || 
                     (d.recentSessions?.length > 0 
                       ? Math.round(d.recentSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / d.recentSessions.length)
                       : 78);
    
    return {
      totalHours: d.stats?.totalHours || 0,
      totalMinutes: (d.stats?.totalHours || 0) * 60,
      totalSessions: d.stats?.totalSessions || d.recentSessions?.length || 0,
      accuracy: accuracy,
      streak: d.streaks?.current || 0,
      longestStreak: d.streaks?.longest || 0,
      weeklyGoal: d.streaks?.weekly?.filter(d => d).length || 0,
      weeklyTotal: 7,
      physics: d.progress?.physics || 0,
      chemistry: d.progress?.chemistry || 0,
      math: d.progress?.math || 0,
      biology: d.progress?.biology || 0
    };
  };

  return {
    ...data,
    combinedStats: getCombinedStats(),
    loading,
    error,
    usingMockData
  };
};