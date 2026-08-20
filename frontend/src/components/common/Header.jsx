import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = useMemo(() => [
    { path: '/', label: 'Home', icon: 'fa-home' },
    { path: '/features', label: 'Features', icon: 'fa-star' },
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { path: '/study-tools', label: 'Study Tools', icon: 'fa-tools' },
    { path: '/settings', label: 'Settings', icon: 'fa-cog' }
  ], []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Handle notification click
  const handleNotificationClick = useCallback(async () => {
    const email = prompt('Enter your email to get study reminders:', 'your-email@gmail.com');

    if (!email) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    try {
      await sendNotificationEmail({
        recipient: email,
        subject: "You're subscribed to StudyBuddy Reminders! 🚀",
        body: "Hey! You're all set to receive study tips, reminders, and motivation right in your inbox. Stay focused!"
      });
      showNotification('✅ Subscription successful! Check your inbox.');
      setNotificationDot(false);
    } catch (error) {
      console.error('Notification subscription error:', error);
      showNotification('Failed to subscribe. Please try again.', 'error');
    }
  }, [showNotification]);

  // Handle theme toggle
  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          {/* Logo */}
          <div className="nav-brand">
            <Link to="/" className="logo" aria-label="StudyBuddy Home">
              <img src={logo} alt="StudyBuddy Logo" />
              <span className="brand-name">StudyBuddy</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>

          {/* Navigation Menu */}
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {navItems.map(item => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <i className={`fas ${item.icon}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side Controls */}
          <div className="nav-controls">
            {/* Notification Button */}
            <button 
              className="notification-btn" 
              onClick={handleNotificationClick}
              title="Get Study Reminders"
              aria-label="Notifications"
            >
              <i className="fas fa-bell" />
              {notificationDot && <span className="notification-dot" />}
            </button>

            {/* Theme Toggle */}
            <button 
              className="theme-toggle" 
              onClick={handleThemeToggle}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} />
            </button>

            {/* Auth Button */}
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary">
                <i className="fas fa-sign-in-alt" />
                <span>Login / Sign Up</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;