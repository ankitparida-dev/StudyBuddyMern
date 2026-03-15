import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { practiceAPI } from '../../services/api';
import '../../styles/PomodoroTimer.css';

const PomodoroTimer = forwardRef((props, ref) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const timerRef = useRef(null);
  const [notification, setNotification] = useState(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    startQuickSession: (minutes) => {
      console.log(`🚀 Quick session started: ${minutes} minutes`);
      setTimeLeft(minutes * 60);
      setIsBreak(false);
      setSelectedSubject('general');
      setShowSubjectSelector(true);
    },
    pauseTimer: () => {
      console.log('⏸️ Timer paused');
      setIsRunning(false);
    },
    startTimer: () => {
      console.log('▶️ Timer start requested');
      if (selectedSubject !== 'general' || isBreak) {
        setIsRunning(true);
      } else {
        setShowSubjectSelector(true);
      }
    }
  }));

  // Load today's total on mount
  useEffect(() => {
    console.log('📊 Loading today\'s total...');
    loadTodayTotal();
  }, []);

  // Listen for quick session events
  useEffect(() => {
    const handleQuickSession = (e) => {
      console.log(`🚀 Quick session event: ${e.detail.minutes} minutes`);
      setTimeLeft(e.detail.minutes * 60);
      setIsBreak(false);
      setSelectedSubject('general');
      setShowSubjectSelector(true);
    };

    const handleTimerPause = () => {
      console.log('⏸️ Timer pause event received');
      setIsRunning(false);
    };
    
    const handleTimerResume = () => {
      console.log('▶️ Timer resume event received');
      if (selectedSubject !== 'general' || isBreak) {
        setIsRunning(true);
      }
    };

    window.addEventListener('quick-session-start', handleQuickSession);
    window.addEventListener('timer-pause', handleTimerPause);
    window.addEventListener('timer-resume', handleTimerResume);

    return () => {
      window.removeEventListener('quick-session-start', handleQuickSession);
      window.removeEventListener('timer-pause', handleTimerPause);
      window.removeEventListener('timer-resume', handleTimerResume);
    };
  }, [selectedSubject, isBreak]);

  const loadTodayTotal = async () => {
    try {
      const data = await practiceAPI.getSessions(1, 50);
      const sessions = data.sessions || [];
      const today = new Date().toDateString();
      const todaySessions = sessions.filter(s => 
        new Date(s.date).toDateString() === today
      );
      const total = todaySessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
      setTodayTotal(total);
      console.log(`📊 Today's total: ${Math.floor(total / 60)}h ${total % 60}m`);
    } catch (error) {
      console.error('❌ Failed to load today\'s total:', error);
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const showNotification = (message, type = 'success') => {
    console.log(`🔔 Notification: ${message} (${type})`);
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
    
    // Also dispatch global event
    const event = new CustomEvent('show-notification', { detail: { message, type } });
    window.dispatchEvent(event);
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('🔊 Notification sound played');
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = async () => {
    console.log('⏰ Timer completed!');
    
    if (!isBreak) {
      // Study session completed
      const minutes = 25; // Default Pomodoro length
      
      console.log('🔵 Study session completed!');
      console.log(`   Subject: ${selectedSubject}`);
      console.log(`   Minutes: ${minutes}`);
      
      try {
        // Make sure we have a valid subject
        const subjectToSave = selectedSubject === 'general' ? 'physics' : selectedSubject;
        
        const sessionData = {
          subject: subjectToSave,
          topic: 'pomodoro-session',
          totalQuestions: 0,
          correctAnswers: 0,
          timeSpent: minutes,
          difficulty: 'medium',
          notes: `Completed Pomodoro session`
        };
        
        console.log('📤 Sending to API:', sessionData);
        
        const response = await practiceAPI.saveSession(sessionData);
        
        console.log('📥 API Response:', response);
        console.log('✅ Session saved with ID:', response._id);
        
        // Update today's total
        setTodayTotal(prev => {
          const newTotal = prev + minutes;
          console.log(`📊 Today's total updated: ${Math.floor(newTotal / 60)}h ${newTotal % 60}m`);
          return newTotal;
        });
        
        showNotification('Pomodoro session saved!');
        
      } catch (error) {
        console.error('❌ Failed to save session:', error);
        console.error('   Error details:', error.message);
        showNotification('Failed to save session', 'error');
      }
      
      // Start break
      setSessionCount(prev => {
        const newCount = prev + 1;
        console.log(`🔄 Session count: ${newCount}`);
        return newCount;
      });
      
      setIsBreak(true);
      setTimeLeft(5 * 60);
      console.log('☕ Starting 5-minute break');
      showNotification('Study session completed! Time for a 5-minute break.');
      playNotificationSound();
      
    } else {
      // Break completed
      console.log('✅ Break completed!');
      setIsBreak(false);
      setTimeLeft(25 * 60);
      showNotification('Break over! Time to focus again.');
      playNotificationSound();
    }
  };

  const startTimer = () => {
    console.log('▶️ Start button clicked');
    if (selectedSubject === 'general' && !isBreak) {
      console.log('📚 Showing subject selector');
      setShowSubjectSelector(true);
    } else {
      console.log(`▶️ Starting timer with subject: ${selectedSubject}`);
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    console.log('⏸️ Pause button clicked');
    setIsRunning(false);
  };

  const resetTimer = () => {
    console.log('🔄 Reset button clicked');
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
    setSessionCount(0);
    setSelectedSubject('general');
    console.log('🔄 Timer reset to 25:00');
  };

  const handleSubjectSelect = (subject) => {
    console.log(`📚 Subject selected: ${subject}`);
    setSelectedSubject(subject);
    setShowSubjectSelector(false);
    setIsRunning(true);
  };

  const subjects = [
    { id: 'physics', name: 'Physics', icon: 'fa-atom' },
    { id: 'chemistry', name: 'Chemistry', icon: 'fa-flask' },
    { id: 'math', name: 'Mathematics', icon: 'fa-square-root-alt' },
    { id: 'biology', name: 'Biology', icon: 'fa-dna' }
  ];

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-hourglass-half"></i>
        </div>
        <h2>Pomodoro Timer</h2>
      </div>
      
      <div className={`timer-container ${isRunning ? 'timer-active' : ''}`}>
        <div className="timer-display">{formatTime()}</div>
        
        {/* Subject Selector Modal */}
        {showSubjectSelector && (
          <div className="subject-selector-modal">
            <div className="modal-content">
              <h3>What are you studying?</h3>
              <div className="subject-grid">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    className="subject-option"
                    onClick={() => handleSubjectSelect(subject.id)}
                  >
                    <i className={`fas ${subject.icon}`}></i>
                    <span>{subject.name}</span>
                  </button>
                ))}
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  console.log('❌ Subject selection cancelled');
                  setShowSubjectSelector(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Subject Display */}
        {selectedSubject !== 'general' && !isBreak && (
          <div className="current-subject">
            Studying: {subjects.find(s => s.id === selectedSubject)?.name}
            <button onClick={() => {
              console.log('✏️ Changing subject');
              setSelectedSubject('general');
            }}>
              <i className="fas fa-edit"></i>
            </button>
          </div>
        )}

        <div className="timer-controls">
          {!isRunning ? (
            <button className="timer-btn btn-primary" onClick={startTimer}>
              <i className="fas fa-play"></i> {isBreak ? 'Start Break' : 'Start'}
            </button>
          ) : (
            <button className="timer-btn btn-primary" onClick={pauseTimer}>
              <i className="fas fa-pause"></i> Pause
            </button>
          )}
          <button className="timer-btn btn-outline" onClick={resetTimer}>
            <i className="fas fa-redo"></i> Reset
          </button>
        </div>

        <div className="timer-sessions">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`session-dot ${i < sessionCount ? 'active' : ''}`}
            ></div>
          ))}
        </div>

        <p className="session-info">
          Current Session: <span>{isBreak ? 'Break' : 'Study'}</span>
        </p>

        {/* Today's Total from Backend */}
        <div className="today-total">
          Today's study time: {Math.floor(todayTotal / 60)}h {todayTotal % 60}m
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
});

export default PomodoroTimer;