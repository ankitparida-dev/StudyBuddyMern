import React from 'react';

const MetricsSection = ({ examType }) => {
  const jeeMetrics = {
    studyTime: '42h',
    topicsCompleted: 78,
    accuracy: '65%',
    streak: 7,
    weeklyProgress: [
      { day: 'M', subject: 'Physics', time: '3h 20m', status: 'completed' },
      { day: 'T', subject: 'Chemistry', time: '2h 45m', status: 'completed' },
      { day: 'W', subject: 'Math', time: '4h 10m', status: 'completed' },
      { day: 'T', subject: 'Physics', time: '3h 30m', status: 'completed' },
      { day: 'F', subject: 'Revision', time: '2h 15m', status: 'inprogress' },
      { day: 'S', subject: 'Mock Test', time: '3h 00m', status: 'pending' },
      { day: 'S', subject: 'Weak Areas', time: '2h 00m', status: 'pending' }
    ]
  };

  const neetMetrics = {
    studyTime: '38h',
    topicsCompleted: 85,
    accuracy: '72%',
    streak: 5,
    weeklyProgress: [
      { day: 'M', subject: 'Biology', time: '4h 10m', status: 'completed' },
      { day: 'T', subject: 'Chemistry', time: '3h 20m', status: 'completed' },
      { day: 'W', subject: 'Physics', time: '2h 45m', status: 'completed' },
      { day: 'T', subject: 'Biology', time: '3h 30m', status: 'completed' },
      { day: 'F', subject: 'Revision', time: '2h 15m', status: 'inprogress' },
      { day: 'S', subject: 'Mock Test', time: '3h 00m', status: 'pending' },
      { day: 'S', subject: 'Weak Areas', time: '2h 00m', status: 'pending' }
    ]
  };

  const metrics = examType === 'jee' ? jeeMetrics : neetMetrics;

  const metricCards = [
    { icon: 'fa-clock', color: '#4361ee', value: metrics.studyTime, label: 'Study Time This Week' },
    { icon: 'fa-check-circle', color: '#4cc9f0', value: metrics.topicsCompleted, label: 'Topics Completed' },
    { icon: 'fa-chart-bar', color: '#f8961e', value: metrics.accuracy, label: 'Average Accuracy' },
    { icon: 'fa-trophy', color: '#7209b7', value: metrics.streak, label: 'Current Streak' }
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

      <div className="study-path">
        <div className="path-header">
          <h2 className="path-title">Weekly Progress Summary</h2>
        </div>
        
        <div className="path-container">
          {metrics.weeklyProgress.map((day, index) => (
            <div key={index} className="path-step interactive">
              <div className="step-number">{day.day}</div>
              <div className="step-title">{day.subject}</div>
              <div className="step-desc">{day.time}</div>
              <div className={`step-status status-${day.status}`}>
                {day.status === 'completed' ? 'Completed' : 
                 day.status === 'inprogress' ? 'In Progress' : 'Upcoming'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;