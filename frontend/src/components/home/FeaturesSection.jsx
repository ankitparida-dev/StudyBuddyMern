import React, { useState, useCallback } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/FeaturesSection.css';

const FeaturesSection = ({ onFeatureClick = null }) => {
  const { showNotification } = useNotifications();
  const [activeFeature, setActiveFeature] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      id: 'diagnosis',
      icon: 'fa-stethoscope',
      title: 'Weak Topic Diagnosis',
      description: 'AI identifies your weak areas in real-time and creates personalized study plans to strengthen them.',
      className: 'diagnosis-icon',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      buttonText: 'Try Diagnosis',
      benefits: ['Real-time analysis', 'Personalized plans', 'Progress tracking'],
      stats: { accuracy: '95%', topics: '50+', time: '2x faster' }
    },
    {
      id: 'progress',
      icon: 'fa-chart-line',
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics and performance insights tailored for JEE/NEET.',
      className: 'progress-icon',
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      buttonText: 'View Progress',
      benefits: ['Detailed analytics', 'Performance insights', 'Goal tracking'],
      stats: { reports: 'Weekly', analysis: 'Real-time', insights: 'Deep' }
    },
    {
      id: 'time',
      icon: 'fa-clock',
      title: 'Time Management',
      description: 'Smart scheduling and Pomodoro timers to maximize your study efficiency and minimize distractions.',
      className: 'time-icon',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      buttonText: 'Set Timer',
      benefits: ['Pomodoro timer', 'Smart scheduling', 'Focus mode'],
      stats: { sessions: '1000+', focus: '40%', breaks: 'Smart' }
    },
    {
      id: 'ai',
      icon: 'fa-robot',
      title: 'AI Assistant',
      description: '24/7 AI support for instant doubt clarification, personalized recommendations, and intelligent tutoring.',
      className: 'ai-icon',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      buttonText: 'Chat Now',
      benefits: ['24/7 support', 'Instant responses', 'Personalized help'],
      stats: { responses: '1M+', accuracy: '98%', satisfaction: '4.9/5' }
    }
  ];

  const handleFeatureClick = useCallback((feature) => {
    setActiveFeature(feature.id);
    showNotification(`${feature.title} feature activated!`);
    onFeatureClick?.(feature);
  }, [onFeatureClick, showNotification]);

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fas fa-star"></i>
            Why Choose StudyBuddy?
          </h2>
          <p className="section-subtitle">
            Our AI-powered platform adapts to your learning style and helps you achieve better results faster.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <article 
              key={index} 
              className={`feature-card interactive-feature 
                ${activeFeature === feature.id ? 'active' : ''} 
                ${hoveredFeature === feature.id ? 'hovered' : ''}
              `}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{ '--feature-color': feature.color }}
            >
              <div className="feature-badge">{feature.stats.accuracy}</div>
              
              <div className="feature-icon-wrapper">
                <div className={`feature-icon ${feature.className}`} style={{ background: feature.gradient }}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
              </div>
              
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>

              <div className="feature-benefits">
                {feature.benefits.map((benefit, idx) => (
                  <span key={idx} className="benefit-tag">
                    <i className="fas fa-check" style={{ color: feature.color }}></i>
                    {benefit}
                  </span>
                ))}
              </div>

              <button 
                className="btn btn-primary btn-animated" 
                onClick={() => handleFeatureClick(feature)}
                style={{ 
                  background: feature.gradient,
                  marginTop: '15px', 
                  width: '100%' 
                }}
              >
                {feature.buttonText}
                <i className="fas fa-arrow-right"></i>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;