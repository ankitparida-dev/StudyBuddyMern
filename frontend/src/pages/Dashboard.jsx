import React, { useState, useEffect, useRef } from 'react';
import ProgressTracker from '../components/dashboard/ProgressTracker';
import StudyPath from '../components/dashboard/StudyPath';
import SyllabusSection from '../components/dashboard/SyllabusSection';
import SubjectsSection from '../components/dashboard/SubjectsSection';
import StreaksSection from '../components/dashboard/StreaksSection';
import MetricsSection from '../components/dashboard/MetricsSection';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [activeExam, setActiveExam] = useState('jee');
  const [activeSection, setActiveSection] = useState('progress-tracker');
  const sectionRefs = useRef({});

  useEffect(() => {
    // Section observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [activeExam]);

  const handleExamChange = (exam) => {
    setActiveExam(exam);
    setActiveSection('progress-tracker');
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' });
  };

  const sidebarItems = [
    { id: 'study-plan', icon: 'fa-calendar-alt', label: 'Study Plan' },
    { id: 'subjects', icon: 'fa-book', label: 'Subjects & Topics' },
    { id: 'progress', icon: 'fa-chart-line', label: 'Progress & Reports' },
    { id: 'syllabus', icon: 'fa-list-alt', label: 'Syllabus' },
    { id: 'progress-tracker', icon: 'fa-tasks', label: 'Progress Tracker' },
    { id: 'streaks', icon: 'fa-fire', label: 'Study Streaks' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul className="sidebar-menu">
            {sidebarItems.map(item => (
              <li key={item.id} className="sidebar-item">
                <a 
                  href={`#${item.id}`} 
                  className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSectionChange(item.id);
                  }}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          
          {/* Exam Selection */}
          <div className="exam-selection">
            <div 
              className={`exam-tab jee-tab ${activeExam === 'jee' ? 'active' : ''}`}
              onClick={() => handleExamChange('jee')}
            >
              JEE
            </div>
            <div 
              className={`exam-tab neet-tab ${activeExam === 'neet' ? 'active' : ''}`}
              onClick={() => handleExamChange('neet')}
            >
              NEET
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Progress Tracker Section */}
          <section 
            id="progress-tracker" 
            className="section"
            ref={el => sectionRefs.current['progress-tracker'] = el}
          >
            <ProgressTracker examType={activeExam} />
          </section>

          {/* Study Plan Section */}
          <section 
            id="study-plan" 
            className="section"
            ref={el => sectionRefs.current['study-plan'] = el}
          >
            <StudyPath examType={activeExam} />
          </section>

          {/* Subjects Section */}
          <section 
            id="subjects" 
            className="section"
            ref={el => sectionRefs.current['subjects'] = el}
          >
            <SubjectsSection examType={activeExam} />
          </section>

          {/* Progress & Reports Section */}
          <section 
            id="progress" 
            className="section"
            ref={el => sectionRefs.current['progress'] = el}
          >
            <MetricsSection examType={activeExam} />
          </section>

          {/* Syllabus Section */}
          <section 
            id="syllabus" 
            className="section"
            ref={el => sectionRefs.current['syllabus'] = el}
          >
            <SyllabusSection examType={activeExam} />
          </section>

          {/* Study Streaks Section */}
          <section 
            id="streaks" 
            className="section"
            ref={el => sectionRefs.current['streaks'] = el}
          >
            <StreaksSection examType={activeExam} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;