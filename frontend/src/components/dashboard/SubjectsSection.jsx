import React, { useState, useMemo, useCallback } from 'react';
import '../../styles/SubjectsSection.css';

const SubjectsSection = ({ examType, subjectStats = {}, onTopicClick = null }) => {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Subject data
  const subjectsData = useMemo(() => {
    const baseSubjects = examType === 'jee' 
      ? [
          {
            name: 'Physics',
            icon: '⚡',
            color: '#4cc9f0',
            gradient: 'linear-gradient(135deg, #4cc9f0, #4895ef)',
            headerClass: 'physics-header',
            class11: [
              'Kinematics', 'Laws of Motion', 'Work, Energy, Power', 
              'Rotational Motion', 'Thermodynamics', 'Gravitation'
            ],
            class12: [
              'Electrostatics', 'Current Electricity', 'Magnetic Effects',
              'EMI & AC', 'Ray Optics', 'Modern Physics', 'Wave Optics'
            ]
          },
          {
            name: 'Chemistry',
            icon: '🧪',
            color: '#f8961e',
            gradient: 'linear-gradient(135deg, #f8961e, #f3722c)',
            headerClass: 'chemistry-header',
            class11: [
              'Mole Concept', 'Atomic Structure', 'Chemical Bonding',
              'Equilibrium', 'Thermodynamics', 'States of Matter'
            ],
            class12: [
              'Solutions', 'Electrochemistry', 'P-Block Elements',
              'Organic Reactions', 'Coordination Compounds', 'Biomolecules'
            ]
          },
          {
            name: 'Mathematics',
            icon: '📐',
            color: '#7209b7',
            gradient: 'linear-gradient(135deg, #7209b7, #560bad)',
            headerClass: 'math-header',
            class11: [
              'Sets, Relations, Functions', 'Trigonometry', 'Conic Sections',
              'Permutations & Combinations', 'Straight Lines', 'Complex Numbers'
            ],
            class12: [
              'Calculus (D&I)', 'Vectors & 3D', 'Probability',
              'Differential Equations', 'Matrices & Determinants', 'Linear Programming'
            ]
          }
        ]
      : [
          {
            name: 'Physics',
            icon: '⚡',
            color: '#4cc9f0',
            gradient: 'linear-gradient(135deg, #4cc9f0, #4895ef)',
            headerClass: 'physics-header',
            class11: [
              'Physical World & Measurement', 'Kinematics', 'Laws of Motion',
              'Work, Energy, Power', 'Motion of System of Particles', 'Properties of Matter'
            ],
            class12: [
              'Electrostatics', 'Current Electricity', 'Magnetic Effects',
              'Electromagnetic Waves', 'Optics', 'Dual Nature of Matter', 'Atoms & Nuclei'
            ]
          },
          {
            name: 'Chemistry',
            icon: '🧪',
            color: '#f8961e',
            gradient: 'linear-gradient(135deg, #f8961e, #f3722c)',
            headerClass: 'chemistry-header',
            class11: [
              'Some Basic Concepts', 'Structure of Atom', 'Classification of Elements',
              'Chemical Bonding', 'States of Matter', 'Thermodynamics'
            ],
            class12: [
              'Solid State', 'Solutions', 'Electrochemistry',
              'Chemical Kinetics', 'Surface Chemistry', 'Coordination Compounds'
            ]
          },
          {
            name: 'Biology',
            icon: '🧬',
            color: '#4caf50',
            gradient: 'linear-gradient(135deg, #4caf50, #2e7d32)',
            headerClass: 'biology-header',
            class11: [
              'Diversity in Living World', 'Structural Organization', 'Cell Structure & Function',
              'Plant Physiology', 'Human Physiology', 'Animal Kingdom'
            ],
            class12: [
              'Reproduction', 'Genetics & Evolution', 'Biology & Human Welfare',
              'Biotechnology', 'Ecology', 'Environmental Issues'
            ]
          }
        ];

    // Normalize the numeric and object shapes returned by different dashboard APIs.
    return baseSubjects.map(subject => {
      const subjectKey = subject.name.toLowerCase();
      const rawStats = subjectStats[subjectKey];
      const stats = typeof rawStats === 'object' && rawStats !== null ? rawStats : {};
      const numericProgress = typeof rawStats === 'number' ? rawStats : stats.progress ?? stats.accuracy ?? 0;
      const numericTopics = typeof rawStats === 'number'
        ? subjectStats[`${subjectKey}Completed`] || 0
        : stats.topicsCompleted ?? stats.completed ?? 0;

      return {
        ...subject,
        progress: Number.isFinite(Number(numericProgress)) ? Math.max(0, Math.min(100, Number(numericProgress))) : 0,
        topicsCompleted: Number.isFinite(Number(numericTopics)) ? Math.max(0, Number(numericTopics)) : 0
      };
    });
  }, [examType, subjectStats]);

  const toggleSubject = useCallback((subjectName) => {
    setExpandedSubject(prev => prev === subjectName ? null : subjectName);
  }, []);

  const handleTopicClick = useCallback((subject, topic, classLevel) => {
    setSelectedTopic({ subject, topic, classLevel });
    onTopicClick?.({ subject, topic, classLevel });
  }, [onTopicClick]);

  return (
    <div className="subjects-container">
      <div className="section-header">
        <h2 className="section-title">
          <i className="fas fa-book-open"></i>
          {examType.toUpperCase()} Subjects & Topics
        </h2>
        <p className="section-subtitle">
          Explore all topics covered in your syllabus with detailed breakdown
          <span className="subject-count">{subjectsData.length} Subjects</span>
        </p>
      </div>

      <div className="subjects-grid">
        {subjectsData.map((subject, index) => (
          <div 
            key={index} 
            className={`subject-card-detailed ${expandedSubject === subject.name ? 'expanded' : ''}`}
            style={{ '--subject-color': subject.color }}
          >
            <div 
              className={`subject-card-header ${subject.headerClass}`}
              onClick={() => toggleSubject(subject.name)}
            >
              <div className="subject-header-content">
                <div className="subject-header-icon">
                  <span className="subject-emoji">{subject.icon}</span>
                </div>
                <div className="subject-header-info">
                  <h2>{subject.name}</h2>
                  <p>Master concepts and ace your exams</p>
                </div>
              </div>
              <div className="subject-header-stats">
                <div className="subject-progress-ring">
                  <svg viewBox="0 0 36 36">
                    <path
                      className="ring-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="ring-progress"
                      strokeDasharray={`${subject.progress}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      style={{ stroke: subject.color }}
                    />
                  </svg>
                  <span className="progress-text">{subject.progress}%</span>
                </div>
                <div className="subject-toggle">
                  <i className={`fas fa-chevron-${expandedSubject === subject.name ? 'up' : 'down'}`}></i>
                </div>
              </div>
            </div>

            <div className="subject-card-content">
              <div className="topic-block">
                <h3>
                  <i className="fas fa-graduation-cap"></i>
                  Class 11 Topics
                  <span className="topic-count">{subject.class11.length} topics</span>
                </h3>
                <ul>
                  {subject.class11.map((topic, idx) => (
                    <li 
                      key={idx} 
                      className="interactive"
                      onClick={() => handleTopicClick(subject.name, topic, 'Class 11')}
                    >
                      <span className="topic-dot" style={{ backgroundColor: subject.color }}></span>
                      <span className="topic-name">{topic}</span>
                      <span className="topic-status">
                        <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="topic-block">
                <h3>
                  <i className="fas fa-user-graduate"></i>
                  Class 12 Topics
                  <span className="topic-count">{subject.class12.length} topics</span>
                </h3>
                <ul>
                  {subject.class12.map((topic, idx) => (
                    <li 
                      key={idx} 
                      className="interactive"
                      onClick={() => handleTopicClick(subject.name, topic, 'Class 12')}
                    >
                      <span className="topic-dot" style={{ backgroundColor: subject.color }}></span>
                      <span className="topic-name">{topic}</span>
                      <span className="topic-status pending">
                        <i className="fas fa-clock" style={{ color: '#94a3b8' }}></i>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="subject-actions">
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-play"></i> Start Practice
                </button>
                <button className="btn btn-secondary btn-sm">
                  <i className="fas fa-file-alt"></i> View Notes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTopic && (
        <div className="selected-topic-info">
          <h4>
            <i className="fas fa-bullseye"></i>
            Selected: {selectedTopic.topic}
          </h4>
          <p>{selectedTopic.subject} • {selectedTopic.classLevel}</p>
        </div>
      )}
    </div>
  );
};

export default SubjectsSection;