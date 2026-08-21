import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { practiceAPI } from '../../services/api';
import '../../styles/FocusMode.css';

const FocusMode = ({ onFocusStart = null, onFocusEnd = null }) => {
  const [focusActive, setFocusActive] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [focusStreak, setFocusStreak] = useState(0);
  const [notification, setNotification] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [distractionsBlocked, setDistractionsBlocked] = useState(false);
  const [autoDisableTimer, setAutoDisableTimer] = useState(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [ambientSound, setAmbientSound] = useState('lofi');
  const [breathingActive, setBreathingActive] = useState(false);
  
  const focusRef = useRef(null);

  // Load focus data
  useEffect(() => {
    loadFocusData();
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setLoadingError(true);
        loadFromLocalStorage();
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    const localTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
    const localStreak = parseInt(localStorage.getItem('focusStreak')) || 0;
    setTotalFocusTime(localTotal);
    setFocusStreak(localStreak);
    showNotification('Using offline mode - data not synced', 'info');
  }, []);

  const loadFocusData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingError(false);
      
      const token = localStorage.getItem('token');
      if (!token) {
        loadFromLocalStorage();
        setLoading(false);
        return;
      }
      
      const sessions = await practiceAPI.getSessions(1, 50);
      const today = new Date().toDateString();
      
      const todaySessions = sessions.sessions?.filter(s => 
        s.topic === 'focus-session' && new Date(s.date).toDateString() === today
      ) || [];
      
      const todayTotal = todaySessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
      setTotalFocusTime(todayTotal * 60);
      
      try {
        const stats = await practiceAPI.getStats(30);
        setFocusStreak(stats?.overview?.currentStreak || 0);
      } catch {
        const localStreak = parseInt(localStorage.getItem('focusStreak')) || 0;
        setFocusStreak(localStreak);
      }
      
      const localTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
      if (localTotal > todayTotal * 60) {
        setTotalFocusTime(localTotal);
      }
      
    } catch (error) {
      console.error('Failed to load focus data:', error);
      setLoadingError(true);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [loadFromLocalStorage]);

  const saveFocusSession = useCallback(async (minutes) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const currentTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
        localStorage.setItem('totalFocusTime', (currentTotal + minutes * 60).toString());
        return;
      }
      
      const sessionData = {
        subject: 'focus',
        topic: 'focus-session',
        totalQuestions: 0,
        correctAnswers: 0,
        timeSpent: minutes,
        difficulty: 'medium',
        notes: `Deep work focus session - ${minutes} minutes`
      };
      
      await practiceAPI.saveSession(sessionData);
      
      const currentTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
      localStorage.setItem('totalFocusTime', (currentTotal + minutes * 60).toString());
      
    } catch (error) {
      console.error('Failed to save focus session:', error);
      const currentTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
      localStorage.setItem('totalFocusTime', (currentTotal + minutes * 60).toString());
      throw error;
    }
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && focusActive) {
        e.preventDefault();
        toggleFocusMode();
        showNotification('Focus mode disabled via Escape key', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusActive]);

  // Auto-disable after 2 hours
  useEffect(() => {
    if (focusActive) {
      const timer = setTimeout(() => {
        toggleFocusMode();
        showNotification('Focus mode auto-disabled after 2 hours', 'info');
      }, 7200000);
      setAutoDisableTimer(timer);
    } else {
      if (autoDisableTimer) {
        clearTimeout(autoDisableTimer);
        setAutoDisableTimer(null);
      }
    }
  }, [focusActive]);

  // Breathing exercise timer
  useEffect(() => {
    if (breathingActive) {
      const breatheInterval = setInterval(() => {
        // Simple breathing animation trigger
        document.body.classList.toggle('breathe-in');
        setTimeout(() => {
          document.body.classList.toggle('breathe-in');
          document.body.classList.toggle('breathe-out');
        }, 4000);
      }, 8000);
      return () => clearInterval(breatheInterval);
    } else {
      document.body.classList.remove('breathe-in', 'breathe-out');
    }
  }, [breathingActive]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  }, []);

  const toggleFocusMode = useCallback(async () => {
    if (!focusActive) {
      setFocusActive(true);
      document.body.classList.add('focus-active');
      showNotification('🧘 Focus mode enabled! Minimizing distractions...');
      onFocusStart?.();
      
      const id = setInterval(() => {
        setTotalFocusTime(prev => prev + 1);
        setFocusMinutes(prev => prev + 1/60);
      }, 1000);
      setIntervalId(id);
      setStartTime(Date.now());
      
    } else {
      setFocusActive(false);
      document.body.classList.remove('focus-active');
      
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      
      if (startTime) {
        const focusSeconds = Math.round((Date.now() - startTime) / 1000);
        const focusMinutesCalc = Math.max(1, Math.round(focusSeconds / 60));
        
        try {
          await saveFocusSession(focusMinutesCalc);
          showNotification(`Focus session saved! (${focusMinutesCalc} minutes)`);
          onFocusEnd?.({ minutes: focusMinutesCalc });
        } catch (error) {
          showNotification('Saved locally (offline mode)', 'info');
        }
        setStartTime(null);
        setFocusMinutes(0);
      }

      // Turn off all features
      if (overlayActive) toggleOverlay();
      if (musicPlaying) toggleMusic();
      if (distractionsBlocked) blockDistractions();
      if (breathingActive) toggleBreathing();
      setShowEmergency(false);
    }
  }, [focusActive, intervalId, startTime, overlayActive, musicPlaying, distractionsBlocked, breathingActive, saveFocusSession, showNotification, onFocusStart, onFocusEnd]);

  const toggleMusic = useCallback(() => {
    if (!focusActive) {
      showNotification('Please enable Focus Mode first', 'error');
      return;
    }
    const lofiPlayer = document.getElementById('lofi-player');
    if (lofiPlayer) {
      if (!musicPlaying) {
        lofiPlayer.src = `https://www.youtube.com/embed/n61ULEU7CO0?start=0&autoplay=1&loop=1&playlist=n61ULEU7CO0`;
        setMusicPlaying(true);
        showNotification('🎵 Lofi music playing...');
      } else {
        lofiPlayer.src = "";
        setMusicPlaying(false);
        showNotification('Music stopped');
      }
    }
  }, [focusActive, musicPlaying, showNotification]);

  const toggleOverlay = useCallback(() => {
    if (!focusActive) {
      showNotification('Please enable Focus Mode first', 'error');
      return;
    }

    const existingOverlay = document.getElementById('focus-overlay');
    
    if (existingOverlay) {
      existingOverlay.remove();
      setOverlayActive(false);
      showNotification('Focus overlay removed');
    } else {
      const overlay = document.createElement('div');
      overlay.id = 'focus-overlay';
      overlay.innerHTML = `
        <div class="focus-overlay-content">
          <i class="fas fa-brain"></i>
          <h2>Focus Mode Active</h2>
          <p>Stay in the zone • You're doing great!</p>
          <div class="focus-timer">
            <i class="fas fa-clock"></i> ${formatTime(totalFocusTime)}
          </div>
          <div class="focus-breathing">
            <div class="breathing-circle"></div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      setOverlayActive(true);
      showNotification('🔒 Deep focus overlay activated');
    }
  }, [focusActive, totalFocusTime, formatTime, showNotification]);

  const blockDistractions = useCallback(() => {
    if (!focusActive) {
      showNotification('Please enable Focus Mode first', 'error');
      return;
    }

    setDistractionsBlocked(!distractionsBlocked);

    if (!distractionsBlocked) {
      const elementsToBlur = document.querySelectorAll('img, iframe:not(#lofi-player)');
      elementsToBlur.forEach(el => {
        if (el.id !== 'lofi-player') {
          el.style.filter = 'blur(5px)';
          el.style.transition = 'filter 0.3s ease';
        }
      });
      showNotification('🛡️ Distractions blocked!');
    } else {
      document.querySelectorAll('img, iframe').forEach(el => {
        el.style.filter = 'none';
      });
      showNotification('Distraction blocking disabled');
    }
  }, [focusActive, distractionsBlocked, showNotification]);

  const toggleBreathing = useCallback(() => {
    if (!focusActive) {
      showNotification('Please enable Focus Mode first', 'error');
      return;
    }
    setBreathingActive(!breathingActive);
    showNotification(breathingActive ? 'Breathing exercise stopped' : '🧘 Breathing exercise started');
  }, [focusActive, breathingActive, showNotification]);

  const emergencyDisableAll = useCallback(() => {
    document.body.classList.remove('focus-active');
    document.body.classList.remove('breathe-in', 'breathe-out');
    
    const overlay = document.getElementById('focus-overlay');
    if (overlay) overlay.remove();
    
    if (intervalId) clearInterval(intervalId);
    if (autoDisableTimer) clearTimeout(autoDisableTimer);
    
    setFocusActive(false);
    setOverlayActive(false);
    setMusicPlaying(false);
    setDistractionsBlocked(false);
    setBreathingActive(false);
    setShowEmergency(false);
    setStartTime(null);
    setFocusMinutes(0);
    
    const lofiPlayer = document.getElementById('lofi-player');
    if (lofiPlayer) lofiPlayer.src = "";
    
    document.querySelectorAll('img, iframe').forEach(el => {
      el.style.filter = 'none';
    });
    
    showNotification('⚠️ Emergency exit - all features disabled', 'error');
  }, [intervalId, autoDisableTimer, showNotification]);

  const retryLoading = useCallback(() => {
    setLoading(true);
    setLoadingError(false);
    loadFocusData();
  }, [loadFocusData]);

  if (loading) {
    return (
      <div className="tool-card feature-card">
        <div className="tool-header">
          <div className="tool-icon"><i className="fas fa-crosshairs"></i></div>
          <h2>Focus Mode</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading focus data...</p>
          {loadingError && (
            <button className="btn btn-outline" onClick={retryLoading} style={{ marginTop: '15px' }}>
              <i className="fas fa-sync-alt"></i> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tool-card feature-card" ref={focusRef}>
      <div className="tool-header">
        <div className="tool-icon"><i className="fas fa-crosshairs"></i></div>
        <h2>Focus Mode</h2>
        {focusActive && <span className="focus-active-badge">ACTIVE</span>}
      </div>
      
      {loadingError && (
        <div className="offline-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Using offline mode - data not synced</span>
          <button onClick={retryLoading}>Retry</button>
        </div>
      )}
      
      <div className="focus-controls">
        <button
          className={`btn ${focusActive ? 'btn-danger' : 'btn-primary'} btn-large`}
          onClick={toggleFocusMode}
        >
          <i className={`fas fa-${focusActive ? 'stop' : 'play'}`}></i>
          {focusActive ? ' Stop Focus Mode' : ' Start Focus Mode'}
        </button>

        {focusActive && (
          <>
            <div className="focus-actions-grid">
              <button
                className={`btn ${musicPlaying ? 'btn-success' : 'btn-outline'}`}
                onClick={toggleMusic}
              >
                <i className={`fas fa-${musicPlaying ? 'pause' : 'music'}`}></i>
                {musicPlaying ? ' Stop Music' : ' Lofi Music'}
              </button>

              <button
                className={`btn ${overlayActive ? 'btn-success' : 'btn-outline'}`}
                onClick={toggleOverlay}
              >
                <i className="fas fa-layer-group"></i>
                {overlayActive ? ' Hide Overlay' : ' Focus Overlay'}
              </button>

              <button
                className={`btn ${distractionsBlocked ? 'btn-success' : 'btn-outline'}`}
                onClick={blockDistractions}
              >
                <i className="fas fa-shield-alt"></i>
                {distractionsBlocked ? ' Unblock' : ' Block Distractions'}
              </button>

              <button
                className={`btn ${breathingActive ? 'btn-success' : 'btn-outline'}`}
                onClick={toggleBreathing}
              >
                <i className="fas fa-spa"></i>
                {breathingActive ? ' Stop' : ' Breathing'}
              </button>

              <button
                className="btn btn-outline"
                onClick={() => setShowEmergency(!showEmergency)}
              >
                <i className="fas fa-exclamation-triangle"></i>
                Emergency
              </button>
            </div>

            {showEmergency && (
              <div className="emergency-panel">
                <h4>⚠️ Emergency Exit</h4>
                <button onClick={emergencyDisableAll}>
                  <i className="fas fa-power-off"></i> Disable ALL Features Now
                </button>
                <p>Press ESC key anytime to disable</p>
              </div>
            )}
          </>
        )}
        
        <div className="focus-stats">
          <div className="stat-card">
            <div className="stat-value">{formatTime(totalFocusTime)}</div>
            <div className="stat-label">Today's Focus</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{focusStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          {focusActive && (
            <div className="stat-card">
              <div className="stat-value">{Math.round(focusMinutes)}m</div>
              <div className="stat-label">Current Session</div>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;