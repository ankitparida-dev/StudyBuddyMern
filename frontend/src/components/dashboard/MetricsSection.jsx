import React from 'react';

const MetricsSection = ({ examType, stats }) => {
  // Use real stats from backend
  const studyTime = stats?.totalHours ? `${Math.round(stats.totalHours)}h` : '0h';
  const topicsCompleted = (stats?.physics + stats?.chemistry + (stats?.math || 0) + (stats?.biology || 0)) || 0;
  const accuracy = stats?.accuracy || 0;
  const streak = stats?.streak || 0;

  const metricCards = [
    { icon: 'fa-clock', color: '#4361ee', value: studyTime, label: 'Study Time This Week' },
    { icon: 'fa-check-circle', color: '#4cc9f0', value: topicsCompleted, label: 'Topics Completed' },
    { icon: 'fa-chart-bar', color: '#f8961e', value: `${accuracy}%`, label: 'Average Accuracy' },
    { icon: 'fa-trophy', color: '#7209b7', value: streak, label: 'Current Streak' }
  ];

  return (
    <div className="metrics-container">
      <div className="section-header">
        <h2 className="section-title">{examType.toUpperCase()} Progress & Reports</h2>
        <p className="section-subtitle">Your comprehensive report showing effort, consistency, and coverage</p>
      </div>

      <div className="metric-grid">
        {metricCards.map((metric, index) => (
          <div key={index} className="metric-card interactive">
            <div className="metric-icon" style={{ backgroundColor: metric.color }}>
              <i className={`fas ${metric.icon}`}></i>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsSection;