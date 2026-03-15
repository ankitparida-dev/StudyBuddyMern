import React from 'react';
import '../../styles/QuickSessions.css';

const QuickSessions = () => {
  const sessions = [
    { minutes: 25, icon: 'fa-bolt', label: '25min Focus', type: 'primary', color: '#4361ee' },
    { minutes: 45, icon: 'fa-gem', label: '45min Deep Work', type: 'primary', color: '#f59e0b' },
    { minutes: 15, icon: 'fa-running', label: '15min Review', type: 'outline', color: '#10b981' },
    { minutes: 60, icon: 'fa-mountain', label: '1hr Marathon', type: 'outline', color: '#8b5cf6' }
  ];

  const startSession = (minutes, label) => {
    // Dispatch event that PomodoroTimer listens to
    const event = new CustomEvent('quick-session-start', {
      detail: { minutes, label }
    });
    window.dispatchEvent(event);
    
    // Show notification
    const notifEvent = new CustomEvent('show-notification', {
      detail: { message: `Started ${minutes}-minute ${label} session!`, type: 'success' }
    });
    window.dispatchEvent(notifEvent);
  };

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-rocket"></i>
        </div>
        <h2>Quick Sessions</h2>
      </div>
      
      <div className="session-buttons">
        {sessions.map((session, index) => (
          <button
            key={index}
            className={`session-btn ${session.type === 'primary' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => startSession(session.minutes, session.label)}
            style={{ borderColor: session.color }}
          >
            <i className={`fas ${session.icon}`} style={{ color: session.color }}></i>
            <span>{session.label}</span>
          </button>
        ))}
      </div>
      
      <p className="session-info">
        Quick start a focused study session
      </p>
    </div>
  );
};

export default QuickSessions;