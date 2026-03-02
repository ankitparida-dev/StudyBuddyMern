import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/FeaturesSection.css';

const FeaturesSection = () => {
  const { showNotification } = useNotifications();

  const features = [
    {
      icon: 'fa-stethoscope',
      title: 'Weak Topic Diagnosis',
      description: 'AI identifies your weak areas in real-time and creates personalized study plans to strengthen them.',
      className: 'diagnosis-icon',
      buttonText: 'Try Diagnosis'
    },
    {
      icon: 'fa-chart-line',
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics and performance insights tailored for JEE/NEET.',
      className: 'progress-icon',
      buttonText: 'View Progress'
    },
    {
      icon: 'fa-clock',
      title: 'Time Management',
      description: 'Smart scheduling and Pomodoro timers to maximize your study efficiency and minimize distractions.',
      className: 'time-icon',
      buttonText: 'Set Timer'
    }
  ];

  const handleFeatureClick = (featureTitle) => {
    showNotification(`${featureTitle} feature activated!`);
  };

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose StudyBuddy?</h2>
          <p className="section-subtitle">
            Our AI-powered platform adapts to your learning style and helps you achieve better results faster.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <article key={index} className="feature-card interactive-feature">
              <div className="feature-icon-wrapper">
                <div className={`feature-icon ${feature.className}`}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <button 
                className="btn btn-primary btn-animated" 
                onClick={() => handleFeatureClick(feature.title)}
                style={{ marginTop: '15px', width: '100%' }}
              >
                {feature.buttonText}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;