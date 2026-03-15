import React, { useState, useEffect } from 'react';
import { practiceAPI, goalsAPI } from '../../services/api';
import '../../styles/StudyAnalytics.css';

const StudyAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    dailyAverage: '0h',
    productivity: 0,
    streak: 0,
    goalsCompleted: '0/0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get practice stats
      const stats = await practiceAPI.getStats(30);
      const totalMinutes = stats?.overview?.totalTime || 0;
      const dailyAverage = (totalMinutes / 30 / 60).toFixed(1);
      
      // Get goals
      const goals = await goalsAPI.getGoals();
      const completed = goals.filter(g => g.completed).length;
      const total = goals.length;
      
      setAnalytics({
        dailyAverage: `${dailyAverage}h`,
        productivity: stats?.overview?.overallAccuracy || 0,
        streak: stats?.overview?.currentStreak || 0,
        goalsCompleted: `${completed}/${total}`
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to localStorage or defaults
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { icon: 'fa-clock', value: analytics.dailyAverage, label: 'Daily Average', color: '#2563eb' },
    { icon: 'fa-bolt', value: `${analytics.productivity}%`, label: 'Productivity', color: '#10b981' },
    { icon: 'fa-fire', value: analytics.streak, label: 'Day Streak', color: '#f59e0b' },
    { icon: 'fa-trophy', value: analytics.goalsCompleted, label: 'Goals Completed', color: '#8b5cf6' }
  ];

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

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-chart-bar"></i>
        </div>
        <h2>Study Analytics</h2>
      </div>
      
      <div className="analytics-grid">
        {items.map((item, index) => (
          <div key={index} className="analytics-card">
            <div className="analytics-icon" style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <div className="analytics-value">{item.value}</div>
            <div className="analytics-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyAnalytics;