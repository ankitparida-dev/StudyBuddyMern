import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/HeroSection.css';

const HeroSection = ({ onExamSelect = null }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const { showNotification } = useNotifications();

  const texts = useMemo(() => [
    "Personalized Learning Paths",
    "AI-Powered Study Plans",
    "Smart Progress Tracking",
    "Time Management Tools",
    "Instant Doubt Resolution"
  ], []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentText = texts[textIndex];
      
      if (isDeleting) {
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else {
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }

      if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTextIndex((textIndex + 1) % texts.length);
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts]);

  const handleExamSelect = useCallback((exam) => {
    const examName = exam.toUpperCase();
    showNotification(`Starting ${examName} preparation journey...`);
    onExamSelect?.(exam);
  }, [onExamSelect, showNotification]);

  return (
    <section className="hero-section">
      <div className="hero-particles">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              '--delay': `${Math.random() * 5}s`,
              '--size': `${Math.random() * 6 + 2}px`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <i className="fas fa-sparkles"></i>
              Powered by Google Gemini AI
            </div>

            <h1 className="hero-title">
              AI-Powered <span className="highlight">JEE & NEET</span> Prep
            </h1>

            <div className="typing-container">
              <span className="type-text">{displayText}</span>
              <span className="cursor">|</span>
            </div>

            <p className="hero-description">
              Crack JEE & NEET with your AI-powered exam coach.
              Personalized guidance, real-time progress tracking, and smarter time management to help you stay ahead.
            </p>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">AI Support</span>
              </div>
            </div>

            <div className="exam-selection">
              <button 
                className="exam-btn jee-btn btn-animated" 
                onClick={() => handleExamSelect('jee')}
              >
                <i className="fas fa-calculator"></i>
                <span>Prepare for JEE</span>
                <span className="btn-tag">Main & Advanced</span>
              </button>
              <button 
                className="exam-btn neet-btn btn-animated" 
                onClick={() => handleExamSelect('neet')}
              >
                <i className="fas fa-dna"></i>
                <span>Prepare for NEET</span>
                <span className="btn-tag">UG</span>
              </button>
            </div>

            <div className="hero-features">
              <span className="hero-feature">
                <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                Free to start
              </span>
              <span className="hero-feature">
                <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                No credit card
              </span>
              <span className="hero-feature">
                <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                Cancel anytime
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-placeholder floating-animation">
              <div className="hero-orb">
                <div className="orb-core"></div>
                <div className="orb-ring ring-1"></div>
                <div className="orb-ring ring-2"></div>
                <div className="orb-ring ring-3"></div>
              </div>
              <div className="hero-content-icons">
                <div className="icon-item icon-1">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="icon-item icon-2">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="icon-item icon-3">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="icon-item icon-4">
                  <i className="fas fa-book"></i>
                </div>
              </div>
              <div className="hero-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;