import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/study-tools', label: 'Study Tools' },
    { path: '/settings', label: 'Settings' }
  ];

  const examLinks = [
    { label: 'JEE Main & Advanced', href: '#' },
    { label: 'NEET UG', href: '#' },
    { label: 'Foundation Courses', href: '#' }
  ];

  const socialLinks = [
    { icon: 'fa-facebook-f', label: 'Facebook', href: '#' },
    { icon: 'fa-twitter', label: 'Twitter', href: '#' },
    { icon: 'fa-instagram', label: 'Instagram', href: '#' },
    { icon: 'fa-linkedin-in', label: 'LinkedIn', href: '#' },
    { icon: 'fa-youtube', label: 'YouTube', href: '#' }
  ];

  const contactInfo = [
    { icon: 'fa-map-marker-alt', text: '123 Education St, Learn City' },
    { icon: 'fa-phone', text: '+1 234 567 8900' },
    { icon: 'fa-envelope', text: 'info@studybuddy.com' }
  ];

  return (
    <footer className="main-footer" role="contentinfo">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <h3 className="footer-title">StudyBuddy</h3>
            <p className="footer-description">
              AI-powered learning platform to help you achieve your academic goals faster and more efficiently.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`fab ${social.icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Exams */}
          <div className="footer-section">
            <h3 className="footer-title">Exams</h3>
            <ul className="footer-links">
              {examLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="footer-links contact-info">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  <i className={`fas ${item.icon}`} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Powered By */}
          <div className="footer-section">
            <h3 className="footer-title">Powered By</h3>
            <div className="gemini-branding">
              <div className="gemini-logo">
                <i className="fab fa-google" />
                <span>Google Gemini AI</span>
              </div>
              <p className="gemini-description">
                Advanced AI technology powering your learning experience
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>
              &copy; {currentYear} StudyBuddy. All rights reserved. 
              <span className="separator">|</span>
              <a href="/privacy">Privacy Policy</a>
              <span className="separator">|</span>
              <a href="/terms">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;