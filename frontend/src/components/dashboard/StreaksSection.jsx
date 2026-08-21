import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../../styles/StreaksSection.css';

const StreaksSection = ({ 
  examType, 
  streaks = {}, 
  recentSessions = [],
  onAchievementUnlock = null,
  showCalendar = true,
  showMilestones = true
}) => {
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animate streak count on mount
  useEffect(() => {
    if (streaks.current > 0) {
      const duration = 1000;
      const steps = 60;
      const increment = streaks.current / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(current + increment, streaks.current);
        setAnimatedStreak(Math.round(current));
        
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStreak(streaks.current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setAnimatedStreak(0);
    }
  }, [streaks.current]);

  // Check for new achievements
  useEffect(() => {
    const newUnlocked = achievements.filter(a => a.achieved && !unlockedAchievements.includes(a.id));
    if (newUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newUnlocked.map(a => a.id)]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      newUnlocked.forEach(achievement => {
        onAchievementUnlock?.(achievement);
      });
    }
  }, [achievements, unlockedAchievements, onAchievementUnlock]);

  // Calculate streak metrics
  const streakMetrics = useMemo(() => {
    const current = streaks.current || 0;
    const longest = streaks.longest || 0;
    const weeklyData = streaks.weekly || Array(7).fill(false);
    const weeklyProgress = weeklyData.filter(d => d).length;
    
    return {
      current,
      longest,
      weeklyProgress,
      weeklyTotal: weeklyData.length,
      xp: current * 50 + longest * 10,
      level: Math.floor((current * 50 + longest * 10) / 100) + 1,
      nextLevelXp: ((Math.floor((current * 50 + longest * 10) / 100) + 1) * 100) - (current * 50 + longest * 10),
      daysUntilMilestone: current > 0 ? 7 - (current % 7) : 7
    };
  }, [streaks]);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    // Get last 7 days of sessions
    const sessionDates = recentSessions?.map(s => new Date(s.timestamp).getDay()) || [];
    
    return days.map((dayName, index) => {
      const hasStreak = index < streaks.current;
      const isToday = index === today;
      const hasSession = sessionDates.includes(index);
      
      return {
        dayName,
        hasStreak,
        isToday,
        hasSession,
        isFuture: index > today,
        dayNumber: index
      };
    });
  }, [streaks.current, recentSessions]);

  // Streak cards configuration
  const streakCards = useMemo(() => [
    { 
      icon: 'fa-fire', 
      color: '#f94144', 
      gradient: 'linear-gradient(135deg, #f94144, #f3722c)',
      value: animatedStreak, 
      label: 'Current Streak',
      suffix: 'days',
      description: 'Keep the momentum going!'
    },
    { 
      icon: 'fa-calendar-check', 
      color: '#f8961e', 
      gradient: 'linear-gradient(135deg, #f8961e, #f9c74f)',
      value: `${streakMetrics.weeklyProgress}/${streakMetrics.weeklyTotal}`, 
      label: 'Weekly Goal',
      description: 'Days studied this week'
    },
    { 
      icon: 'fa-star', 
      color: '#43aa8b', 
      gradient: 'linear-gradient(135deg, #43aa8b, #4cc9f0)',
      value: Math.floor(streaks.current / 7) || 0, 
      label: 'Milestones',
      suffix: 'achieved',
      description: '7-day milestones reached'
    },
    { 
      icon: 'fa-trophy', 
      color: '#577590', 
      gradient: 'linear-gradient(135deg, #577590, #7209b7)',
      value: streakMetrics.xp, 
      label: 'Total XP',
      description: `${streakMetrics.level} • ${streakMetrics.nextLevelXp} XP to next level`
    }
  ], [animatedStreak, streakMetrics, streaks.current]);

  // Achievements configuration
  const achievements = useMemo(() => [
    {
      id: 'streak-7',
      icon: '🔥',
      title: '7-Day Streak',
      desc: 'Consistent studying for 7 days',
      reward: '+50 XP',
      achieved: streaks.current >= 7,
      rarity: 'common',
      color: '#f59e0b'
    },
    {
      id: 'streak-14',
      icon: '⚡',
      title: '14-Day Streak',
      desc: 'Two weeks of consistent studying!',
      reward: '+100 XP',
      achieved: streaks.current >= 14,
      rarity: 'uncommon',
      color: '#3b82f6'
    },
    {
      id: 'streak-30',
      icon: '🏆',
      title: '30-Day Streak',
      desc: 'A full month of dedication!',
      reward: '+250 XP',
      achieved: streaks.current >= 30,
      rarity: 'rare',
      color: '#8b5cf6'
    },
    {
      id: 'streak-100',
      icon: '👑',
      title: '100-Day Streak',
      desc: 'An incredible milestone!',
      reward: '+1000 XP',
      achieved: streaks.current >= 100,
      rarity: 'legendary',
      color: '#f59e0b'
    },
    {
      id: 'sessions-5',
      icon: '📚',
      title: 'Complete 5 Topics',
      desc: 'Mastered 5 chapters',
      reward: '+25 XP',
      achieved: (recentSessions?.length || 0) >= 5,
      rarity: 'common',
      color: '#10b981'
    },
    {
      id: 'sessions-20',
      icon: '🎯',
      title: 'Complete 20 Topics',
      desc: 'You\'re on fire!',
      reward: '+100 XP',
      achieved: (recentSessions?.length || 0) >= 20,
      rarity: 'uncommon',
      color: '#06b6d4'
    },
    {
      id: 'accuracy-80',
      icon: '🎯',
      title: '80% Accuracy',
      desc: 'Excellent performance!',
      reward: '+50 XP',
      achieved: (streaks.accuracy || 0) >= 80,
      rarity: 'uncommon',
      color: '#10b981'
    },
    {
      id: 'perfect-week',
      icon: '⭐',
      title: 'Perfect Week',
      desc: 'Studied all 7 days!',
      reward: '+150 XP',
      achieved: streakMetrics.weeklyProgress === 7,
      rarity: 'rare',
      color: '#8b5cf6'
    }
  ], [streaks.current, streaks.accuracy, recentSessions, streakMetrics.weeklyProgress]);

  // Get rarity badge
  const getRarityBadge = useCallback((rarity) => {
    const badges = {
      common: { label: 'Common', color: '#94a3b8' },
      uncommon: { label: 'Uncommon', color: '#3b82f6' },
      rare: { label: 'Rare', color: '#8b5cf6' },
      epic: { label: 'Epic', color: '#ec4899' },
      legendary: { label: 'Legendary', color: '#f59e0b' }
    };
    return badges[rarity] || badges.common;
  }, []);

  // Get streak message
  const getStreakMessage = useCallback(() => {
    const current = streaks.current || 0;
    
    if (current === 0) {
      return {
        emoji: '🌱',
        message: 'Start your study streak today!',
        submessage: 'Consistency is the key to success'
      };
    } else if (current < 7) {
      return {
        emoji: '🔥',
        message: `You're on a ${current}-day streak! Keep it up!`,
        submessage: `${streakMetrics.daysUntilMilestone} more days to reach 7-day milestone`
      };
    } else if (current < 30) {
      return {
        emoji: '⚡',
        message: `Amazing! ${current} days of consistency!`,
        submessage: 'You\'re building a powerful habit'
      };
    } else if (current < 100) {
      return {
        emoji: '🏆',
        message: `🌟 Incredible ${current}-day streak!`,
        submessage: 'You\'re among the top 1% of learners!'
      };
    } else {
      return {
        emoji: '👑',
        message: `👑 LEGENDARY! ${current} days!`,
        submessage: 'You are a true StudyBuddy legend!'
      };
    }
  }, [streaks.current, streakMetrics.daysUntilMilestone]);

  const streakMessage = getStreakMessage();

  return (
    <div className="streaks-section">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="confetti">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="confetti-piece"
                  style={{
                    '--delay': `${Math.random() * 2}s`,
                    '--x': `${(Math.random() - 0.5) * 200}px`,
                    '--rotation': `${Math.random() * 720}deg`
                  }}
                />
              ))}
            </div>
            <div className="celebration-text">
              <span className="celebration-emoji">🎉</span>
              <h3>Achievement Unlocked!</h3>
              <p>You're on fire! Keep it up!</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <i className="fas fa-fire"></i>
          Study Streaks & Progress
        </h2>
        <p className="section-subtitle">
          Maintain your study consistency and track your learning journey
          <span className="streak-level">Level {streakMetrics.level}</span>
        </p>
      </div>

      {/* Streak Cards */}
      <div className="streak-cards-grid">
        {streakCards.map((card, index) => (
          <div key={index} className="streak-card interactive">
            <div className="streak-card-inner">
              <div className="streak-card-icon" style={{ background: card.gradient }}>
                <i className={`fas ${card.icon}`}></i>
              </div>
              <div className="streak-card-content">
                <div className="streak-card-value">
                  {card.value}
                  {card.suffix && <span className="value-suffix">{card.suffix}</span>}
                </div>
                <div className="streak-card-label">{card.label}</div>
                <div className="streak-card-description">{card.description}</div>
              </div>
            </div>
            {index === 0 && streaks.current > 0 && (
              <div className="streak-card-badge">
                <i className="fas fa-fire"></i>
                Streak!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Streak Message */}
      <div className="streak-message">
        <div className="streak-message-emoji">{streakMessage.emoji}</div>
        <div className="streak-message-content">
          <h3>{streakMessage.message}</h3>
          <p>{streakMessage.submessage}</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="xp-progress">
        <div className="xp-progress-header">
          <span className="xp-label">
            <i className="fas fa-star"></i>
            XP Progress
          </span>
          <span className="xp-numbers">
            {streakMetrics.xp} / {(streakMetrics.level + 1) * 100} XP
          </span>
        </div>
        <div className="xp-progress-track">
          <div 
            className="xp-progress-fill"
            style={{ 
              width: `${(streakMetrics.xp / ((streakMetrics.level + 1) * 100)) * 100}%`,
              background: `linear-gradient(90deg, #f59e0b, #f97316)`
            }}
          />
        </div>
        <div className="xp-progress-level">
          <span>Level {streakMetrics.level}</span>
          <span>{streakMetrics.nextLevelXp} XP to next level</span>
        </div>
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div className="streak-calendar-container">
          <h3 className="calendar-title">
            <i className="fas fa-calendar-alt"></i>
            Weekly Activity
          </h3>
          <div className="streak-calendar">
            {calendarData.map((day, index) => (
              <div 
                key={index} 
                className={`calendar-day 
                  ${day.hasStreak ? 'streak' : ''} 
                  ${day.isToday ? 'today' : ''}
                  ${day.hasSession ? 'has-session' : ''}
                  ${day.isFuture ? 'future' : ''}
                `}
              >
                <span className="day-name">{day.dayName}</span>
                {day.hasSession && (
                  <span className="day-indicator">
                    <i className="fas fa-check-circle"></i>
                  </span>
                )}
                {day.isToday && (
                  <span className="today-indicator">Today</span>
                )}
              </div>
            ))}
          </div>
          <div className="calendar-legend">
            <span className="legend-item">
              <span className="legend-dot active"></span>
              Active
            </span>
            <span className="legend-item">
              <span className="legend-dot today"></span>
              Today
            </span>
            <span className="legend-item">
              <span className="legend-dot inactive"></span>
              Inactive
            </span>
          </div>
        </div>
      )}

      {/* Milestones/Achievements */}
      {showMilestones && (
        <div className="milestones-section">
          <div className="milestones-header">
            <h3 className="milestones-title">
              <i className="fas fa-trophy"></i>
              Achievements & Milestones
              <span className="milestones-count">
                {achievements.filter(a => a.achieved).length} / {achievements.length}
              </span>
            </h3>
            <div className="milestones-progress">
              <div 
                className="milestones-progress-fill"
                style={{ 
                  width: `${(achievements.filter(a => a.achieved).length / achievements.length) * 100}%`
                }}
              />
            </div>
          </div>

          <div className="milestones-grid">
            {achievements.map((achievement, index) => {
              const rarity = getRarityBadge(achievement.rarity);
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              
              return (
                <div 
                  key={index} 
                  className={`milestone-card 
                    ${achievement.achieved ? 'achieved' : ''} 
                    ${isUnlocked ? 'unlocked' : ''}
                    ${achievement.rarity}
                  `}
                  style={{
                    '--rarity-color': rarity.color
                  }}
                >
                  <div className="milestone-icon">{achievement.icon}</div>
                  <div className="milestone-content">
                    <div className="milestone-title">{achievement.title}</div>
                    <div className="milestone-desc">{achievement.desc}</div>
                    <div className="milestone-meta">
                      <span className="milestone-reward">
                        <i className="fas fa-star"></i>
                        {achievement.reward}
                      </span>
                      <span 
                        className="milestone-rarity"
                        style={{ backgroundColor: rarity.color }}
                      >
                        {rarity.label}
                      </span>
                    </div>
                  </div>
                  {achievement.achieved && (
                    <div className="milestone-check">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                  {!achievement.achieved && (
                    <div className="milestone-locked">
                      <i className="fas fa-lock"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational Quote */}
      <div className="motivational-quote">
        <i className="fas fa-quote-left"></i>
        <blockquote>
          {streaks.current > 0 
            ? `"Success is the sum of small efforts, repeated day in and day out." - Robert Collier`
            : `"The secret of getting ahead is getting started." - Mark Twain`}
        </blockquote>
        {streaks.current > 0 && (
          <div className="quote-stats">
            <span className="stat-item">
              <i className="fas fa-calendar-day"></i>
              {streaks.current} days
            </span>
            <span className="stat-item">
              <i className="fas fa-trophy"></i>
              {streakMetrics.longest} longest
            </span>
            <span className="stat-item">
              <i className="fas fa-star"></i>
              Level {streakMetrics.level}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreaksSection;