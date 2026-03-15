import React, { useState, useEffect } from 'react';
import { practiceAPI } from '../../services/api';
import '../../styles/FocusMode.css';

const FocusMode = () => {
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

  // Load focus data from backend on mount
  useEffect(() => {
    loadFocusData();
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Loading timeout - using fallback data');
        setLoading(false);
        setLoadingError(true);
        loadFromLocalStorage();
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  const loadFromLocalStorage = () => {
    const localTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
    const localStreak = parseInt(localStorage.getItem('focusStreak')) || 0;
    setTotalFocusTime(localTotal);
    setFocusStreak(localStreak);
    showNotification('Using offline mode - data not synced', 'info');
  };

  const loadFocusData = async () => {
    try {
      setLoading(true);
      setLoadingError(false);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found - using localStorage');
        loadFromLocalStorage();
        setLoading(false);
        return;
      }
      
      // Get today's focus sessions
      const sessions = await practiceAPI.getSessions(1, 50);
      const today = new Date().toDateString();
      
      // Calculate total focus time today
      const todaySessions = sessions.sessions?.filter(s => 
        s.topic === 'focus-session' && new Date(s.date).toDateString() === today
      ) || [];
      
      const todayTotal = todaySessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
      setTotalFocusTime(todayTotal * 60); // Convert minutes to seconds
      
      // Get streak from practice stats
      try {
        const stats = await practiceAPI.getStats(30);
        setFocusStreak(stats?.overview?.currentStreak || 0);
      } catch (statsError) {
        console.log('Could not load stats, using local streak');
        const localStreak = parseInt(localStorage.getItem('focusStreak')) || 0;
        setFocusStreak(localStreak);
      }
      
      // Also load from localStorage as backup and compare
      const localTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
      const localStreak = parseInt(localStorage.getItem('focusStreak')) || 0;
      
      // Use the larger value (backend or localStorage)
      if (localTotal > todayTotal * 60) {
        setTotalFocusTime(localTotal);
      }
      if (localStreak > focusStreak) {
        setFocusStreak(localStreak);
      }
      
      console.log('✅ Focus data loaded successfully');
      
    } catch (error) {
      console.error('Failed to load focus data:', error);
      setLoadingError(true);
      
      // Fallback to localStorage
      loadFromLocalStorage();
      
    } finally {
      setLoading(false);
    }
  };

  const saveFocusSession = async (minutes) => {
    try {
      // Check if online and token exists
      const token = localStorage.getItem('token');
      if (!token) {
        // Just save to localStorage
        const currentTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
        localStorage.setItem('totalFocusTime', (currentTotal + minutes * 60).toString());
        showNotification('Focus session saved locally (offline mode)', 'success');
        return;
      }
      
      // Try to save to backend
      const sessionData = {
        subject: 'focus',
        topic: 'focus-session',
        totalQuestions: 0,
        correctAnswers: 0,
        timeSpent: minutes,
        difficulty: 'medium',
        notes: `Deep work focus session - ${minutes} minutes`
      };
      
      console.log('📤 Saving focus session:', sessionData);
      
      const response = await practiceAPI.saveSession(sessionData);
      console.log('✅ Focus session saved:', response);
      
      // Also update localStorage
      const currentTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
      localStorage.setItem('totalFocusTime', (currentTotal + minutes * 60).toString());
      
      return response;
    } catch (error) {
      console.error('Failed to save focus session:', error);
      
      // Fallback to localStorage
      const currentTotal = parseInt(localStorage.getItem('totalFocusTime')) || 0;
      localStorage.setItem('totalFocusTime', (currentTotal + minutes * 60).toString());
      showNotification('Saved locally (backend unavailable)', 'info');
      
      throw error;
    }
  };

  useEffect(() => {
    // Update localStorage as backup whenever time changes
    localStorage.setItem('totalFocusTime', totalFocusTime.toString());
    
    // Update streak if more than 1 hour focused today
    if (totalFocusTime >= 3600) {
      const newStreak = Math.max(focusStreak, 1);
      setFocusStreak(newStreak);
      localStorage.setItem('focusStreak', newStreak.toString());
    }
  }, [totalFocusTime]);

  // Keyboard shortcut (Escape to disable)
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
      }, 7200000); // 2 hours
      setAutoDisableTimer(timer);
    } else {
      if (autoDisableTimer) {
        clearTimeout(autoDisableTimer);
        setAutoDisableTimer(null);
      }
    }
  }, [focusActive]);

  // Add overlay styles when active
  useEffect(() => {
    if (overlayActive) {
      document.body.classList.add('focus-overlay-active');
    } else {
      document.body.classList.remove('focus-overlay-active');
    }
  }, [overlayActive]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
    const event = new CustomEvent('show-notification', { detail: { message, type } });
    window.dispatchEvent(event);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const toggleFocusMode = async () => {
    if (!focusActive) {
      // Enable focus mode
      setFocusActive(true);
      document.body.classList.add('focus-active');
      showNotification('Focus mode enabled! Minimizing distractions...');
      
      const id = setInterval(() => {
        setTotalFocusTime(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
      setStartTime(Date.now());
      
    } else {
      // Disable focus mode
      setFocusActive(false);
      document.body.classList.remove('focus-active');
      
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      
      if (startTime) {
        const endTime = Date.now();
        const focusSeconds = Math.round((endTime - startTime) / 1000);
        const focusMinutes = Math.max(1, Math.round(focusSeconds / 60));
        
        try {
          await saveFocusSession(focusMinutes);
          showNotification(`Focus session saved! (${focusMinutes} minutes)`);
        } catch (error) {
          showNotification('Saved locally (offline mode)', 'info');
        }
        
        setStartTime(null);
      }

      // Turn off all features
      if (overlayActive) {
        toggleOverlay();
      }
      if (musicPlaying) {
        toggleMusic();
      }
      if (distractionsBlocked) {
        blockDistractions();
      }
      setShowEmergency(false);
    }
  };

  const toggleMusic = () => {
    const lofiPlayer = document.getElementById('lofi-player');
    if (lofiPlayer) {
      if (!musicPlaying) {
        lofiPlayer.src = "https://www.youtube.com/embed/n61ULEU7CO0?start=0&autoplay=1&loop=1&playlist=n61ULEU7CO0";
        setMusicPlaying(true);
        showNotification('🎵 Lofi music playing...');
      } else {
        lofiPlayer.src = "";
        setMusicPlaying(false);
        showNotification('Music stopped');
      }
    }
  };

  const toggleOverlay = () => {
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
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(124, 58, 237, 0.95));
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
        pointer-events: none;
        animation: focusFadeIn 0.5s ease;
        backdrop-filter: blur(5px);
      `;
      overlay.innerHTML = `
        <div style="text-align: center;">
          <i class="fas fa-brain" style="font-size: 5rem; margin-bottom: 20px;"></i>
          <h2 style="font-size: 3rem; margin-bottom: 10px;">Focus Mode Active</h2>
          <p style="font-size: 1.2rem; opacity: 0.9;">Stay in the zone • You're doing great!</p>
          <div style="margin-top: 30px; font-size: 1.5rem;">
            <i class="fas fa-clock"></i> ${formatTime(totalFocusTime)}
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      setOverlayActive(true);
      showNotification('🔒 Deep focus overlay activated');
    }
  };

  const blockDistractions = () => {
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
      const elementsToBlur = document.querySelectorAll('img, iframe');
      elementsToBlur.forEach(el => {
        el.style.filter = 'none';
      });
      showNotification('Distraction blocking disabled');
    }
  };

  const emergencyDisableAll = () => {
    // Force remove all effects
    document.body.classList.remove('focus-active');
    document.body.classList.remove('focus-overlay-active');
    
    const overlay = document.getElementById('focus-overlay');
    if (overlay) overlay.remove();
    
    if (intervalId) clearInterval(intervalId);
    if (autoDisableTimer) clearTimeout(autoDisableTimer);
    
    setFocusActive(false);
    setOverlayActive(false);
    setMusicPlaying(false);
    setDistractionsBlocked(false);
    setShowEmergency(false);
    
    // Stop music
    const lofiPlayer = document.getElementById('lofi-player');
    if (lofiPlayer) lofiPlayer.src = "";
    
    // Remove blurs
    document.querySelectorAll('img, iframe').forEach(el => {
      el.style.filter = 'none';
    });
    
    showNotification('⚠️ Emergency exit - all features disabled', 'error');
  };

  const retryLoading = () => {
    setLoading(true);
    setLoadingError(false);
    loadFocusData();
  };

  // Show loading state with retry option
  if (loading) {
    return (
      <div className="tool-card feature-card">
        <div className="tool-header">
          <div className="tool-icon">
            <i className="fas fa-crosshairs"></i>
          </div>
          <h2>Focus Mode</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading focus data...</p>
          {loadingError && (
            <button 
              className="btn btn-outline" 
              onClick={retryLoading}
              style={{ marginTop: '15px' }}
            >
              <i className="fas fa-sync-alt"></i> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-crosshairs"></i>
        </div>
        <h2>Focus Mode</h2>
      </div>
      
      {loadingError && (
        <div style={{
          marginBottom: '15px',
          padding: '10px',
          background: '#fff3cd',
          color: '#856404',
          borderRadius: '8px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>Using offline mode - data not synced</span>
          <button 
            onClick={retryLoading}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#856404',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="focus-controls">
        <button
          className={`btn ${focusActive ? 'btn-success' : 'btn-primary'}`}
          onClick={toggleFocusMode}
        >
          <i className={`fas fa-${focusActive ? 'eye-slash' : 'eye'}`}></i>
          {focusActive ? ' Disable Focus Mode' : ' Enable Focus Mode'}
        </button>

        {focusActive && (
          <>
            <div className="focus-actions-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              marginTop: '10px'
            }}>
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
                className="btn btn-outline"
                onClick={() => setShowEmergency(!showEmergency)}
              >
                <i className="fas fa-exclamation-triangle"></i> Emergency
              </button>
            </div>

            {showEmergency && (
              <div style={{
                marginTop: '15px',
                padding: '15px',
                background: '#fee2e2',
                borderRadius: '10px',
                border: '1px solid #ef4444'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>
                  ⚠️ Emergency Exit
                </h4>
                <button
                  onClick={emergencyDisableAll}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-power-off"></i> Disable ALL Features Now
                </button>
                <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#666' }}>
                  Press ESC key anytime to disable
                </p>
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