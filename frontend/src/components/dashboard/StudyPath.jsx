import React, { useRef, useState, useMemo, useCallback } from 'react';
import '../../styles/StudyPath.css';

const StudyPath = ({ examType, progress = {}, onPathClick = null }) => {
  const pathContainerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  // Study path data
  const pathData = useMemo(() => {
    const basePath = [
      { 
        number: 1, 
        title: 'Foundation Building', 
        desc: 'Master basic concepts and formulas',
        longDesc: 'Build a strong foundation by understanding core concepts, fundamental principles, and essential formulas. This phase is crucial for long-term success.',
        status: 'completed',
        icon: 'fa-layer-group',
        estimatedTime: '4-6 weeks'
      },
      { 
        number: 2, 
        title: 'Concept Application', 
        desc: 'Solve practice problems and case studies',
        longDesc: 'Apply your knowledge to solve a variety of problems, from basic to intermediate level. Focus on understanding problem-solving approaches.',
        status: 'inprogress',
        icon: 'fa-puzzle-piece',
        estimatedTime: '6-8 weeks'
      },
      { 
        number: 3, 
        title: 'Advanced Topics', 
        desc: 'Tackle complex problems and derivations',
        longDesc: 'Challenge yourself with advanced concepts, complex derivations, and high-level problems. Perfect your problem-solving speed and accuracy.',
        status: 'pending',
        icon: 'fa-rocket',
        estimatedTime: '6-8 weeks'
      },
      { 
        number: 4, 
        title: 'Revision Phase', 
        desc: 'Comprehensive review and mock tests',
        longDesc: 'Intensive revision of all topics, solving mock tests, and analyzing performance patterns. Identify and strengthen weak areas.',
        status: 'pending',
        icon: 'fa-sync-alt',
        estimatedTime: '4-6 weeks'
      },
      { 
        number: 5, 
        title: 'Final Preparation', 
        desc: 'Last-minute tips and strategy sessions',
        longDesc: 'Final strategy sessions, time management techniques, and exam-day preparation. Build confidence and reduce anxiety.',
        status: 'pending',
        icon: 'fa-flag-checkered',
        estimatedTime: '2-4 weeks'
      }
    ];

    // Update statuses based on progress
    return basePath.map(step => {
      if (step.number <= progress.completedSteps) {
        return { ...step, status: 'completed' };
      }
      return step;
    });
  }, [progress.completedSteps]);

  // Subject progress data
  const subjectData = useMemo(() => {
    const baseSubjects = examType === 'jee' 
      ? [
          { name: 'Physics', icon: 'fa-atom', color: '#4cc9f0', gradient: 'linear-gradient(135deg, #4cc9f0, #4895ef)' },
          { name: 'Chemistry', icon: 'fa-flask', color: '#f8961e', gradient: 'linear-gradient(135deg, #f8961e, #f3722c)' },
          { name: 'Mathematics', icon: 'fa-square-root-alt', color: '#7209b7', gradient: 'linear-gradient(135deg, #7209b7, #560bad)' }
        ]
      : [
          { name: 'Physics', icon: 'fa-atom', color: '#4cc9f0', gradient: 'linear-gradient(135deg, #4cc9f0, #4895ef)' },
          { name: 'Chemistry', icon: 'fa-flask', color: '#f8961e', gradient: 'linear-gradient(135deg, #f8961e, #f3722c)' },
          { name: 'Biology', icon: 'fa-dna', color: '#4caf50', gradient: 'linear-gradient(135deg, #4caf50, #2e7d32)' }
        ];

    return baseSubjects.map(subject => ({
      ...subject,
      progress: progress.subjects?.[subject.name.toLowerCase()] || Math.floor(Math.random() * 40) + 30,
      topicsCompleted: progress.subjects?.[subject.name.toLowerCase() + 'Completed'] || Math.floor(Math.random() * 20) + 10,
      totalTopics: progress.subjects?.[subject.name.toLowerCase() + 'Total'] || 30
    }));
  }, [examType, progress]);

  const scrollPath = useCallback((direction) => {
    if (pathContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      pathContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const handleStepClick = useCallback((step) => {
    setActiveStep(step.number === activeStep ? null : step.number);
    onPathClick?.(step);
  }, [activeStep, onPathClick]);

  const getStatusIcon = useCallback((status) => {
    const icons = {
      completed: 'fa-check-circle',
      inprogress: 'fa-spinner fa-pulse',
      pending: 'fa-circle'
    };
    return icons[status] || icons.pending;
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      completed: '#10b981',
      inprogress: '#f59e0b',
      pending: '#94a3b8'
    };
    return colors[status] || colors.pending;
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      completed: 'Completed ✓',
      inprogress: 'In Progress',
      pending: 'Upcoming'
    };
    return labels[status] || labels.pending;
  }, []);

  return (
    <div className="study-path-container">
      <div className="section-header">
        <h2 className="section-title">
          <i className="fas fa-road"></i>
          Your {examType.toUpperCase()} Study Plan
        </h2>
        <p className="section-subtitle">
          Track your progress and stay on schedule with your personalized study plan
          <span className="progress-badge">
            {Math.round(progress.overall || 0)}% Complete
          </span>
        </p>
      </div>

      {/* Subject Progress */}
      <div className="subject-progress-container">
        <h3 className="subject-progress-title">
          <i className="fas fa-chart-bar"></i>
          Subject-wise Progress
        </h3>
        <div className="subject-progress-grid">
          {subjectData.map((subject, index) => (
            <div key={index} className="subject-progress-card interactive">
              <div className="subject-progress-header">
                <div className="subject-progress-icon" style={{ background: subject.gradient }}>
                  <i className={`fas ${subject.icon}`}></i>
                </div>
                <div className="subject-progress-info">
                  <span className="subject-name">{subject.name}</span>
                  <span className="subject-progress-value">{subject.progress}%</span>
                </div>
              </div>
              <div className="subject-progress-track">
                <div 
                  className="subject-progress-fill"
                  style={{ 
                    width: `${subject.progress}%`,
                    background: subject.gradient
                  }}
                />
              </div>
              <div className="subject-progress-meta">
                <span>{subject.topicsCompleted} / {subject.totalTopics} topics</span>
                {subject.progress >= 70 && <span className="subject-badge">🌟 Good</span>}
                {subject.progress >= 90 && <span className="subject-badge">🏆 Excellent</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Path */}
      <div className="study-path">
        <div className="path-header">
          <h3 className="path-title">
            <i className="fas fa-route"></i>
            {examType.toUpperCase()} Preparation Path
          </h3>
          <div className="path-controls">
            <button className="path-control" onClick={() => scrollPath('left')} aria-label="Scroll left">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="path-control" onClick={() => scrollPath('right')} aria-label="Scroll right">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="path-container" ref={pathContainerRef}>
          {pathData.map((step, index) => (
            <div 
              key={index} 
              className={`path-step 
                ${step.status} 
                ${activeStep === step.number ? 'expanded' : ''} 
                ${hoveredStep === step.number ? 'hovered' : ''}
              `}
              onClick={() => handleStepClick(step)}
              onMouseEnter={() => setHoveredStep(step.number)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="step-status-indicator">
                <div 
                  className="step-status-circle"
                  style={{ borderColor: getStatusColor(step.status) }}
                >
                  {step.status === 'completed' && (
                    <i className="fas fa-check" style={{ color: '#10b981' }} />
                  )}
                  {step.status === 'inprogress' && (
                    <i className="fas fa-spinner fa-pulse" style={{ color: '#f59e0b' }} />
                  )}
                  {step.status === 'pending' && (
                    <span className="step-number-small">{step.number}</span>
                  )}
                </div>
                <div className="step-connector" style={{ backgroundColor: getStatusColor(step.status) }} />
              </div>

              <div className="step-content">
                <div className="step-icon">
                  <i className={`fas ${step.icon}`}></i>
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                  <div className="step-meta">
                    <span className="step-time">
                      <i className="fas fa-clock"></i> {step.estimatedTime}
                    </span>
                    <span className={`step-status-label status-${step.status}`}>
                      <i className={`fas ${getStatusIcon(step.status)}`}></i>
                      {getStatusLabel(step.status)}
                    </span>
                  </div>
                </div>
              </div>

              {activeStep === step.number && (
                <div className="step-details">
                  <p>{step.longDesc}</p>
                  <div className="step-actions">
                    {step.status !== 'completed' && (
                      <button className="btn btn-primary btn-sm">
                        <i className="fas fa-play"></i> Start
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm">
                      <i className="fas fa-info-circle"></i> Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="path-legend">
          <span className="legend-item">
            <span className="legend-dot completed"></span>
            Completed
          </span>
          <span className="legend-item">
            <span className="legend-dot inprogress"></span>
            In Progress
          </span>
          <span className="legend-item">
            <span className="legend-dot pending"></span>
            Upcoming
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudyPath;