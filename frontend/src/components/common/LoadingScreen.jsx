import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLoading } from '../../hooks/useLoading';
import logo from '../../assets/StudyBuddyLogo.jpg';
import '../../styles/LoadingScreen.css';

// Loading messages for different progress stages
const LOADING_MESSAGES = {
  initial: [
    'Initializing your learning environment...',
    'Warming up the AI engine...',
    'Connecting to StudyBuddy servers...'
  ],
  preparing: [
    'Loading personalized study materials...',
    'Analyzing your learning preferences...',
    'Preparing your study dashboard...'
  ],
  loading: [
    'Loading your courses and subjects...',
    'Gathering your progress data...',
    'Syncing your study history...'
  ],
  almost: [
    'Almost ready! Finalizing setup...',
    'Optimizing your learning experience...',
    'Calibrating AI assistant...'
  ],
  complete: [
    'Ready! Welcome to StudyBuddy!',
    'All set! Let\'s start learning!',
    'Your learning journey begins now!'
  ]
};

// Loading tips to display
const STUDY_TIPS = [
  '💡 Consistency is key - study for 25 minutes, take a 5-minute break',
  '📚 Review your notes within 24 hours for better retention',
  '🎯 Set specific, measurable goals for each study session',
  '🧠 Active recall is more effective than passive reading',
  '⏰ Morning hours are often best for focused studying',
  '📝 Practice problems are essential for exam preparation',
  '🌙 Get 7-8 hours of sleep for optimal memory consolidation',
  '📊 Track your progress to stay motivated and identify weak areas'
];

const LoadingScreen = ({ 
  showTips = true,
  showStats = true,
  showProgress = true,
  minDuration = 2000,
  onComplete = null
}) => {
  const { progress = 0, isLoading = true } = useLoading();
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentTip, setCurrentTip] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Get message based on progress
  const getMessageForProgress = useCallback((progressValue) => {
    if (progressValue < 20) {
      return LOADING_MESSAGES.initial[Math.floor(Math.random() * LOADING_MESSAGES.initial.length)];
    } else if (progressValue < 40) {
      return LOADING_MESSAGES.preparing[Math.floor(Math.random() * LOADING_MESSAGES.preparing.length)];
    } else if (progressValue < 70) {
      return LOADING_MESSAGES.loading[Math.floor(Math.random() * LOADING_MESSAGES.loading.length)];
    } else if (progressValue < 95) {
      return LOADING_MESSAGES.almost[Math.floor(Math.random() * LOADING_MESSAGES.almost.length)];
    } else {
      return LOADING_MESSAGES.complete[Math.floor(Math.random() * LOADING_MESSAGES.complete.length)];
    }
  }, []);

  // Update message when progress changes
  useEffect(() => {
    if (progress >= 0 && progress <= 100) {
      const newMessage = getMessageForProgress(progress);
      setCurrentMessage(newMessage);
      
      // Reset show message to trigger animation
      setShowMessage(false);
      setTimeout(() => setShowMessage(true), 50);
    }
  }, [progress, getMessageForProgress]);

  // Rotate tips
  useEffect(() => {
    if (!showTips) return;
    
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
      setCurrentTip(STUDY_TIPS[tipIndex]);
    }, 4000);

    setCurrentTip(STUDY_TIPS[0]);

    return () => clearInterval(tipInterval);
  }, [showTips, tipIndex]);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle completion
  useEffect(() => {
    if (progress >= 100 && !isLoading) {
      setTimeout(() => {
        onComplete?.();
      }, minDuration);
    }
  }, [progress, isLoading, onComplete, minDuration]);

  // Format time
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  // Get loading status
  const getLoadingStatus = useCallback((progressValue) => {
    if (progressValue < 20) return 'Connecting...';
    if (progressValue < 40) return 'Preparing...';
    if (progressValue < 70) return 'Loading...';
    if (progressValue < 95) return 'Almost ready...';
    return 'Complete!';
  }, []);

  // Memoized stats
  const stats = useMemo(() => [
    {
      value: progress < 100 ? `${Math.round(progress)}%` : '✓',
      label: progress < 100 ? 'Loaded' : 'Ready',
      icon: progress < 100 ? 'fa-spinner fa-pulse' : 'fa-check-circle'
    },
    {
      value: 'AI',
      label: 'Powered',
      icon: 'fa-robot'
    },
    {
      value: formatTime(elapsedTime),
      label: 'Time Elapsed',
      icon: 'fa-clock'
    }
  ], [progress, elapsedTime, formatTime]);

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-content">
        {/* Logo Section */}
        <div className="loading-logo">
          <div className="logo-wrapper">
            <img src={logo} alt="StudyBuddy Logo" />
            <div className="logo-ring"></div>
          </div>
          <div className="logo-text-wrapper">
            <span className="logo-text">StudyBuddy</span>
            <span className="logo-subtitle">AI Learning Assistant</span>
          </div>
        </div>

        {/* Animation Section */}
        <div className="loading-animation">
          <div className="loading-book">
            <i className="fas fa-book-open"></i>
            <div className="book-glow"></div>
          </div>

          {/* Message */}
          <div className="loading-text-content">
            <h2 className={`loading-text ${showMessage ? 'visible' : ''}`}>
              {currentMessage}
            </h2>
            <p className="loading-subtext">
              {getLoadingStatus(progress)}
            </p>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="progress-container">
              <div className="progress-track">
                <div 
                  className={`progress-bar ${progress >= 100 ? 'complete' : ''}`} 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, progress))}%` 
                  }}
                />
              </div>
              <div className="progress-label">
                <span className="progress-percentage">
                  {Math.round(progress)}%
                </span>
                <span className="progress-status">
                  {progress >= 100 ? '🎉 Ready!' : 'Loading...'}
                </span>
              </div>
            </div>
          )}

          {/* Loading Tips */}
          {showTips && currentTip && (
            <div className="loading-tips">
              <div className="tip-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <p className="tip-text">
                <span className="tip-label">Study Tip:</span>
                <span className="tip-content">{currentTip}</span>
              </p>
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="loading-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat">
                  <div className="stat-icon">
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Version/Branding */}
        <div className="loading-footer">
          <span className="version">v2.0.0</span>
          <span className="separator">•</span>
          <span className="powered-by">Powered by Google Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;