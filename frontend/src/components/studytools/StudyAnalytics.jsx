import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { practiceAPI, goalsAPI } from '../../services/api';
import '../../styles/StudyAnalytics.css';

const StudyAnalytics = ({ onDataLoaded = null }) => {
  const [analytics, setAnalytics] = useState({
    dailyAverage: '0h',
    productivity: 0,
    streak: 0,
    goalsCompleted: '0/0',
    totalHours: 0,
    sessionsCompleted: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    bestStreak: 0,
    accuracyTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get practice stats
      const stats = await practiceAPI.getStats(30);
      const totalMinutes = stats?.overview?.totalTime || 0;
      const dailyAverage = (totalMinutes / 30 / 60).toFixed(1);
      
      // Get goals
      const goals = await goalsAPI.getGoals();
      const completed = goals.filter(g => g.completed).length;
      const total = goals.length;
      
      // Calculate trends
      const accuracyTrend = stats?.sessions?.slice(0, 7).map(s => ({
        date: new Date(s.date).toLocaleDateString(),
        accuracy: s.accuracy || 0,
        time: s.timeSpent || 0
      })) || [];
      
      setAnalytics({
        dailyAverage: `${dailyAverage}h`,
        productivity: stats?.overview?.overallAccuracy || 0,
        streak: stats?.overview?.currentStreak || 0,
        bestStreak: stats?.overview?.bestStreak || 0,
        goalsCompleted: `${completed}/${total}`,
        totalHours: Math.round(totalMinutes / 60),
        sessionsCompleted: stats?.overview?.totalSessions || 0,
        weeklyProgress: stats?.overview?.weeklyProgress || 0,
        monthlyProgress: stats?.overview?.monthlyProgress || 0,
        accuracyTrend
      });
      
      onDataLoaded?.({ stats, goals });
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError(error.message || 'Failed to load analytics');
      
      // Fallback to localStorage
      const localTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
      const localStreak = parseInt(localStorage.getItem('focusStreak')) || 0;
      const localGoals = JSON.parse(localStorage.getItem('studyGoals') || '[]');
      const completed = localGoals.filter(g => g.completed).length;
      
      setAnalytics(prev => ({
        ...prev,
        dailyAverage: `${(localTotal / 60 / 30).toFixed(1)}h`,
        streak: localStreak,
        goalsCompleted: `${completed}/${localGoals.length}`
      }));
      
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const statsItems = useMemo(() => [
    { 
      icon: 'fa-clock', 
      value: analytics.dailyAverage, 
      label: 'Daily Average', 
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      description: 'Average study time per day'
    },
    { 
      icon: 'fa-bolt', 
      value: `${analytics.productivity}%`, 
      label: 'Productivity', 
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      description: 'Overall accuracy score'
    },
    { 
      icon: 'fa-fire', 
      value: analytics.streak, 
      label: 'Day Streak', 
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      description: `Best: ${analytics.bestStreak} days`
    },
    { 
      icon: 'fa-trophy', 
      value: analytics.goalsCompleted, 
      label: 'Goals Completed', 
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      description: 'Total goals achieved'
    },
    { 
      icon: 'fa-book', 
      value: `${analytics.totalHours}h`, 
      label: 'Total Hours', 
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
      description: 'Total study time'
    },
    { 
      icon: 'fa-calendar-check', 
      value: analytics.sessionsCompleted, 
      label: 'Sessions', 
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      description: 'Study sessions completed'
    }
  ], [analytics]);

  const progressItems = useMemo(() => [
    { 
      label: 'Weekly Progress', 
      value: analytics.weeklyProgress, 
      color: '#10b981',
      max: 100
    },
    { 
      label: 'Monthly Progress', 
      value: analytics.monthlyProgress, 
      color: '#3b82f6',
      max: 100
    }
  ], [analytics]);

  if (loading) {
    return (
      <div className="tool-card feature-card">
        <div className="tool-header">
          <div className="tool-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <h2>Study Analytics</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tool-card feature-card">
        <div className="tool-header">
          <div className="tool-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <h2>Study Analytics</h2>
        </div>
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={fetchAnalytics}>
            <i className="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-chart-bar"></i>
        </div>
        <h2>Study Analytics</h2>
        <div className="time-range-selector">
          <button 
            className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`time-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="analytics-grid">
        {statsItems.map((item, index) => (
          <div key={index} className="analytics-card interactive">
            <div className="analytics-icon" style={{ background: item.gradient }}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <div className="analytics-content">
              <div className="analytics-value">{item.value}</div>
              <div className="analytics-label">{item.label}</div>
              <div className="analytics-description">{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bars */}
      <div className="progress-section">
        {progressItems.map((item, index) => (
          <div key={index} className="progress-item">
            <div className="progress-header">
              <span className="progress-label">{item.label}</span>
              <span className="progress-value">{item.value}%</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(100, Math.max(0, item.value))}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Accuracy Trend */}
      {analytics.accuracyTrend.length > 0 && (
        <div className="trend-section">
          <div className="trend-header">
            <span className="trend-label">
              <i className="fas fa-chart-line"></i>
              Recent Accuracy
            </span>
          </div>
          <div className="trend-chart">
            {analytics.accuracyTrend.map((point, i) => (
              <div key={i} className="trend-bar">
                <div 
                  className="trend-bar-fill"
                  style={{ 
                    height: `${point.accuracy}%`,
                    backgroundColor: point.accuracy >= 70 ? '#10b981' : 
                                   point.accuracy >= 40 ? '#f59e0b' : '#ef4444'
                  }}
                />
                <span className="trend-label">{point.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="insights-section">
        <div className="insight-item">
          <i className="fas fa-lightbulb" style={{ color: '#f59e0b' }}></i>
          <span>
            {analytics.streak > 0 
              ? `You're on a ${analytics.streak}-day streak! Keep going! 🔥`
              : 'Start your study streak today! 🌱'}
          </span>
        </div>
        <div className="insight-item">
          <i className="fas fa-target" style={{ color: '#3b82f6' }}></i>
          <span>
            {analytics.productivity >= 70 
              ? `Great accuracy at ${analytics.productivity}%! 🎯`
              : `Focus on improving accuracy: ${analytics.productivity}% 📈`}
          </span>
        </div>
        {analytics.goalsCompleted.split('/')[0] > 0 && (
          <div className="insight-item">
            <i className="fas fa-trophy" style={{ color: '#8b5cf6' }}></i>
            <span>
              You've completed {analytics.goalsCompleted} goals! 🏆
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyAnalytics;