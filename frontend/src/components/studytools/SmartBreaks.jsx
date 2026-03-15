import React, { useState, useRef, useEffect } from 'react';
import '../../styles/SmartBreaks.css';

const SmartBreaks = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBreak, setActiveBreak] = useState(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const lofiPlayerRef = useRef(null);
  const timerRef = useRef(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (activeBreak && breakTimeLeft > 0) {
      timerRef.current = setInterval(() => {
        setBreakTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (breakTimeLeft === 0 && activeBreak) {
      handleBreakComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [activeBreak, breakTimeLeft]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
    
    const event = new CustomEvent('show-notification', { detail: { message, type } });
    window.dispatchEvent(event);
  };

  const formatBreakTime = () => {
    const minutes = Math.floor(breakTimeLeft / 60);
    const seconds = breakTimeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBreakComplete = () => {
    if (activeBreak === 'music') {
      toggleMusic();
    }
    setActiveBreak(null);
    
    // Resume main timer
    const resumeEvent = new CustomEvent('timer-resume');
    window.dispatchEvent(resumeEvent);
    
    showNotification('Break completed! Time to focus.');
  };

  const startBreakActivity = (activity) => {
    // Pause main timer
    const pauseEvent = new CustomEvent('timer-pause');
    window.dispatchEvent(pauseEvent);
    
    let duration = 0;
    switch(activity) {
      case 'walk':
        duration = 5 * 60;
        break;
      case 'eye':
        duration = 20; // 20 seconds for 20-20-20 rule
        break;
      case 'mindfulness':
        duration = 5 * 60;
        break;
      default:
        duration = 5 * 60;
    }
    
    setActiveBreak(activity);
    setBreakTimeLeft(duration);
    showNotification(`Starting ${activity} break activity!`);
  };

  const toggleMusic = () => {
    if (lofiPlayerRef.current) {
      if (!isPlaying) {
        lofiPlayerRef.current.src = "https://www.youtube.com/embed/n61ULEU7CO0?start=0&autoplay=1&loop=1&playlist=n61ULEU7CO0";
        showNotification('Playing relaxing music...');
        setIsPlaying(true);
        
        // Pause timer for music break
        const pauseEvent = new CustomEvent('timer-pause');
        window.dispatchEvent(pauseEvent);
        setActiveBreak('music');
        setBreakTimeLeft(10 * 60); // 10 minute music break
      } else {
        lofiPlayerRef.current.src = "";
        showNotification('Music stopped');
        setIsPlaying(false);
        setActiveBreak(null);
        
        // Resume timer
        const resumeEvent = new CustomEvent('timer-resume');
        window.dispatchEvent(resumeEvent);
      }
    }
  };

  const breaks = [
    { icon: 'fa-walking', label: '5min Walk', action: 'walk' },
    { icon: 'fa-eye', label: '20-20-20 Rule', action: 'eye' },
    { icon: 'fa-music', label: isPlaying ? 'Stop Music' : 'Relaxing Music', action: 'music', special: true },
    { icon: 'fa-brain', label: 'Mindfulness', action: 'mindfulness' }
  ];

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-coffee"></i>
        </div>
        <h2>Smart Breaks</h2>
      </div>
      
      {activeBreak ? (
        <div className="active-break">
          <h3>
            {activeBreak === 'walk' && '🚶 Walking Break'}
            {activeBreak === 'eye' && '👁️ 20-20-20 Rule'}
            {activeBreak === 'music' && '🎵 Music Break'}
            {activeBreak === 'mindfulness' && '🧘 Mindfulness'}
          </h3>
          <div className="break-timer">{formatBreakTime()}</div>
          <div className="break-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${(breakTimeLeft / (activeBreak === 'eye' ? 20 : 300)) * 100}%`,
                backgroundColor: '#10b981'
              }}
            ></div>
          </div>
          <button className="btn btn-outline" onClick={() => {
            if (activeBreak === 'music') toggleMusic();
            setActiveBreak(null);
            window.dispatchEvent(new CustomEvent('timer-resume'));
          }}>
            Skip Break
          </button>
        </div>
      ) : (
        <>
          <div className="break-buttons">
            {breaks.map((breakItem, index) => (
              <button
                key={index}
                className="break-btn btn-outline"
                onClick={breakItem.special ? toggleMusic : () => startBreakActivity(breakItem.action)}
              >
                <i className={`fas ${breakItem.icon}`}></i>
                <span>{breakItem.label}</span>
              </button>
            ))}
          </div>
          
          <div className="break-info">
            <p>Next break in: <strong>25 minutes</strong></p>
          </div>
        </>
      )}

      {/* Hidden iframe for lofi music */}
      <iframe
        ref={lofiPlayerRef}
        id="lofi-player"
        width="0"
        height="0"
        frameBorder="0"
        allow="autoplay"
        allowFullScreen
        title="lofi music"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <i className={`fas fa-${notification.type === 'success' ? 'check' : 'exclamation'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartBreaks;