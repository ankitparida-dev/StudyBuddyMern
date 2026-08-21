import React, { useState, useMemo, useCallback } from 'react';
import '../../styles/SyllabusSection.css';

const SyllabusSection = ({ examType, syllabusProgress = {}, onChapterClick = null }) => {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Syllabus data
  const syllabusData = useMemo(() => {
    const baseSyllabus = examType === 'jee' 
      ? [
          {
            subject: 'Physics',
            icon: 'fa-atom',
            color: '#4cc9f0',
            chapters: [
              'Physics and Measurement', 'Kinematics', 'Laws of Motion',
              'Work, Energy and Power', 'Rotational Motion', 'Gravitation',
              'Properties of Solids and Liquids', 'Thermodynamics', 'Kinetic Theory of Gases',
              'Oscillations and Waves', 'Electrostatics', 'Current Electricity',
              'Magnetic Effects of Current', 'Electromagnetic Induction', 'Alternating Currents',
              'Electromagnetic Waves', 'Optics', 'Dual Nature of Matter',
              'Atoms and Nuclei', 'Electronic Devices'
            ]
          },
          {
            subject: 'Chemistry',
            icon: 'fa-flask',
            color: '#f8961e',
            chapters: [
              'Some Basic Concepts in Chemistry', 'States of Matter', 'Atomic Structure',
              'Chemical Bonding', 'Chemical Thermodynamics', 'Solutions',
              'Equilibrium', 'Redox Reactions', 'Electrochemistry',
              'Chemical Kinetics', 'Surface Chemistry', 'Classification of Elements',
              'P-Block Elements', 'D-Block Elements', 'Coordination Compounds',
              'Organic Chemistry Basics', 'Hydrocarbons', 'Organic Compounds with Functional Groups',
              'Biomolecules', 'Chemistry in Everyday Life'
            ]
          },
          {
            subject: 'Mathematics',
            icon: 'fa-square-root-alt',
            color: '#7209b7',
            chapters: [
              'Sets, Relations and Functions', 'Complex Numbers', 'Matrices and Determinants',
              'Permutations and Combinations', 'Mathematical Induction', 'Binomial Theorem',
              'Sequences and Series', 'Limit and Continuity', 'Differentiation',
              'Integration', 'Differential Equations', 'Trigonometric Functions',
              'Inverse Trigonometric Functions', 'Straight Lines', 'Conic Sections',
              'Vectors', 'Three Dimensional Geometry', 'Probability',
              'Statistics', 'Mathematical Reasoning'
            ]
          }
        ]
      : [
          {
            subject: 'Physics',
            icon: 'fa-atom',
            color: '#4cc9f0',
            chapters: [
              'Physical World & Measurement', 'Kinematics', 'Laws of Motion',
              'Work, Energy & Power', 'Motion of System of Particles', 'Properties of Matter',
              'Thermodynamics', 'Behaviour of Perfect Gases', 'Oscillations & Waves',
              'Electrostatics', 'Current Electricity', 'Magnetic Effects',
              'Electromagnetic Induction', 'Alternating Currents', 'Electromagnetic Waves',
              'Optics', 'Dual Nature of Radiation', 'Atoms & Nuclei',
              'Electronic Devices', 'Communication Systems'
            ]
          },
          {
            subject: 'Chemistry',
            icon: 'fa-flask',
            color: '#f8961e',
            chapters: [
              'Some Basic Concepts', 'Structure of Atom', 'Classification of Elements',
              'Chemical Bonding', 'States of Matter', 'Thermodynamics',
              'Equilibrium', 'Redox Reactions', 'Hydrogen',
              'S-Block Elements', 'P-Block Elements', 'Organic Chemistry Basics',
              'Hydrocarbons', 'Environmental Chemistry', 'Solid State',
              'Solutions', 'Electrochemistry', 'Chemical Kinetics',
              'Surface Chemistry', 'Coordination Compounds'
            ]
          },
          {
            subject: 'Biology',
            icon: 'fa-dna',
            color: '#4caf50',
            chapters: [
              'Diversity in Living World', 'Structural Organisation', 'Cell Structure & Function',
              'Plant Physiology', 'Human Physiology', 'Reproduction',
              'Genetics & Evolution', 'Biology & Human Welfare', 'Biotechnology',
              'Ecology & Environment', 'Neural Control', 'Chemical Coordination',
              'Digestion & Absorption', 'Breathing & Exchange', 'Body Fluids',
              'Excretory Products', 'Locomotion & Movement', 'Reproductive Health'
            ]
          }
        ];

    // Add progress data
    return baseSyllabus.map(subject => ({
      ...subject,
      chapters: subject.chapters.map(chapter => ({
        name: chapter,
        status: syllabusProgress[chapter] || 'pending'
      }))
    }));
  }, [examType, syllabusProgress]);

  const toggleSubject = useCallback((subjectName) => {
    setExpandedSubject(prev => prev === subjectName ? null : subjectName);
  }, []);

  const handleChapterClick = useCallback((subject, chapter, status) => {
    setSelectedChapter({ subject, chapter, status });
    onChapterClick?.({ subject, chapter, status });
  }, [onChapterClick]);

  const getStatusClass = useCallback((status) => {
    const classes = {
      completed: 'completed',
      inprogress: 'inprogress',
      pending: 'pending'
    };
    return classes[status] || 'pending';
  }, []);

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
      pending: 'Pending'
    };
    return labels[status] || labels.pending;
  }, []);

  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return syllabusData;
    
    const term = searchTerm.toLowerCase();
    return syllabusData.map(subject => ({
      ...subject,
      chapters: subject.chapters.filter(chapter => 
        chapter.name.toLowerCase().includes(term)
      )
    })).filter(subject => subject.chapters.length > 0);
  }, [syllabusData, searchTerm]);

  const totalChapters = syllabusData.reduce((acc, s) => acc + s.chapters.length, 0);
  const completedChapters = syllabusData.reduce((acc, s) => 
    acc + s.chapters.filter(c => c.status === 'completed').length, 0
  );
  const inProgressChapters = syllabusData.reduce((acc, s) => 
    acc + s.chapters.filter(c => c.status === 'inprogress').length, 0
  );

  return (
    <div className="syllabus-container">
      <div className="section-header">
        <h2 className="section-title">
          <i className="fas fa-list-ul"></i>
          {examType.toUpperCase()} Syllabus
        </h2>
        <p className="section-subtitle">
          Click on any chapter to explore detailed content, practice questions, and track your understanding
        </p>
      </div>

      {/* Syllabus Stats */}
      <div className="syllabus-stats">
        <div className="stat-card">
          <span className="stat-value">{totalChapters}</span>
          <span className="stat-label">Total Chapters</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{completedChapters}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{inProgressChapters}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Math.round((completedChapters / totalChapters) * 100)}%</span>
          <span className="stat-label">Overall Progress</span>
        </div>
      </div>

      {/* Search */}
      <div className="syllabus-search">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Syllabus Grid */}
      <div className="syllabus-grid">
        {filteredSubjects.map((subject, index) => (
          <div 
            key={index} 
            className={`subject-card ${expandedSubject === subject.subject ? 'expanded' : ''}`}
            style={{ '--subject-color': subject.color }}
          >
            <div 
              className="subject-header"
              onClick={() => toggleSubject(subject.subject)}
              style={{ background: `linear-gradient(135deg, ${subject.color}, ${subject.color}dd)` }}
            >
              <div className="subject-icon">
                <i className={`fas ${subject.icon}`}></i>
              </div>
              <div className="subject-info">
                <div className="subject-title">{subject.subject}</div>
                <div className="subject-progress-summary">
                  <span>{subject.chapters.filter(c => c.status === 'completed').length} completed</span>
                  <span>•</span>
                  <span>{Math.round((subject.chapters.filter(c => c.status === 'completed').length / subject.chapters.length) * 100)}%</span>
                </div>
              </div>
              <div className="subject-toggle-icon">
                <i className={`fas fa-chevron-${expandedSubject === subject.subject ? 'up' : 'down'}`}></i>
              </div>
            </div>

            <div className="subject-content">
              <div className="chapter-progress-track">
                <div 
                  className="chapter-progress-fill"
                  style={{ 
                    width: `${(subject.chapters.filter(c => c.status === 'completed').length / subject.chapters.length) * 100}%`,
                    backgroundColor: subject.color
                  }}
                />
              </div>

              <ul className="chapter-list">
                {subject.chapters.map((chapter, idx) => (
                  <li 
                    key={idx} 
                    className={`chapter-item interactive ${getStatusClass(chapter.status)}`}
                    onClick={() => handleChapterClick(subject.subject, chapter.name, chapter.status)}
                  >
                    <span className="chapter-name">
                      <span className="chapter-number">{idx + 1}.</span>
                      {chapter.name}
                    </span>
                    <span 
                      className={`chapter-status status-${getStatusClass(chapter.status)}`}
                      style={{ 
                        backgroundColor: `${getStatusColor(chapter.status)}20`,
                        color: getStatusColor(chapter.status)
                      }}
                    >
                      <i className={`fas ${getStatusIcon(chapter.status)}`}></i>
                      {getStatusLabel(chapter.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {selectedChapter && (
        <div className="selected-chapter-info">
          <div className="selected-chapter-content">
            <div className="selected-chapter-icon">
              <i className="fas fa-book"></i>
            </div>
            <div className="selected-chapter-details">
              <h4>{selectedChapter.chapter}</h4>
              <p>{selectedChapter.subject}</p>
              <span className={`status-badge ${getStatusClass(selectedChapter.status)}`}>
                {getStatusLabel(selectedChapter.status)}
              </span>
            </div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedChapter(null);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusSection;