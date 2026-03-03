import React, { useEffect, useState } from 'react';

const StreaksSection = ({ examType }) => {
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayOfWeek = date.getDay();
      const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayOfWeek];
      const hasStreak = Math.random() > 0.3;
      const isToday = i === 0;
      
      days.push({ dayName, hasStreak, isToday });
    }
    setCalendarDays(days);
  }, []);

  const jeeStreaks = {
    currentStreak: 7,
    weeklyGoal: '5/7',
    milestones: 3,
    totalXP: 350,
    achievements: [
      { icon: '🔥', title: '7-Day Streak', desc: 'Consistent studying for 7 days', reward: '+10 XP', achieved: true },
      { icon: '📚', title: 'Complete 5 Topics', desc: 'Mastered 5 physics chapters', reward: '+25 XP', achieved: true },
      { icon: '🎯', title: '30-Day Streak', desc: 'Keep going strong!', reward: '+50 XP', achieved: false },
      { icon: '🏆', title: 'Master 3 Subjects', desc: 'Almost there, keep pushing!', reward: '+100 XP', achieved: false }
    ]
  };

  const neetStreaks = {
    currentStreak: 5,
    weeklyGoal: '4/7',
    milestones: 2,
    totalXP: 280,
    achievements: [
      { icon: '🔥', title: '5-Day Streak', desc: 'Consistent studying for 5 days', reward: '+10 XP', achieved: true },
      { icon: '📚', title: 'Complete 8 Topics', desc: 'Mastered 8 biology chapters', reward: '+25 XP', achieved: true },
      { icon: '🎯', title: '15-Day Streak', desc: 'Keep going strong!', reward: '+50 XP', achieved: false },
      { icon: '🏆', title: 'Master 2 Subjects', desc: 'Almost there, keep pushing!', reward: '+100 XP', achieved: false }
    ]
  };

  const streaks = examType === 'jee' ? jeeStreaks : neetStreaks;

  const streakCards = [
    { icon: 'fa-fire', color: '#f94144', value: streaks.currentStreak, label: 'Current Streak' },
    { icon: 'fa-calendar-check', color: '#f8961e', value: streaks.weeklyGoal, label: 'Weekly Goal' },
    { icon: 'fa-star', color: '#43aa8b', value: streaks.milestones, label: 'Milestones' },
    { icon: 'fa-award', color: '#577590', value: streaks.totalXP, label: 'Total XP' }
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
          {streaks.achievements.map((achievement, index) => (
            <div key={index} className={`milestone-card ${achievement.achieved ? 'achieved' : ''}`}>
              <div className="milestone-icon">{achievement.icon}</div>
              <div className="milestone-title">{achievement.title}</div>
              <div className="milestone-desc">{achievement.desc}</div>
              <div className="milestone-reward">{achievement.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreaksSection;