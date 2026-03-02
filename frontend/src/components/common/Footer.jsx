import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">StudyBuddy</h3>
            <p className="footer-description">
              AI-powered learning platform to help you achieve your academic goals faster and more efficiently.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/study-tools">Study Tools</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Exams</h3>
            <ul className="footer-links">
              <li><a href="#">JEE Main & Advanced</a></li>
              <li><a href="#">NEET UG</a></li>
              <li><a href="#">Foundation Courses</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <ul className="footer-links contact-info">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Education St, Learn City</span>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <span>+1 234 567 8900</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>info@studybuddy.com</span>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Powered By</h3>
            <div className="gemini-branding">
              <div className="gemini-logo">
                <i className="fab fa-google"></i>
                <span>Google Gemini AI</span>
              </div>
              <p className="gemini-description">
                Advanced AI technology powering your learning experience
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; 2025 StudyBuddy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;