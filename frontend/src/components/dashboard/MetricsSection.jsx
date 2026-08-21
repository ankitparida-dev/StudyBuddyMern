import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../../styles/MetricsSection.css';

const MetricsSection = ({ 
  examType, 
  stats = {},
  loading = false,
  onMetricClick = null,
  showDetails = true,
  animate = true
}) => {
  // State for animated values
  const [animatedValues, setAnimatedValues] = useState({});
  const [hoveredMetric, setHoveredMetric] = useState(null);

  // Calculate metrics with default values
  const metrics = useMemo(() => {
    const totalTopics = (stats?.physics || 0) + (stats?.chemistry || 0) + (stats?.math || 0) + (stats?.biology || 0);
    const completedTopics = (stats?.physicsCompleted || 0) + (stats?.chemistryCompleted || 0) + (stats?.mathCompleted || 0) + (stats?.biologyCompleted || 0);
    
    return {
      studyTime: stats?.totalHours || 0,
      studyTimeFormatted: stats?.totalHours ? `${Math.round(stats.totalHours)}h` : '0h',
      topicsCompleted: completedTopics,
      totalTopics: totalTopics,
      completionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
      accuracy: stats?.accuracy || 0,
      streak: stats?.streak || 0,
      longestStreak: stats?.longestStreak || 0,
      sessionsCompleted: stats?.sessionsCompleted || 0,
      weeklyGoal: stats?.weeklyGoal || 0,
      weeklyProgress: stats?.weeklyProgress || 0
    };
  }, [stats]);

  // Animate values on mount
  useEffect(() => {
    if (!animate) return;

    const animateValue = (key, target) => {
      const duration = 1000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(current + increment, target);
        setAnimatedValues(prev => ({
          ...prev,
          [key]: Math.round(current)
        }));

        if (step >= steps) {
          clearInterval(timer);
          setAnimatedValues(prev => ({
            ...prev,
            [key]: target
          }));
        }
      }, duration / steps);

      return timer;
    };

    const timers = [];
    
    // Animate numeric values
    if (metrics.topicsCompleted > 0) {
      timers.push(animateValue('topicsCompleted', metrics.topicsCompleted));
    }
    if (metrics.accuracy > 0) {
      timers.push(animateValue('accuracy', metrics.accuracy));
    }
    if (metrics.streak > 0) {
      timers.push(animateValue('streak', metrics.streak));
    }
    if (metrics.studyTime > 0) {
      timers.push(animateValue('studyTime', metrics.studyTime));
    }
    if (metrics.completionRate > 0) {
      timers.push(animateValue('completionRate', metrics.completionRate));
    }

    return () => timers.forEach(timer => clearInterval(timer));
  }, [metrics, animate]);

  // Handle metric click
  const handleMetricClick = useCallback((metricKey) => {
    if (onMetricClick) {
      onMetricClick(metricKey, metrics);
    }
  }, [onMetricClick, metrics]);

  // Format value for display
  const formatValue = useCallback((value, type) => {
    if (type === 'percentage') {
      return `${value}%`;
    }
    if (type === 'time') {
      return typeof value === 'number' ? `${Math.round(value)}h` : value;
    }
    if (type === 'number') {
      return value;
    }
    return value;
  }, []);

  // Get metric icon
  const getMetricIcon = useCallback((type) => {
    const icons = {
      studyTime: 'fa-clock',
      topicsCompleted: 'fa-check-circle',
      accuracy: 'fa-bullseye',
      streak: 'fa-fire',
      longestStreak: 'fa-trophy',
      sessionsCompleted: 'fa-calendar-check',
      completionRate: 'fa-chart-pie',
      weeklyProgress: 'fa-chart-line'
    };
    return icons[type] || 'fa-chart-bar';
  }, []);

  // Get metric color
  const getMetricColor = useCallback((type) => {
    const colors = {
      studyTime: { bg: '#4361ee', gradient: 'linear-gradient(135deg, #4361ee, #3a0ca3)' },
      topicsCompleted: { bg: '#4cc9f0', gradient: 'linear-gradient(135deg, #4cc9f0, #4895ef)' },
      accuracy: { bg: '#f8961e', gradient: 'linear-gradient(135deg, #f8961e, #f3722c)' },
      streak: { bg: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
      longestStreak: { bg: '#7209b7', gradient: 'linear-gradient(135deg, #7209b7, #560bad)' },
      sessionsCompleted: { bg: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
      completionRate: { bg: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
      weeklyProgress: { bg: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' }
    };
    return colors[type] || { bg: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' };
  }, []);

  // Get metric label
  const getMetricLabel = useCallback((type) => {
    const labels = {
      studyTime: 'Study Time',
      topicsCompleted: 'Topics Completed',
      accuracy: 'Accuracy',
      streak: 'Current Streak',
      longestStreak: 'Best Streak',
      sessionsCompleted: 'Sessions',
      completionRate: 'Completion Rate',
      weeklyProgress: 'Weekly Progress'
    };
    return labels[type] || type;
  }, []);

  // Get metric description
  const getMetricDescription = useCallback((type) => {
    const descriptions = {
      studyTime: 'Total hours spent studying this week',
      topicsCompleted: 'Topics you\'ve mastered',
      accuracy: 'Average correctness across all subjects',
      streak: 'Consecutive days of study',
      longestStreak: 'Your longest study streak',
      sessionsCompleted: 'Study sessions completed',
      completionRate: 'Overall syllabus coverage',
      weeklyProgress: 'Progress toward weekly goal'
    };
    return descriptions[type] || '';
  }, []);

  // Main metric cards configuration
  const mainMetrics = useMemo(() => [
    {
      key: 'studyTime',
      value: animatedValues.studyTime || metrics.studyTimeFormatted,
      type: 'time',
      label: getMetricLabel('studyTime'),
      description: getMetricDescription('studyTime'),
      icon: getMetricIcon('studyTime'),
      color: getMetricColor('studyTime'),
      isAnimated: true
    },
    {
      key: 'topicsCompleted',
      value: animatedValues.topicsCompleted || metrics.topicsCompleted,
      type: 'number',
      label: getMetricLabel('topicsCompleted'),
      description: getMetricDescription('topicsCompleted'),
      icon: getMetricIcon('topicsCompleted'),
      color: getMetricColor('topicsCompleted'),
      isAnimated: true,
      suffix: metrics.totalTopics > 0 ? ` / ${metrics.totalTopics}` : ''
    },
    {
      key: 'accuracy',
      value: animatedValues.accuracy || metrics.accuracy,
      type: 'percentage',
      label: getMetricLabel('accuracy'),
      description: getMetricDescription('accuracy'),
      icon: getMetricIcon('accuracy'),
      color: getMetricColor('accuracy'),
      isAnimated: true
    },
    {
      key: 'streak',
      value: animatedValues.streak || metrics.streak,
      type: 'number',
      label: getMetricLabel('streak'),
      description: getMetricDescription('streak'),
      icon: getMetricIcon('streak'),
      color: getMetricColor('streak'),
      isAnimated: true
    }
  ], [metrics, animatedValues, getMetricLabel, getMetricDescription, getMetricIcon, getMetricColor]);

  // Additional metrics (shown when showDetails is true)
  const additionalMetrics = useMemo(() => [
    {
      key: 'completionRate',
      value: animatedValues.completionRate || metrics.completionRate,
      type: 'percentage',
      label: getMetricLabel('completionRate'),
      description: getMetricDescription('completionRate'),
      icon: getMetricIcon('completionRate'),
      color: getMetricColor('completionRate'),
      isAnimated: true,
      compact: true
    },
    {
      key: 'longestStreak',
      value: metrics.longestStreak,
      type: 'number',
      label: getMetricLabel('longestStreak'),
      description: getMetricDescription('longestStreak'),
      icon: getMetricIcon('longestStreak'),
      color: getMetricColor('longestStreak'),
      compact: true
    },
    {
      key: 'sessionsCompleted',
      value: metrics.sessionsCompleted,
      type: 'number',
      label: getMetricLabel('sessionsCompleted'),
      description: getMetricDescription('sessionsCompleted'),
      icon: getMetricIcon('sessionsCompleted'),
      color: getMetricColor('sessionsCompleted'),
      compact: true
    },
    {
      key: 'weeklyProgress',
      value: metrics.weeklyProgress,
      type: 'percentage',
      label: getMetricLabel('weeklyProgress'),
      description: getMetricDescription('weeklyProgress'),
      icon: getMetricIcon('weeklyProgress'),
      color: getMetricColor('weeklyProgress'),
      compact: true,
      isAnimated: true
    }
  ], [metrics, animatedValues, getMetricLabel, getMetricDescription, getMetricIcon, getMetricColor]);

  // Render loading state
  if (loading) {
    return (
      <div className="metrics-container">
        <div className="section-header">
          <h2 className="section-title">{examType?.toUpperCase() || 'Progress & Reports'}</h2>
          <p className="section-subtitle">Loading your metrics...</p>
        </div>
        <div className="metric-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="metric-card loading">
              <div className="metric-skeleton"></div>
              <div className="metric-skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="metrics-container">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          {examType?.toUpperCase() || 'Progress & Reports'}
          <span className="section-badge">
            {metrics.completionRate >= 80 ? '🌟 Great Progress!' : 
             metrics.completionRate >= 50 ? '📈 Keep Going!' : 
             '🎯 Stay Focused!'}
          </span>
        </h2>
        <p className="section-subtitle">
          Your comprehensive report showing effort, consistency, and coverage
          {metrics.totalTopics > 0 && ` • ${metrics.topicsCompleted}/${metrics.totalTopics} topics mastered`}
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div className="metric-grid main-grid">
        {mainMetrics.map((metric) => (
          <div
            key={metric.key}
            className={`metric-card interactive ${hoveredMetric === metric.key ? 'hovered' : ''}`}
            onClick={() => handleMetricClick(metric.key)}
            onMouseEnter={() => setHoveredMetric(metric.key)}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <div className="metric-card-inner">
              <div className="metric-icon-wrapper">
                <div 
                  className="metric-icon" 
                  style={{ background: metric.color.gradient }}
                >
                  <i className={`fas ${metric.icon}`}></i>
                </div>
                {metric.isAnimated && (
                  <div className="metric-pulse"></div>
                )}
              </div>
              <div className="metric-content">
                <div className="metric-value-wrapper">
                  <span className="metric-value">
                    {formatValue(metric.value, metric.type)}
                    {metric.suffix && <span className="metric-suffix">{metric.suffix}</span>}
                  </span>
                  {metric.type === 'percentage' && (
                    <div className="metric-ring">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="ring-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="ring-progress"
                          strokeDasharray={`${(metric.value || 0)}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          style={{
                            stroke: metric.color.bg,
                            strokeDasharray: `${Math.min(100, Math.max(0, metric.value || 0))}, 100`
                          }}
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="metric-label">{metric.label}</div>
                {metric.description && (
                  <div className="metric-description">{metric.description}</div>
                )}
              </div>
            </div>
            {hoveredMetric === metric.key && (
              <div className="metric-hover-tooltip">
                <i className="fas fa-info-circle"></i>
                <span>{metric.description || 'Click for more details'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      {showDetails && (
        <div className="additional-metrics">
          <div className="additional-header">
            <h3 className="additional-title">
              <i className="fas fa-chart-pie"></i>
              Detailed Insights
            </h3>
            <span className="additional-badge">Advanced Analytics</span>
          </div>
          <div className="metric-grid additional-grid">
            {additionalMetrics.map((metric) => (
              <div
                key={metric.key}
                className={`metric-card compact interactive ${hoveredMetric === metric.key ? 'hovered' : ''}`}
                onClick={() => handleMetricClick(metric.key)}
                onMouseEnter={() => setHoveredMetric(metric.key)}
                onMouseLeave={() => setHoveredMetric(null)}
              >
                <div className="metric-card-inner compact">
                  <div className="metric-icon-small" style={{ background: metric.color.gradient }}>
                    <i className={`fas ${metric.icon}`}></i>
                  </div>
                  <div className="metric-content-compact">
                    <div className="metric-value small">
                      {formatValue(metric.value, metric.type)}
                    </div>
                    <div className="metric-label small">{metric.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Progress Bar */}
      {metrics.totalTopics > 0 && (
        <div className="overall-progress">
          <div className="progress-header">
            <span className="progress-title">
              <i className="fas fa-flag-checkered"></i>
              Overall Completion
            </span>
            <span className="progress-value">{metrics.completionRate}%</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(100, Math.max(0, metrics.completionRate))}%`,
                background: `linear-gradient(90deg, #4cc9f0, #4361ee)`
              }}
            />
          </div>
          <div className="progress-stats">
            <span>{metrics.topicsCompleted} topics mastered</span>
            <span>{metrics.totalTopics - metrics.topicsCompleted} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsSection;