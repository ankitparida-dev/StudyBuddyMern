// frontend/src/hooks/useLoading.js
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ 
  children, 
  minDuration = 1500, 
  maxDuration = 10000
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isTimeout, setIsTimeout] = useState(false);
  
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);
  const completeTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // Loading messages for different stages
  const loadingMessages = useCallback((progressValue) => {
    const messageSets = [
      { max: 20, messages: [
        'Initializing your learning environment...',
        'Connecting to StudyBuddy servers...',
        'Warming up the AI engine...'
      ]},
      { max: 40, messages: [
        'Loading personalized study materials...',
        'Analyzing your learning preferences...',
        'Preparing your study dashboard...'
      ]},
      { max: 60, messages: [
        'Loading your courses and subjects...',
        'Gathering your progress data...',
        'Syncing your study history...'
      ]},
      { max: 80, messages: [
        'Almost ready! Finalizing setup...',
        'Optimizing your learning experience...',
        'Calibrating AI assistant...'
      ]},
      { max: 100, messages: [
        'Ready! Welcome to StudyBuddy!',
        'All set! Let\'s start learning!',
        'Your learning journey begins now!'
      ]}
    ];

    const set = messageSets.find(s => progressValue <= s.max) || messageSets[messageSets.length - 1];
    const randomIndex = Math.floor(Math.random() * set.messages.length);
    return set.messages[randomIndex];
  }, []);

  // Update loading message based on progress
  const updateLoadingMessage = useCallback((currentProgress) => {
    if (!mountedRef.current) return;
    const message = loadingMessages(currentProgress);
    setLoadingMessage(message);
  }, [loadingMessages]);

  // Force complete loading
  const completeLoading = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Clear all intervals and timeouts
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setProgress(100);
    setIsTimeout(false);

    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    const remaining = Math.max(0, minDuration - elapsed);

    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
    }

    completeTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }, remaining);
  }, [minDuration]);

  // Start loading process
  const startLoading = useCallback(() => {
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    setProgress(0);
    setIsTimeout(false);
    setLoadingMessage('Loading...');
    startTimeRef.current = Date.now();

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set max duration timeout
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        console.warn('⚠️ Loading timeout - force completing');
        setIsTimeout(true);
        completeLoading();
      }
    }, maxDuration);

    completeTimeoutRef.current = setTimeout(() => {
      completeLoading();
    }, minDuration);

    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      
      setProgress(prev => {
        const elapsed = Date.now() - startTimeRef.current;
        const targetProgress = Math.min(95, (elapsed / maxDuration) * 100);
        const newProgress = Math.min(
          prev + (targetProgress - prev) * 0.1 + 0.5,
          95
        );
        updateLoadingMessage(newProgress);
        return newProgress;
      });
    }, 100);
  }, [maxDuration, minDuration, completeLoading, updateLoadingMessage]);

  // Reset loading
  const resetLoading = useCallback(() => {
    if (!mountedRef.current) return;
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current);
      completeTimeoutRef.current = null;
    }

    setIsLoading(true);
    setProgress(0);
    setIsTimeout(false);
    setLoadingMessage('Loading...');
    startTimeRef.current = Date.now();
    startLoading();
  }, [startLoading]);

  // Auto-start loading on mount
  useEffect(() => {
    mountedRef.current = true;
    startLoading();

    return () => {
      mountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
        completeTimeoutRef.current = null;
      }
    };
  }, [startLoading]);

  // Auto-complete when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && isLoading && mountedRef.current && !isTimeout) {
      completeLoading();
    }
  }, [progress, isLoading, completeLoading, isTimeout]);

  const value = {
    isLoading,
    progress,
    loadingMessage,
    isTimeout,
    completeLoading,
    startLoading,
    resetLoading
  };

  return React.createElement(
    LoadingContext.Provider,
    { value },
    children
  );
};

// ===== CUSTOM HOOKS =====

// Hook to force complete loading
export const useForceComplete = () => {
  const { completeLoading, isLoading } = useLoading();
  
  return useCallback(() => {
    if (isLoading) {
      completeLoading();
    }
  }, [isLoading, completeLoading]);
};

// Hook to check if loading is taking too long
export const useLoadingTimeout = (callback, delay = 5000) => {
  const { isLoading, isTimeout } = useLoading();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        callback?.();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, callback, delay]);

  return { isTimeout };
};

export default LoadingProvider;