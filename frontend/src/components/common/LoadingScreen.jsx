import React from 'react';
import { useLoading } from '../../hooks/useLoading';
import logo from '../../assets/StudyBuddyLogo.jpg';
import '../../styles/LoadingScreen.css';

const LoadingScreen = () => {
  const { progress } = useLoading();

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <img src={logo} alt="StudyBuddy Logo" />
          <span className="logo-text">StudyBuddy</span>
        </div>
        
        <div className="loading-animation">
          <div className="loading-book">
            <i className="fas fa-book-open"></i>
          </div>
          
          <div className="loading-text-content">
            <h2 className="loading-text">Preparing Your AI Learning Journey</h2>
            <p className="loading-subtext">Loading personalized study materials...</p>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="loading-stats">
            <div className="stat">
              <div className="stat-number">{Math.round(progress)}%</div>
              <div className="stat-label">Loaded</div>
            </div>
            <div className="stat">
              <div className="stat-number">AI</div>
              <div className="stat-label">Ready</div>
            </div>
            <div className="stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">Focused</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;