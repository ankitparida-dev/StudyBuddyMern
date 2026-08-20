import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/NotificationContainer.css';

// Notification icons mapping
const NOTIFICATION_ICONS = {
  success: 'fa-check-circle',
  error: 'fa-exclamation-circle',
  warning: 'fa-exclamation-triangle',
  info: 'fa-info-circle'
};

// Notification colors
const NOTIFICATION_COLORS = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

// Notification sound mapping (optional)
const NOTIFICATION_SOUNDS = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3'
};

const NotificationContainer = ({ 
  position = 'top-right',
  autoDismiss = true,
  dismissTimeout = 5000,
  maxNotifications = 5,
  showProgress = true,
  allowClose = true,
  playSound = false,
  stackDirection = 'vertical'
}) => {
  const { notifications, removeNotification } = useNotifications();
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState({});

  // Handle notification dismissal
  const handleDismiss = useCallback((id) => {
    removeNotification(id);
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  }, [removeNotification]);

  // Handle progress tracking
  useEffect(() => {
    const intervals = {};
    
    notifications.forEach(notification => {
      if (notification.visible && !paused) {
        // Initialize progress if not exists
        if (!progress[notification.id]) {
          setProgress(prev => ({
            ...prev,
            [notification.id]: 100
          }));
        }
        
        // Start progress timer
        intervals[notification.id] = setInterval(() => {
          setProgress(prev => {
            const currentProgress = prev[notification.id] || 100;
            const decrement = 100 / (dismissTimeout / 100);
            const newProgress = Math.max(0, currentProgress - decrement);
            
            if (newProgress <= 0) {
              clearInterval(intervals[notification.id]);
              if (autoDismiss) {
                handleDismiss(notification.id);
              }
              return prev;
            }
            
            return {
              ...prev,
              [notification.id]: newProgress
            };
          });
        }, 100);
      }
    });

    // Cleanup intervals
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [notifications, autoDismiss, dismissTimeout, paused, handleDismiss, progress]);

  // Play sound for new notifications
  useEffect(() => {
    if (playSound) {
      notifications.forEach(notification => {
        if (notification.visible && notification.isNew) {
          const audio = new Audio(NOTIFICATION_SOUNDS[notification.type] || NOTIFICATION_SOUNDS.info);
          audio.volume = 0.3;
          audio.play().catch(() => {});
        }
      });
    }
  }, [notifications, playSound]);

  // Handle hover pause
  const handleMouseEnter = useCallback(() => {
    setPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPaused(false);
  }, []);

  // Handle keydown for accessibility
  const handleKeyDown = useCallback((e, id) => {
    if (e.key === 'Escape' || e.key === 'Delete') {
      handleDismiss(id);
    }
  }, [handleDismiss]);

  // Get container position class
  const positionClass = useMemo(() => {
    const [vertical, horizontal] = position.split('-');
    return `position-${vertical}-${horizontal}`;
  }, [position]);

  // Get stack direction class
  const stackClass = useMemo(() => {
    return `stack-${stackDirection}`;
  }, [stackDirection]);

  // Limit notifications
  const visibleNotifications = useMemo(() => {
    const visible = notifications.filter(n => n.visible);
    if (visible.length > maxNotifications) {
      // Remove oldest notifications first
      const sorted = [...visible].sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = sorted.slice(0, visible.length - maxNotifications);
      toRemove.forEach(n => handleDismiss(n.id));
      return sorted.slice(-maxNotifications);
    }
    return visible;
  }, [notifications, maxNotifications, handleDismiss]);

  return (
    <div 
      className={`notification-container ${positionClass} ${stackClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Notifications"
    >
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`notification ${notification.type} ${notification.visible ? 'visible' : 'hiding'}`}
          style={{
            '--notification-index': index,
            '--notification-color': NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.info
          }}
          role="alert"
          aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
          onKeyDown={(e) => handleKeyDown(e, notification.id)}
          tabIndex={0}
        >
          {/* Progress bar */}
          {showProgress && autoDismiss && (
            <div className="notification-progress">
              <div 
                className="notification-progress-bar"
                style={{ 
                  width: `${progress[notification.id] || 100}%`,
                  backgroundColor: NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.info
                }}
              />
            </div>
          )}

          <div className="notification-content">
            {/* Icon */}
            <div className="notification-icon-wrapper">
              <i className={`fas ${NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.info}`} />
            </div>

            {/* Message */}
            <div className="notification-text-wrapper">
              <div className="notification-title">
                {notification.title || (
                  notification.type === 'error' ? 'Error' :
                  notification.type === 'warning' ? 'Warning' :
                  notification.type === 'success' ? 'Success' : 'Info'
                )}
              </div>
              <div className="notification-message">
                {notification.message}
              </div>
              {notification.timestamp && (
                <div className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Close button */}
            {allowClose && (
              <button 
                className="notification-close"
                onClick={() => handleDismiss(notification.id)}
                aria-label="Dismiss notification"
              >
                <i className="fas fa-times" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="notification-actions">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  className={`notification-action ${action.variant || 'primary'}`}
                  onClick={() => {
                    action.onClick?.();
                    if (action.dismissOnClick !== false) {
                      handleDismiss(notification.id);
                    }
                  }}
                >
                  {action.icon && <i className={`fas ${action.icon}`} />}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ===== PRESET CONTAINERS =====
export const TopRightNotifications = (props) => (
  <NotificationContainer {...props} position="top-right" />
);

export const TopLeftNotifications = (props) => (
  <NotificationContainer {...props} position="top-left" />
);

export const BottomRightNotifications = (props) => (
  <NotificationContainer {...props} position="bottom-right" />
);

export const BottomLeftNotifications = (props) => (
  <NotificationContainer {...props} position="bottom-left" />
);

export default NotificationContainer;