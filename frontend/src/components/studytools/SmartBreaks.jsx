import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import '../../styles/SmartBreaks.css';

const SmartBreaks = ({ onBreakStart = null, onBreakEnd = null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBreak, setActiveBreak] = useState(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [breakDuration, setBreakDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [notification, setNotification] = useState(null);
  const [breakHistory, setBreakHistory] = useState(() => {
    const saved = localStorage.getItem('breakHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSound, setSelectedSound] = useState('lofi');
  const [volume, setVolume] = useState(30);
  const [showSettings, setShowSettings] = useState(false);
  
  const lofiPlayerRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);

  // Break configurations
  const breakConfigs = useMemo(() => ({
    walk: {
      label: 'Walking Break',
      icon: 'fa-walking',
      duration: 5 * 60,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      tips: ['Take a short walk', 'Stretch your legs', 'Get some fresh air']
    },
    eye: {
      label: '20-20-20 Rule',
      icon: 'fa-eye',
      duration: 20,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      tips: ['Look 20 feet away', 'For 20 seconds', 'Every 20 minutes']
    },
    mindfulness: {
      label: 'Mindfulness',
      icon: 'fa-brain',
      duration: 5 * 60,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      tips: ['Deep breathing', 'Focus on the present', 'Clear your mind']
    },
    music: {
      label: 'Music Break',
      icon: 'fa-music',
      duration: 10 * 60,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
      tips: ['Relax with music', 'Close your eyes', 'Let go of stress']
    },
    stretch: {
      label: 'Stretching',
      icon: 'fa-child',
      duration: 3 * 60,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      tips: ['Neck rolls', 'Shoulder stretches', 'Back stretches']
    },
    hydration: {
      label: 'Hydration Break',
      icon: 'fa-tint',
      duration: 60,
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      tips: ['Drink water', 'Stay hydrated', 'Boost energy']
    }
  }), []);

  // Sound options
  const soundOptions = useMemo(() => ({
    lofi: { label: 'Lofi', url: 'https://www.youtube.com/embed/n61ULEU7CO0' },
    nature: { label: 'Nature', url: 'https://www.youtube.com/embed/n61ULEU7CO0' },
    piano: { label: 'Piano', url: 'https://www.youtube.com/embed/n61ULEU7CO0' },
    ambient: { label: 'Ambient', url: 'https://www.youtube.com/embed/n61ULEU7CO0' }
  }), []);

  useEffect(() => {
    if (activeBreak && breakTimeLeft > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setBreakTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleBreakComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeBreak, breakTimeLeft, isPaused]);

  // Save break history
  useEffect(() => {
    localStorage.setItem('breakHistory', JSON.stringify(breakHistory));
  }, [breakHistory]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
    const event = new CustomEvent('show-notification', { detail: { message, type } });
    window.dispatchEvent(event);
  }, []);

  const formatBreakTime = useCallback(() => {
    const minutes = Math.floor(breakTimeLeft / 60);
    const seconds = breakTimeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [breakTimeLeft]);

  const getProgressPercentage = useCallback(() => {
    if (breakDuration === 0) return 0;
    return ((breakDuration - breakTimeLeft) / breakDuration) * 100;
  }, [breakDuration, breakTimeLeft]);

  const playSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2 * (volume / 100), audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }, [volume]);

  const handleBreakComplete = useCallback(() => {
    const breakType = activeBreak;
    const config = breakConfigs[breakType];
    
    // Save to history
    const historyEntry = {
      id: Date.now(),
      type: breakType,
      label: config?.label || breakType,
      duration: Math.round((breakDuration - breakTimeLeft) / 60),
      completed: true,
      timestamp: new Date().toISOString()
    };
    setBreakHistory(prev => [historyEntry, ...prev].slice(0, 20));
    
    // Stop music if playing
    if (breakType === 'music' && isPlaying) {
      toggleMusic();
    }
    
    setActiveBreak(null);
    setBreakTimeLeft(0);
    setBreakDuration(0);
    
    // Resume main timer
    const resumeEvent = new CustomEvent('timer-resume');
    window.dispatchEvent(resumeEvent);
    
    showNotification('✅ Break completed! Time to focus.');
    onBreakEnd?.({ type: breakType, duration: historyEntry.duration });
    
    playSound();
  }, [activeBreak, breakDuration, breakTimeLeft, isPlaying, breakConfigs, showNotification, onBreakEnd, playSound]);

  const startBreakActivity = useCallback((activity) => {
    // Pause main timer
    const pauseEvent = new CustomEvent('timer-pause');
    window.dispatchEvent(pauseEvent);
    
    const config = breakConfigs[activity];
    if (!config) return;
    
    setActiveBreak(activity);
    setBreakDuration(config.duration);
    setBreakTimeLeft(config.duration);
    setIsPaused(false);
    
    showNotification(`🧘 Starting ${config.label}...`, 'info');
    onBreakStart?.({ type: activity, duration: config.duration });
  }, [breakConfigs, showNotification, onBreakStart]);

  const toggleMusic = useCallback(() => {
    const lofiPlayer = lofiPlayerRef.current;
    if (!lofiPlayer) return;
    
    if (!isPlaying) {
      const sound = soundOptions[selectedSound];
      lofiPlayer.src = `${sound.url}?start=0&autoplay=1&loop=1&playlist=${sound.url.split('/embed/')[1]}`;
      setIsPlaying(true);
      showNotification('🎵 Playing relaxing music...');
      
      // Pause timer for music break
      const pauseEvent = new CustomEvent('timer-pause');
      window.dispatchEvent(pauseEvent);
      setActiveBreak('music');
      setBreakDuration(breakConfigs.music.duration);
      setBreakTimeLeft(breakConfigs.music.duration);
    } else {
      lofiPlayer.src = "";
      setIsPlaying(false);
      showNotification('Music stopped');
      setActiveBreak(null);
      setBreakTimeLeft(0);
      setBreakDuration(0);
      
      // Resume timer
      const resumeEvent = new CustomEvent('timer-resume');
      window.dispatchEvent(resumeEvent);
    }
  }, [isPlaying, selectedSound, soundOptions, breakConfigs, showNotification]);

  const pauseBreak = useCallback(() => {
    setIsPaused(true);
    showNotification('⏸️ Break paused', 'info');
  }, [showNotification]);

  const resumeBreak = useCallback(() => {
    setIsPaused(false);
    showNotification('▶️ Break resumed', 'info');
  }, [showNotification]);

  const skipBreak = useCallback(() => {
    if (activeBreak === 'music' && isPlaying) {
      toggleMusic();
    }
    setActiveBreak(null);
    setBreakTimeLeft(0);
    setBreakDuration(0);
    setIsPaused(false);
    window.dispatchEvent(new CustomEvent('timer-resume'));
    showNotification('⏭️ Break skipped', 'info');
  }, [activeBreak, isPlaying, toggleMusic, showNotification]);

  const getBreakTips = useCallback(() => {
    if (!activeBreak) return [];
    return breakConfigs[activeBreak]?.tips || [];
  }, [activeBreak, breakConfigs]);

  const getBreakEmoji = useCallback((type) => {
    const emojis = {
      walk: '🚶',
      eye: '👁️',
      mindfulness: '🧘',
      music: '🎵',
      stretch: '🤸',
      hydration: '💧'
    };
    return emojis[type] || '🎯';
  }, []);

  const breakButtons = useMemo(() => [
    { icon: 'fa-walking', label: 'Walk', action: 'walk', color: '#10b981' },
    { icon: 'fa-eye', label: '20-20-20', action: 'eye', color: '#3b82f6' },
    { icon: 'fa-brain', label: 'Mindfulness', action: 'mindfulness', color: '#8b5cf6' },
    { icon: 'fa-music', label: isPlaying ? 'Stop' : 'Music', action: 'music', special: true, color: '#ec4899' },
    { icon: 'fa-child', label: 'Stretch', action: 'stretch', color: '#f59e0b' },
    { icon: 'fa-tint', label: 'Hydrate', action: 'hydration', color: '#06b6d4' }
  ], [isPlaying]);

  const totalBreaksToday = useMemo(() => {
    const today = new Date().toDateString();
    return breakHistory.filter(b => new Date(b.timestamp).toDateString() === today);
  }, [breakHistory]);

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-coffee"></i>
        </div>
        <h2>Smart Breaks</h2>
        <span className="break-count">{totalBreaksToday.length} today</span>
        <button 
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
          title="Break settings"
        >
          <i className="fas fa-cog"></i>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="break-settings">
          <div className="setting-group">
            <label>Sound</label>
            <select 
              value={selectedSound} 
              onChange={(e) => setSelectedSound(e.target.value)}
            >
              {Object.entries(soundOptions).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <label>Volume: {volume}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
            />
          </div>
        </div>
      )}

      {activeBreak ? (
        <div className="active-break">
          <div className="active-break-header">
            <span className="break-emoji">{getBreakEmoji(activeBreak)}</span>
            <h3>{breakConfigs[activeBreak]?.label || activeBreak}</h3>
          </div>
          
          <div className="break-timer">{formatBreakTime()}</div>
          
          <div className="break-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${getProgressPercentage()}%`,
                background: breakConfigs[activeBreak]?.gradient || 'var(--primary)'
              }}
            />
          </div>

          <div className="break-tips">
            {getBreakTips().map((tip, i) => (
              <span key={i} className="tip-item">
                <i className="fas fa-check-circle"></i> {tip}
              </span>
            ))}
          </div>

          <div className="break-controls">
            {!isPaused ? (
              <button className="btn btn-secondary" onClick={pauseBreak}>
                <i className="fas fa-pause"></i> Pause
              </button>
            ) : (
              <button className="btn btn-primary" onClick={resumeBreak}>
                <i className="fas fa-play"></i> Resume
              </button>
            )}
            <button className="btn btn-secondary" onClick={skipBreak}>
              <i className="fas fa-forward"></i> Skip
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="break-buttons">
            {breakButtons.map((breakItem, index) => (
              <button
                key={index}
                className="break-btn"
                style={{ 
                  '--break-color': breakItem.color,
                  borderColor: breakItem.color
                }}
                onClick={breakItem.special ? toggleMusic : () => startBreakActivity(breakItem.action)}
              >
                <i className={`fas ${breakItem.icon}`} style={{ color: breakItem.color }}></i>
                <span>{breakItem.label}</span>
              </button>
            ))}
          </div>

          <div className="break-info">
            <div className="break-info-item">
              <i className="fas fa-clock"></i>
              <span>Next break in: <strong>25 minutes</strong></span>
            </div>
            <div className="break-info-item">
              <i className="fas fa-history"></i>
              <span>Today: <strong>{totalBreaksToday.length}</strong> breaks</span>
            </div>
          </div>

          {/* Recent Breaks */}
          {breakHistory.length > 0 && (
            <div className="recent-breaks">
              <div className="recent-breaks-label">
                <i className="fas fa-history"></i> Recent
              </div>
              <div className="recent-breaks-list">
                {breakHistory.slice(0, 3).map((b, i) => (
                  <span key={i} className="recent-break-item">
                    {getBreakEmoji(b.type)} {b.label} ({b.duration}m)
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Hidden iframe for music */}
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