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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleThemeToggle = () => {
    console.log('Theme toggled - Current:', isDarkMode ? 'dark' : 'light');
    toggleTheme();
  };

  return (
    <header className="main-header">
      <div className="container">
        <nav className="navbar">
          {/* Logo */}
          <div className="nav-brand">
            <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
              <img src={logo} alt="StudyBuddy Logo" />
              <span className="brand-name">StudyBuddy</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Navigation Menu */}
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navItems.map(item => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side Controls */}
          <div className="nav-controls">
            {/* Notification Bell Button */}
            <button 
              className="notification-btn" 
              onClick={handleNotificationClick}
              title="Get Study Reminders"
              aria-label="Notifications"
            >
              <i className="fas fa-bell"></i>
              {notificationDot && <span className="notification-dot"></span>}
            </button>

            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle" 
              onClick={handleThemeToggle}
              aria-label="Toggle dark mode"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </button>

            {/* Login Button */}
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">
                <i className="fas fa-sign-in-alt"></i> Login / Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;