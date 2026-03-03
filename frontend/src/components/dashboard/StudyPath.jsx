import React, { useRef } from 'react';

const StudyPath = ({ examType }) => {
  const pathContainerRef = useRef(null);

  const scrollPath = (direction) => {
    if (pathContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      pathContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const jeeStats = {
    overall: 45,
    topicsDone: 78,
    topicsToGo: 32,
    subjects: [
      { name: 'Physics', progress: 60, color: '#4cc9f0' },
      { name: 'Chemistry', progress: 45, color: '#f8961e' },
      { name: 'Mathematics', progress: 30, color: '#7209b7' }
    ],
    path: [
      { number: 1, title: 'Foundation Building', desc: 'Master basic concepts and formulas', status: 'completed' },
      { number: 2, title: 'Concept Application', desc: 'Solve practice problems and case studies', status: 'inprogress' },
      { number: 3, title: 'Advanced Topics', desc: 'Tackle complex problems and derivations', status: 'pending' },
      { number: 4, title: 'Revision Phase', desc: 'Comprehensive review and mock tests', status: 'pending' },
      { number: 5, title: 'Final Preparation', desc: 'Last-minute tips and strategy sessions', status: 'pending' }
    ]
  };

  const neetStats = {
    overall: 52,
    topicsDone: 92,
    topicsToGo: 48,
    subjects: [
      { name: 'Physics', progress: 45, color: '#4cc9f0' },
      { name: 'Chemistry', progress: 55, color: '#f8961e' },
      { name: 'Biology', progress: 65, color: '#4caf50' }
    ],
    path: [
      { number: 1, title: 'Foundation Building', desc: 'Master basic concepts and formulas', status: 'completed' },
      { number: 2, title: 'Concept Application', desc: 'Solve practice problems and case studies', status: 'inprogress' },
      { number: 3, title: 'Advanced Topics', desc: 'Tackle complex problems and derivations', status: 'pending' },
      { number: 4, title: 'Revision Phase', desc: 'Comprehensive review and mock tests', status: 'pending' },
      { number: 5, title: 'Final Preparation', desc: 'Last-minute tips and strategy sessions', status: 'pending' }
    ]
  };

  const stats = examType === 'jee' ? jeeStats : neetStats;

  return (
    <div className="study-path-container">
      <div className="section-header">
        <h2 className="section-title">Your {examType.toUpperCase()} Study Plan</h2>
        <p className="section-subtitle">Track your progress and stay on schedule with your personalized study plan</p>
      </div>

      <div className="progress-tracker">
        <div className="tracker-header">
          <h2 className="tracker-title">Your Learning Progress</h2>
          <div className="tracker-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.overall}%</div>
              <div className="stat-label">Overall</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.topicsDone}</div>
              <div className="stat-label">Topics Done</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.topicsToGo}</div>
              <div className="stat-label">To Go</div>
            </div>
          </div>
        </div>
        
        <div className="subject-progress">
          {stats.subjects.map((subject, index) => (
            <div key={index} className={`progress-item ${subject.name.toLowerCase()} interactive`}>
              <div className="progress-icon">
                <i className={`fas fa-${subject.name === 'Physics' ? 'atom' : subject.name === 'Chemistry' ? 'flask' : subject.name === 'Mathematics' ? 'square-root-alt' : 'dna'}`}></i>
              </div>
              <div className="progress-details">
                <div className="progress-info">
                  <span>{subject.name}</span>
                  <span>{subject.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="study-path">
        <div className="path-header">
          <h2 className="path-title">{examType.toUpperCase()} Preparation Path</h2>
          <div className="path-controls">
            <button className="path-control" onClick={() => scrollPath('left')}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="path-control" onClick={() => scrollPath('right')}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div className="path-container" ref={pathContainerRef}>
          {stats.path.map((step, index) => (
            <div key={index} className="path-step interactive">
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
              <div className={`step-status status-${step.status}`}>
                {step.status === 'completed' ? 'Completed' : step.status === 'inprogress' ? 'In Progress' : 'Upcoming'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyPath;