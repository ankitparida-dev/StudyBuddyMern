import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/HeroSection.css';

const HeroSection = () => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const { showNotification } = useNotifications();

  const texts = [
    "Personalized Learning Paths",
    "AI-Powered Study Plans",
    "Smart Progress Tracking",
    "Time Management Tools"
  ];

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

  const handleExamSelect = (exam) => {
    showNotification(`Starting ${exam.toUpperCase()} preparation journey...`);
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
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

            <div className="exam-selection">
              <button 
                className="exam-btn jee-btn btn-animated" 
                onClick={() => handleExamSelect('jee')}
              >
                <i className="fas fa-calculator"></i>
                <span>Prepare for JEE</span>
              </button>
              <button 
                className="exam-btn neet-btn btn-animated" 
                onClick={() => handleExamSelect('neet')}
              >
                <i className="fas fa-dna"></i>
                <span>Prepare for NEET</span>
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-placeholder floating-animation">
              <i className="fas fa-graduation-cap"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;