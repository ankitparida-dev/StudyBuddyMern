import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import NotificationContainer from '../components/common/NotificationContainer';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ 
  children, 
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right',
  playSounds = false
}) => {
  const [notifications, setNotifications] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRefs = useRef({});
  const soundRef = useRef(null);

  // Initialize audio context for sounds
  useEffect(() => {
    if (playSounds) {
      soundRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.close();
      }
    };
  }, [playSounds]);

  // Play notification sound
  const playNotificationSound = useCallback((type = 'info') => {
    if (!playSounds || !soundRef.current) return;
    
    try {
      const oscillator = soundRef.current.createOscillator();
      const gainNode = soundRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(soundRef.current.destination);
      
      // Different frequencies for different types
      const frequencies = {
        success: 880,
        error: 440,
        warning: 660,
        info: 770
      };
      
      oscillator.frequency.value = frequencies[type] || 770;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.15, soundRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, soundRef.current.currentTime + 0.3);
      
      oscillator.start(soundRef.current.currentTime);
      oscillator.stop(soundRef.current.currentTime + 0.3);
    } catch (error) {
      console.log('Sound not supported:', error);
    }
  }, [playSounds]);

  // Show notification
  const showNotification = useCallback((message, type = 'success', duration = defaultDuration, actions = []) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration,
      actions,
      visible: true,
      timestamp: Date.now(),
      isNew: true
    };

    // Limit notifications
    setNotifications(prev => {
      const filtered = prev.filter(n => n.visible);
      if (filtered.length >= maxNotifications) {
        // Remove oldest notification
        const oldest = filtered.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
        if (oldest) {
          clearTimeout(timeoutRefs.current[oldest.id]);
          delete timeoutRefs.current[oldest.id];
        }
        return [...prev.filter(n => n.id !== oldest?.id), notification];
      }
      return [...prev, notification];
    });

    // Play sound
    playNotificationSound(type);

    // Auto-dismiss
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        hideNotification(id);
      }, duration);
      timeoutRefs.current[id] = timeoutId;
    }

    return id;
  }, [defaultDuration, maxNotifications, playNotificationSound]);

  // Hide notification
  const hideNotification = useCallback((id) => {
    // Clear timeout
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }

    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, visible: false } : n)
    );
    
    // Remove after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 400);
  }, []);

  // Hide all notifications
  const hideAllNotifications = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};

    setNotifications(prev => 
      prev.map(n => ({ ...n, visible: false }))
    );
    
    setTimeout(() => {
      setNotifications([]);
    }, 400);
  }, []);

  // Pause auto-dismiss
  const pauseAutoDismiss = useCallback(() => {
    setIsPaused(true);
    // Pause all timeouts
    Object.entries(timeoutRefs.current).forEach(([id, timeout]) => {
      clearTimeout(timeout);
      // Store remaining time
      const notification = notifications.find(n => n.id === parseInt(id));
      if (notification) {
        const elapsed = Date.now() - notification.timestamp;
        const remaining = Math.max(0, notification.duration - elapsed);
        timeoutRefs.current[id] = { remaining, paused: true };
      }
    });
  }, [notifications]);

  // Resume auto-dismiss
  const resumeAutoDismiss = useCallback(() => {
    setIsPaused(false);
    // Resume timeouts
    Object.entries(timeoutRefs.current).forEach(([id, data]) => {
      if (data.paused) {
        const timeoutId = setTimeout(() => {
          hideNotification(parseInt(id));
        }, data.remaining);
        timeoutRefs.current[id] = timeoutId;
      }
    });
  }, [hideNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  const value = {
    notifications,
    showNotification,
    hideNotification,
    hideAllNotifications,
    pauseAutoDismiss,
    resumeAutoDismiss,
    isPaused
  };

  return React.createElement(
    NotificationContext.Provider,
    { value },
    children,
    React.createElement(NotificationContainer, { position })
  );
};