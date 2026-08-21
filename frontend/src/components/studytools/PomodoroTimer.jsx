import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
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
  const [notification, setNotification] = useState(null);
  const [breakType, setBreakType] = useState('short');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStartBreak, setAutoStartBreak] = useState(true);
  const [autoStartStudy, setAutoStartStudy] = useState(true);
  const [pomodoroLength, setPomodoroLength] = useState(25);
  const [shortBreakLength, setShortBreakLength] = useState(5);
  const [longBreakLength, setLongBreakLength] = useState(15);
  const timerRef = useRef(null);

  // Subjects
  const subjects = useMemo(() => [
    { id: 'physics', name: 'Physics', icon: 'fa-atom', color: '#4cc9f0' },
    { id: 'chemistry', name: 'Chemistry', icon: 'fa-flask', color: '#f8961e' },
    { id: 'math', name: 'Mathematics', icon: 'fa-square-root-alt', color: '#7209b7' },
    { id: 'biology', name: 'Biology', icon: 'fa-dna', color: '#4caf50' }
  ], []);

  // Expose methods
  useImperativeHandle(ref, () => ({
    startQuickSession: (minutes) => {
      setTimeLeft(minutes * 60);
      setIsBreak(false);
      setSelectedSubject('general');
      setShowSubjectSelector(true);
    },
    pauseTimer: () => setIsRunning(false),
    startTimer: () => {
      if (selectedSubject !== 'general' || isBreak) {
        setIsRunning(true);
      } else {
        setShowSubjectSelector(true);
      }
    }
  }));

  // Load today's total
  useEffect(() => {
    loadTodayTotal();
  }, []);

  // Event listeners
  useEffect(() => {
    const handleQuickSession = (e) => {
      setTimeLeft(e.detail.minutes * 60);
      setIsBreak(false);
      setSelectedSubject('general');
      setShowSubjectSelector(true);
    };

    window.addEventListener('quick-session-start', handleQuickSession);
    return () => window.removeEventListener('quick-session-start', handleQuickSession);
  }, []);

  const loadTodayTotal = useCallback(async () => {
    try {
      const data = await practiceAPI.getSessions(1, 50);
      const sessions = data.sessions || [];
      const today = new Date().toDateString();
      const todaySessions = sessions.filter(s => 
        new Date(s.date).toDateString() === today
      );
      const total = todaySessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);
      setTodayTotal(total);
    } catch (error) {
      console.error('Failed to load today\'s total:', error);
    }
  }, []);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
    const event = new CustomEvent('show-notification', { detail: { message, type } });
    window.dispatchEvent(event);
  }, []);

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
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
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }, [soundEnabled]);

  const handleTimerComplete = useCallback(async () => {
    playSound();
    
    if (!isBreak) {
      // Study session completed
      const minutes = pomodoroLength;
      const subjectToSave = selectedSubject === 'general' ? 'physics' : selectedSubject;
      
      try {
        const sessionData = {
          subject: subjectToSave,
          topic: 'pomodoro-session',
          totalQuestions: 0,
          correctAnswers: 0,
          timeSpent: minutes,
          difficulty: 'medium',
          notes: `Completed Pomodoro session`
        };
        
        await practiceAPI.saveSession(sessionData);
        setTodayTotal(prev => prev + minutes);
        showNotification('✅ Pomodoro session saved!');
        
      } catch (error) {
        console.error('Failed to save session:', error);
        showNotification('Failed to save session', 'error');
      }
      
      setSessionCount(prev => prev + 1);
      
      // Determine break type
      const newBreakType = (sessionCount + 1) % 4 === 0 ? 'long' : 'short';
      setBreakType(newBreakType);
      setIsBreak(true);
      setTimeLeft(newBreakType === 'long' ? longBreakLength * 60 : shortBreakLength * 60);
      
      showNotification(`☕ ${newBreakType === 'long' ? 'Long' : 'Short'} break started!`);
      
    } else {
      // Break completed
      setIsBreak(false);
      setTimeLeft(pomodoroLength * 60);
      showNotification('Break over! Time to focus again.');
    }
  }, [isBreak, pomodoroLength, selectedSubject, sessionCount, shortBreakLength, longBreakLength, playSound, showNotification]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const startTimer = useCallback(() => {
    if (selectedSubject === 'general' && !isBreak) {
      setShowSubjectSelector(true);
    } else {
      setIsRunning(true);
    }
  }, [selectedSubject, isBreak]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(pomodoroLength * 60);
    setSessionCount(0);
    setSelectedSubject('general');
  }, [pomodoroLength]);

  const handleSubjectSelect = useCallback((subject) => {
    setSelectedSubject(subject);
    setShowSubjectSelector(false);
    setIsRunning(true);
  }, []);

  const getStatusText = useCallback(() => {
    if (isBreak) {
      return breakType === 'long' ? 'Long Break' : 'Short Break';
    }
    return 'Study';
  }, [isBreak, breakType]);

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon"><i className="fas fa-hourglass-half"></i></div>
        <h2>Pomodoro Timer</h2>
        <span className="session-count">{sessionCount} / 4</span>
      </div>
      
      <div className={`timer-container ${isRunning ? 'timer-active' : ''}`}>
        <div className="timer-display">{formatTime()}</div>
        
        {/* Status */}
        <div className="timer-status">
          <span className={`status-badge ${isBreak ? 'break' : 'study'}`}>
            {getStatusText()}
          </span>
          {!isBreak && selectedSubject !== 'general' && (
            <span className="subject-badge">
              {subjects.find(s => s.id === selectedSubject)?.name}
            </span>
          )}
        </div>
        
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
                    style={{ '--subject-color': subject.color }}
                  >
                    <i className={`fas ${subject.icon}`}></i>
                    <span>{subject.name}</span>
                  </button>
                ))}
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSubjectSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="timer-controls">
          {!isRunning ? (
            <button className="timer-btn btn-primary" onClick={startTimer}>
              <i className="fas fa-play"></i> {isBreak ? 'Start Break' : 'Start'}
            </button>
          ) : (
            <button className="timer-btn btn-warning" onClick={pauseTimer}>
              <i className="fas fa-pause"></i> Pause
            </button>
          )}
          <button className="timer-btn btn-secondary" onClick={resetTimer}>
            <i className="fas fa-redo"></i> Reset
          </button>
        </div>

        {/* Sessions */}
        <div className="timer-sessions">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`session-dot ${i < sessionCount ? 'active' : ''} ${i === sessionCount && isRunning ? 'current' : ''}`}
            />
          ))}
        </div>

        {/* Settings */}
        <div className="timer-settings">
          <div className="setting-group">
            <label>
              <i className="fas fa-volume-up"></i>
              <input 
                type="checkbox" 
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
            </label>
            <label>
              <i className="fas fa-play-circle"></i>
              <input 
                type="checkbox" 
                checked={autoStartBreak}
                onChange={(e) => setAutoStartBreak(e.target.checked)}
                title="Auto-start breaks"
              />
            </label>
          </div>
        </div>

        {/* Today's Total */}
        <div className="today-total">
          <i className="fas fa-clock"></i>
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