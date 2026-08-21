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
  onComplete = null,
  customLogo = null
}) => {
  // Get loading state from the hook
  const { isLoading, progress = 0, loadingMessage: hookMessage, isTimeout } = useLoading();
  
  const [currentTip, setCurrentTip] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Get message based on progress (fallback if hook message not available)
  const getMessageForProgress = useCallback((progressValue) => {
    if (progressValue < 20) {
      const messages = LOADING_MESSAGES.initial;
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (progressValue < 40) {
      const messages = LOADING_MESSAGES.preparing;
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (progressValue < 70) {
      const messages = LOADING_MESSAGES.loading;
      return messages[Math.floor(Math.random() * messages.length)];
    } else if (progressValue < 95) {
      const messages = LOADING_MESSAGES.almost;
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const messages = LOADING_MESSAGES.complete;
      return messages[Math.floor(Math.random() * messages.length)];
    }
  }, []);

  // Get current display message (prefer hook message, fallback to generated)
  const displayMessage = useMemo(() => {
    if (hookMessage && hookMessage !== 'Loading...') {
      return hookMessage;
    }
    return getMessageForProgress(progress);
  }, [hookMessage, progress, getMessageForProgress]);

  // Get loading status
  const getLoadingStatus = useCallback((progressValue) => {
    if (isTimeout) return '⏳ Timeout';
    if (progressValue < 20) return 'Connecting...';
    if (progressValue < 40) return 'Preparing...';
    if (progressValue < 70) return 'Loading...';
    if (progressValue < 95) return 'Almost ready...';
    if (progressValue >= 100) return 'Complete!';
    return 'Loading...';
  }, [isTimeout]);

  // Rotate tips
  useEffect(() => {
    if (!showTips) return;
    
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 4000);

    setCurrentTip(STUDY_TIPS[0]);

    return () => clearInterval(tipInterval);
  }, [showTips]);

  // Update current tip when index changes
  useEffect(() => {
    setCurrentTip(STUDY_TIPS[tipIndex]);
  }, [tipIndex]);

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

  // Memoized stats
  const stats = useMemo(() => [
    {
      value: progress < 100 ? `${Math.round(progress)}%` : '✓',
      label: progress < 100 ? 'Loaded' : 'Ready',
      icon: progress < 100 ? 'fa-spinner fa-pulse' : 'fa-check-circle'
    },
    {
      value: isTimeout ? '⏳' : 'AI',
      label: isTimeout ? 'Timeout' : 'Powered',
      icon: isTimeout ? 'fa-exclamation-triangle' : 'fa-robot'
    },
    {
      value: formatTime(elapsedTime),
      label: 'Time Elapsed',
      icon: 'fa-clock'
    }
  ], [progress, elapsedTime, formatTime, isTimeout]);

  // Don't render if not loading
  if (!isLoading) return null;

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-content">
        {/* Logo Section */}
        <div className="loading-logo">
          <div className="logo-wrapper">
            <img src={customLogo || logo} alt="StudyBuddy Logo" />
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
            <h2 className={`loading-text ${displayMessage ? 'visible' : ''} ${isTimeout ? 'timeout' : ''}`}>
              {isTimeout ? '⏳ Taking longer than expected...' : displayMessage}
            </h2>
            <p className="loading-subtext">
              {getLoadingStatus(progress)}
              {isTimeout && ' • Please wait or try refreshing'}
            </p>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="progress-container">
              <div className="progress-track">
                <div 
                  className={`progress-bar ${isTimeout ? 'timeout' : ''} ${progress >= 100 ? 'complete' : ''}`} 
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
                  {isTimeout ? '⏳ Timeout' : progress >= 100 ? '🎉 Ready!' : 'Loading...'}
                </span>
              </div>
            </div>
          )}

          {/* Loading Tips */}
          {showTips && currentTip && !isTimeout && (
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

          {/* Timeout Message */}
          {isTimeout && (
            <div className="timeout-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>Loading is taking longer than expected. You can wait or try refreshing.</span>
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