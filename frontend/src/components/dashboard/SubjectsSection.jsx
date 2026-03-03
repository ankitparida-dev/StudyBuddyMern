import React from 'react';

const SubjectsSection = ({ examType }) => {
  const jeeSubjects = [
    {
      name: 'Physics',
      icon: '⚡',
      headerClass: 'physics-header',
      class11: ['Kinematics', 'Laws of Motion', 'Work, Energy, Power', 'Rotational Motion', 'Thermodynamics'],
      class12: ['Electrostatics', 'Current Electricity', 'EMI & AC', 'Ray Optics', 'Modern Physics']
    },
    {
      name: 'Chemistry',
      icon: '🧪',
      headerClass: 'chemistry-header',
      class11: ['Mole Concept', 'Atomic Structure', 'Chemical Bonding', 'Equilibrium', 'Thermodynamics'],
      class12: ['Solutions', 'Electrochemistry', 'P-Block Elements', 'Organic Reactions', 'Coordination Compounds']
    },
    {
      name: 'Mathematics',
      icon: '📐',
      headerClass: 'math-header',
      class11: ['Sets, Relations, Functions', 'Trigonometry', 'Conic Sections', 'Permutations & Combinations', 'Straight Lines'],
      class12: ['Calculus (D&I)', 'Vectors & 3D', 'Probability', 'Differential Equations', 'Matrices & Determinants']
    }
  ];

  const neetSubjects = [
    {
      name: 'Physics',
      icon: '⚡',
      headerClass: 'physics-header',
      class11: ['Physical World & Measurement', 'Kinematics', 'Laws of Motion', 'Work, Energy, Power', 'Motion of System of Particles'],
      class12: ['Electrostatics', 'Current Electricity', 'Magnetic Effects', 'Electromagnetic Waves', 'Optics']
    },
    {
      name: 'Chemistry',
      icon: '🧪',
      headerClass: 'chemistry-header',
      class11: ['Some Basic Concepts', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding', 'States of Matter'],
      class12: ['Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry']
    },
    {
      name: 'Biology',
      icon: '🧬',
      headerClass: 'biology-header',
      class11: ['Diversity in Living World', 'Structural Organization', 'Cell Structure & Function', 'Plant Physiology', 'Human Physiology'],
      class12: ['Reproduction', 'Genetics & Evolution', 'Biology & Human Welfare', 'Biotechnology', 'Ecology']
    }
  ];

  const subjects = examType === 'jee' ? jeeSubjects : neetSubjects;

  return (
    <div className="subjects-container">
      <div className="section-header">
        <h2 className="section-title">{examType.toUpperCase()} Subjects & Topics</h2>
        <p className="section-subtitle">Explore all topics covered in your syllabus with detailed breakdown</p>
      </div>

      <div className="subjects-grid">
        {subjects.map((subject, index) => (
          <div key={index} className="subject-card-detailed">
            <div className={`subject-card-header ${subject.headerClass}`}>
              <h2>{subject.icon} {subject.name}</h2>
              <p>Master concepts and ace your exams</p>
            </div>
            <div className="subject-card-content">
              <div className="topic-block">
                <h3>Class 11 Topics</h3>
                <ul>
                  {subject.class11.map((topic, idx) => (
                    <li key={idx} className="interactive">{topic}</li>
                  ))}
                </ul>
              </div>
              <div className="topic-block">
                <h3>Class 12 Topics</h3>
                <ul>
                  {subject.class12.map((topic, idx) => (
                    <li key={idx} className="interactive">{topic}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsSection;