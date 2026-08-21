import React, { useState, useCallback } from 'react';
import '../../styles/QuickSessions.css';

const QuickSessions = ({ onSessionStart = null }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [recentSessions, setRecentSessions] = useState(() => {
    const saved = localStorage.getItem('quickSessionsHistory');
    return saved ? JSON.parse(saved).slice(0, 5) : [];
  });

  const sessions = [
    { 
      minutes: 25, 
      icon: 'fa-bolt', 
      label: 'Focus', 
      description: 'Classic focus session',
      type: 'primary', 
      color: '#4361ee',
      gradient: 'linear-gradient(135deg, #4361ee, #3a0ca3)'
    },
    { 
      minutes: 45, 
      icon: 'fa-gem', 
      label: 'Deep Work', 
      description: 'Extended deep focus',
      type: 'primary', 
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    { 
      minutes: 15, 
      icon: 'fa-running', 
      label: 'Review', 
      description: 'Quick review session',
      type: 'outline', 
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    { 
      minutes: 60, 
      icon: 'fa-mountain', 
      label: 'Marathon', 
      description: 'Intense study session',
      type: 'outline', 
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    { 
      minutes: 90, 
      icon: 'fa-star', 
      label: 'Deep Dive', 
      description: 'Ultimate focus mode',
      type: 'outline', 
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
    }
  ];

  const startSession = useCallback((minutes, label, color) => {
    const session = { minutes, label, color, startedAt: new Date().toISOString() };
    setActiveSession(session);
    
    // Dispatch event
    const event = new CustomEvent('quick-session-start', {
      detail: { minutes, label }
    });
    window.dispatchEvent(event);
    
    // Show notification
    const notifEvent = new CustomEvent('show-notification', {
      detail: { 
        message: `🚀 Started ${minutes}-minute ${label} session!`,
        type: 'success'
      }
    });
    window.dispatchEvent(notifEvent);
    
    // Save to history
    setRecentSessions(prev => {
      const updated = [{ minutes, label, timestamp: new Date().toISOString() }, ...prev].slice(0, 5);
      localStorage.setItem('quickSessionsHistory', JSON.stringify(updated));
      return updated;
    });
    
    onSessionStart?.({ minutes, label });
  }, [onSessionStart]);

  const getTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Morning';
    if (hour < 17) return '☀️ Afternoon';
    if (hour < 21) return '🌆 Evening';
    return '🌙 Night';
  }, []);

  const getRecommendedSession = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 10) return sessions[1]; // Deep work
    if (hour < 14) return sessions[0]; // Focus
    if (hour < 18) return sessions[3]; // Marathon
    return sessions[2]; // Review
  }, []);

  const recommended = getRecommendedSession();

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-rocket"></i>
        </div>
        <h2>Quick Sessions</h2>
        <span className="time-badge">{getTimeOfDay()}</span>
      </div>

      {/* Recommended Session */}
      <div className="recommended-session">
        <div className="recommended-label">
          <i className="fas fa-star"></i>
          Recommended
        </div>
        <button
          className="recommended-btn"
          onClick={() => startSession(recommended.minutes, recommended.label, recommended.color)}
          style={{ 
            background: recommended.gradient,
            borderColor: recommended.color
          }}
        >
          <i className={`fas ${recommended.icon}`}></i>
          <div className="recommended-info">
            <span className="recommended-title">{recommended.minutes}m {recommended.label}</span>
            <span className="recommended-desc">{recommended.description}</span>
          </div>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      {/* Session Buttons */}
      <div className="session-buttons">
        {sessions.map((session, index) => (
          <button
            key={index}
            className={`session-btn ${session.type === 'primary' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => startSession(session.minutes, session.label, session.color)}
            style={{ 
              borderColor: session.color,
              '--hover-color': session.color
            }}
          >
            <div className="session-btn-icon" style={{ color: session.color }}>
              <i className={`fas ${session.icon}`}></i>
            </div>
            <div className="session-btn-content">
              <span className="session-btn-minutes">{session.minutes}m</span>
              <span className="session-btn-label">{session.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Session Indicator */}
      {activeSession && (
        <div className="active-session-indicator">
          <div className="active-session-pulse"></div>
          <div className="active-session-info">
            <span className="active-session-label">
              <i className="fas fa-play"></i> Active
            </span>
            <span className="active-session-details">
              {activeSession.minutes}m {activeSession.label} session running
            </span>
          </div>
          <button 
            className="active-session-stop"
            onClick={() => {
              setActiveSession(null);
              // Dispatch pause event
              const event = new CustomEvent('timer-pause');
              window.dispatchEvent(event);
            }}
          >
            <i className="fas fa-stop"></i>
          </button>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="recent-sessions">
          <div className="recent-label">
            <i className="fas fa-history"></i> Recent
          </div>
          <div className="recent-list">
            {recentSessions.map((s, i) => (
              <span key={i} className="recent-item">
                {s.minutes}m {s.label}
                <span className="recent-time">
                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="session-info">
        <i className="fas fa-info-circle"></i>
        Quick start a focused study session
      </p>
    </div>
  );
};

export default QuickSessions;