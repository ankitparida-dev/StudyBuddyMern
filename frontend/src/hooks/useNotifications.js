import React, { createContext, useState, useContext, useCallback } from 'react';
import NotificationContainer from '../components/common/NotificationContainer';

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

  return React.createElement(
    NotificationContext.Provider,
    { value: { notifications, showNotification, hideNotification } },
    children,
    React.createElement(NotificationContainer)
  );
};