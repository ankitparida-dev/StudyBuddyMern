import React from 'react';

const StreaksSection = ({ examType, streaks, recentSessions }) => {
  const streakCards = [
    { icon: 'fa-fire', color: '#f94144', value: streaks.current, label: 'Current Streak' },
    { icon: 'fa-calendar-check', color: '#f8961e', value: streaks.weekly.filter(d => d).length + '/7', label: 'Weekly Goal' },
    { icon: 'fa-star', color: '#43aa8b', value: Math.floor(streaks.current / 7) || 0, label: 'Milestones' },
    { icon: 'fa-award', color: '#577590', value: streaks.current * 50, label: 'Total XP' }
  ];

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Generate calendar based on recent sessions
  const calendarDays = days.map((day, index) => {
    const hasStreak = index < streaks.current;
    const isToday = index === new Date().getDay();
    return { dayName: day, hasStreak, isToday };
  });

  // Calculate achievements based on real data
  const achievements = [
    { 
      icon: '🔥', 
      title: `${streaks.current}-Day Streak`, 
      desc: `Consistent studying for ${streaks.current} days`, 
      reward: '+10 XP', 
      achieved: streaks.current >= 7 
    },
    { 
      icon: '📚', 
      title: 'Complete 5 Topics', 
      desc: 'Mastered 5 chapters', 
      reward: '+25 XP', 
      achieved: (recentSessions?.length || 0) >= 5 
    },
    { 
      icon: '🎯', 
      title: '30-Day Streak', 
      desc: 'Keep going strong!', 
      reward: '+50 XP', 
      achieved: streaks.current >= 30 
    },
    { 
      icon: '🏆', 
      title: 'Master 3 Subjects', 
      desc: 'Study all subjects', 
      reward: '+100 XP', 
      achieved: false 
    }
  ];

  return (
    <div className="streaks-section">
      <div className="section-header">
        <h2 className="section-title">Study Streaks & Progress</h2>
        <p className="section-subtitle">Maintain your study consistency and track your learning journey</p>
      </div>

      <div className="metric-grid">
        {streakCards.map((card, index) => (
          <div key={index} className="metric-card interactive">
            <div className="metric-icon" style={{ backgroundColor: card.color }}>
              <i className={`fas ${card.icon}`}></i>
            </div>
            <div className="metric-value">{card.value}</div>
            <div className="metric-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="streaks-container">
        <div className="streak-calendar">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`calendar-day ${day.hasStreak ? 'streak' : ''} ${day.isToday ? 'today' : ''}`}
            >
              {day.dayName}
            </div>
          ))}
        </div>

        <div className="milestones-grid">
          {achievements.map((achievement, index) => (
            <div key={index} className={`milestone-card ${achievement.achieved ? 'achieved' : ''}`}>
              <div className="milestone-icon">{achievement.icon}</div>
              <div className="milestone-title">{achievement.title}</div>
              <div className="milestone-desc">{achievement.desc}</div>
              <div className="milestone-reward">{achievement.reward}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: 'var(--light)', borderRadius: '12px' }}>
          {streaks.current > 0 ? (
            <p style={{ fontSize: '1.1rem' }}>
              🔥 You're on a <strong>{streaks.current}-day streak</strong>! Keep it up!
            </p>
          ) : (
            <p>Start your study streak today!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreaksSection;