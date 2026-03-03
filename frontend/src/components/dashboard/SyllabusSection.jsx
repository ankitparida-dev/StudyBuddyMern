import React from 'react';

const SyllabusSection = ({ examType }) => {
  const jeeSyllabus = [
    {
      subject: 'Physics',
      icon: 'fa-atom',
      chapters: [
        { name: 'Physics and Measurement', status: 'completed' },
        { name: 'Kinematics', status: 'completed' },
        { name: 'Laws of Motion', status: 'inprogress' },
        { name: 'Work, Energy and Power', status: 'pending' },
        { name: 'Rotational Motion', status: 'pending' },
        { name: 'Gravitation', status: 'pending' }
      ]
    },
    {
      subject: 'Chemistry',
      icon: 'fa-flask',
      chapters: [
        { name: 'Some Basic Concepts in Chemistry', status: 'completed' },
        { name: 'States of Matter', status: 'completed' },
        { name: 'Atomic Structure', status: 'inprogress' },
        { name: 'Chemical Bonding', status: 'pending' },
        { name: 'Chemical Thermodynamics', status: 'pending' },
        { name: 'Solutions', status: 'pending' }
      ]
    },
    {
      subject: 'Mathematics',
      icon: 'fa-square-root-alt',
      chapters: [
        { name: 'Sets, Relations and Functions', status: 'completed' },
        { name: 'Complex Numbers', status: 'completed' },
        { name: 'Matrices and Determinants', status: 'inprogress' },
        { name: 'Permutations and Combinations', status: 'pending' },
        { name: 'Mathematical Induction', status: 'pending' },
        { name: 'Binomial Theorem', status: 'pending' }
      ]
    }
  ];

  const neetSyllabus = [
    {
      subject: 'Physics',
      icon: 'fa-atom',
      chapters: [
        { name: 'Physical World & Measurement', status: 'completed' },
        { name: 'Kinematics', status: 'completed' },
        { name: 'Laws of Motion', status: 'inprogress' },
        { name: 'Work, Energy & Power', status: 'pending' },
        { name: 'Electrostatics', status: 'pending' },
        { name: 'Current Electricity', status: 'pending' }
      ]
    },
    {
      subject: 'Chemistry',
      icon: 'fa-flask',
      chapters: [
        { name: 'Some Basic Concepts', status: 'completed' },
        { name: 'Structure of Atom', status: 'completed' },
        { name: 'Chemical Bonding', status: 'inprogress' },
        { name: 'Organic Chemistry Basics', status: 'pending' },
        { name: 'Biomolecules', status: 'pending' },
        { name: 'Chemistry in Everyday Life', status: 'pending' }
      ]
    },
    {
      subject: 'Biology',
      icon: 'fa-dna',
      chapters: [
        { name: 'Diversity in Living World', status: 'completed' },
        { name: 'Structural Organization', status: 'completed' },
        { name: 'Cell Structure & Function', status: 'inprogress' },
        { name: 'Plant Physiology', status: 'pending' },
        { name: 'Human Physiology', status: 'pending' },
        { name: 'Genetics & Evolution', status: 'pending' }
      ]
    }
  ];

  const syllabus = examType === 'jee' ? jeeSyllabus : neetSyllabus;

  return (
    <div className="syllabus-container">
      <div className="section-header">
        <h2 className="section-title">{examType.toUpperCase()} Main & Advanced Syllabus</h2>
        <p className="section-subtitle">Click on any chapter to explore detailed content, practice questions, and track your understanding</p>
      </div>

      <div className="syllabus-grid">
        {syllabus.map((subject, index) => (
          <div key={index} className="subject-card">
            <div className="subject-header">
              <div className="subject-icon">
                <i className={`fas ${subject.icon}`}></i>
              </div>
              <div className="subject-title">{subject.subject}</div>
            </div>
            <div className="subject-content">
              <ul className="chapter-list">
                {subject.chapters.map((chapter, idx) => (
                  <li key={idx} className="chapter-item interactive">
                    <span className="chapter-name">{chapter.name}</span>
                    <span className={`chapter-status status-${chapter.status}`}>
                      {chapter.status === 'completed' ? 'Completed' : 
                       chapter.status === 'inprogress' ? 'In Progress' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusSection;