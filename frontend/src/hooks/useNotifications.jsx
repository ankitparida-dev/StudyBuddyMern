import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      visible: true
    };

    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, visible: false } : n)
      );
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 400);
    }, 4000);

    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, visible: false } : n)
    );
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 400);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${notification.type} ${notification.visible ? 'visible' : 'hiding'}`}
        >
          <div className="notification-content">
            <i className={`fas fa-${notification.type === 'error' ? 'exclamation' : 'check'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};