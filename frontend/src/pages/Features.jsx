import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Features.css';

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [hoveredExam, setHoveredExam] = useState(null);

  useEffect(() => {
    // Scroll animations with staggered delay
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Add staggered animation to children
            const children = entry.target.querySelectorAll('.stagger-item');
            children.forEach((child, index) => {
              child.style.transitionDelay = `${index * 0.1}s`;
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.feature-card-large, .feature-card-compact, .exam-card').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const mainFeatures = [
    {
      icon: 'fa-robot',
      title: 'AI-Powered Learning Assistant',
      description: '24/7 AI support for instant doubt clarification, personalized study recommendations, and intelligent progress tracking.',
      color: '#2563eb',
      stats: { responses: '1M+', accuracy: '95%', topics: '10K+' },
      details: [
        'Real-time doubt solving',
        'Personalized study plans',
        'Topic recommendations',
        'Performance predictions'
      ]
    },
    {
      icon: 'fa-chart-line',
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your study patterns, productivity trends, and areas needing improvement.',
      color: '#10b981',
      stats: { reports: 'Weekly', analysis: 'Real-time', insights: 'Deep' },
      details: [
        'Weekly progress reports',
        'Topic-wise analysis',
        'Time tracking',
        'Accuracy metrics'
      ]
    },
    {
      icon: 'fa-clock',
      title: 'Smart Time Management',
      description: 'Pomodoro timer, focus mode, and smart scheduling to maximize your study efficiency.',
      color: '#8b5cf6',
      stats: { sessions: '1000+', focus: '40% more', breaks: 'Smart' },
      details: [
        'Pomodoro timer',
        'Focus mode',
        'Study streaks',
        'Break reminders'
      ]
    }
  ];

  const secondaryFeatures = [
    {
      icon: 'fa-bullseye',
      title: 'Daily Goals',
      description: 'Set and track daily study goals to stay motivated and consistent.',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
    },
    {
      icon: 'fa-book-open',
      title: 'Complete Syllabus Coverage',
      description: 'JEE & NEET syllabus organized with topic-wise breakdown and progress tracking.',
      gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)'
    },
    {
      icon: 'fa-fire',
      title: 'Study Streaks',
      description: 'Build consistency with streak tracking and achievement milestones.',
      gradient: 'linear-gradient(135deg, #ef4444, #f87171)'
    },
    {
      icon: 'fa-tasks',
      title: 'Practice Tracker',
      description: 'Track daily practice questions, accuracy, and performance over time.',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
    },
    {
      icon: 'fa-music',
      title: 'Smart Breaks',
      description: 'Guided break activities and lofi music to refresh your mind.',
      gradient: 'linear-gradient(135deg, #ec4899, #f472b6)'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Distraction-Free Mode',
      description: 'Block distractions and stay focused with our focus mode.',
      gradient: 'linear-gradient(135deg, #14b8a6, #2dd4bf)'
    }
  ];

  const examFeatures = [
    {
      exam: 'JEE Main & Advanced',
      icon: 'fa-calculator',
      color: '#06b6d4',
      stats: { students: '50K+', success: '85%', topics: '40+' },
      features: [
        'Complete Physics, Chemistry, Math syllabus',
        'Topic-wise weightage analysis',
        'Previous year question practice',
        'JEE-specific study plans'
      ]
    },
    {
      exam: 'NEET UG',
      icon: 'fa-dna',
      color: '#10b981',
      stats: { students: '45K+', success: '82%', topics: '35+' },
      features: [
        'Complete Physics, Chemistry, Biology syllabus',
        'NCERT-focused content',
        'Medical entrance exam strategies',
        'NEET-specific mock tests'
      ]
    }
  ];

  return (
    <div className="features-page">
      {/* Hero Section with Particles Effect */}
      <section className="features-hero">
        <div className="hero-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="container">
          <h1 className="features-hero-title animate-fade-in">
            Powerful Features for <span className="gradient-text">Exam Success</span>
          </h1>
          <p className="features-hero-subtitle animate-fade-in-delay">
            Everything you need to crack JEE & NEET with confidence
          </p>
          <div className="hero-stats animate-fade-in-delay-2">
            <div className="hero-stat">
              <span className="hero-stat-value">100K+</span>
              <span className="hero-stat-label">Active Students</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">95%</span>
              <span className="hero-stat-label">Success Rate</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">AI Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features with Interactive Cards */}
      <section className="main-features-section">
        <div className="container">
          <h2 className="section-title text-center">Core Features</h2>
          <p className="section-subtitle text-center">
            AI-powered tools designed to optimize your learning journey
          </p>

          <div className="main-features-grid">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card-large ${activeFeature === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div className="feature-card-inner">
                  <div className="feature-icon-large" style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }}>
                    <i className={`fas ${feature.icon}`}></i>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  
                  {/* Stats Row */}
                  <div className="feature-stats">
                    {Object.entries(feature.stats).map(([key, value]) => (
                      <div key={key} className="feature-stat">
                        <span className="feature-stat-value">{value}</span>
                        <span className="feature-stat-label">{key}</span>
                      </div>
                    ))}
                  </div>

                  {/* Details List with Animation */}
                  <ul className="feature-details-list">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="stagger-item">
                        <i className="fas fa-check-circle" style={{ color: feature.color }}></i>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="feature-learn-more">
                    Learn More <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features Grid with Hover Effects */}
      <section className="all-features-section">
        <div className="container">
          <h2 className="section-title text-center">Everything You Need</h2>
          <p className="section-subtitle text-center">
            Comprehensive tools to boost your productivity
          </p>

          <div className="features-grid-compact">
            {secondaryFeatures.map((feature, index) => (
              <div key={index} className="feature-card-compact stagger-item">
                <div className="feature-icon-compact" style={{ background: feature.gradient }}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-card-hover-effect"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam-Specific Features with 3D Effect */}
      <section className="exam-features-section">
        <div className="container">
          <h2 className="section-title text-center">Exam-Specific Preparation</h2>
          <p className="section-subtitle text-center">
            Tailored content for your target exam
          </p>

          <div className="exam-features-grid">
            {examFeatures.map((exam, index) => (
              <div 
                key={index} 
                className={`exam-card ${hoveredExam === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredExam(index)}
                onMouseLeave={() => setHoveredExam(null)}
              >
                <div className="exam-card-inner">
                  <div className="exam-header" style={{ background: `linear-gradient(135deg, ${exam.color}, ${exam.color}dd)` }}>
                    <i className={`fas ${exam.icon}`}></i>
                    <h3>{exam.exam}</h3>
                  </div>
                  <div className="exam-body">
                    {/* Stats */}
                    <div className="exam-stats">
                      {Object.entries(exam.stats).map(([key, value]) => (
                        <div key={key} className="exam-stat">
                          <span className="exam-stat-value">{value}</span>
                          <span className="exam-stat-label">{key}</span>
                        </div>
                      ))}
                    </div>

                    {/* Features List */}
                    <ul>
                      {exam.features.map((feature, idx) => (
                        <li key={idx} className="stagger-item">
                          <i className="fas fa-check" style={{ color: exam.color }}></i>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button className="exam-cta" style={{ background: exam.color }}>
                      Start Preparing <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Call to Action */}
      <section className="features-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of successful students preparing with StudyBuddy</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary btn-large pulse-animation">
                Get Started Free <i className="fas fa-rocket"></i>
              </Link>
              <Link to="/study-tools" className="btn btn-outline btn-large">
                Try Study Tools <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <i className="fas fa-shield-alt"></i>
                <span>Secure & Private</span>
              </div>
              <div className="trust-badge">
                <i className="fas fa-clock"></i>
                <span>24/7 Support</span>
              </div>
              <div className="trust-badge">
                <i className="fas fa-star"></i>
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;