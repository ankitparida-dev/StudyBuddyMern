import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { sendNotificationEmail } from '../../services/emailService';
import logo from '../../assets/StudyBuddyLogo.jpg';
import '../../styles/Header.css';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showNotification } = useNotifications();
  const location = useLocation();
  const [notificationDot, setNotificationDot] = useState(true);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/study-tools', label: 'Study Tools' },
    { path: '/settings', label: 'Settings' }
  ];

  const handleNotificationClick = async () => {
    const email = prompt("Enter your email to get study reminders:", "your-email@gmail.com");

    if (email && email.includes('@')) {
      try {
        await sendNotificationEmail({
          recipient: email,
          subject: "You're subscribed to StudyBuddy Reminders! 🚀",
          body: "Hey! You're all set to receive study tips, reminders, and motivation right in your inbox. Stay focused!"
        });
        showNotification('Subscription successful! Check your inbox.');
        setNotificationDot(false);
      } catch (error) {
        showNotification('Failed to subscribe. Please try again.', 'error');
      }
    } else if (email) {
      showNotification('Please enter a valid email address.', 'error');
    }
  };

  return (
    <header className="main-header">
      <div className="container">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/" className="logo">
              <img src={logo} alt="StudyBuddy Logo" />
              <span className="brand-name">StudyBuddy</span>
            </Link>
          </div>

          <ul className="nav-menu">
            {navItems.map(item => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-controls">
            <button 
              className="notification-btn" 
              onClick={handleNotificationClick}
              title="Notifications"
            >
              <i className="fas fa-bell"></i>
              {notificationDot && <span className="notification-dot"></span>}
            </button>

            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>

            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary btn-animated">
                Login / Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;