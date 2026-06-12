import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

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

export default NotificationContainer;