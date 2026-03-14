import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import ProgressTracker from '../components/dashboard/ProgressTracker';
import StudyPath from '../components/dashboard/StudyPath';
import SyllabusSection from '../components/dashboard/SyllabusSection';
import SubjectsSection from '../components/dashboard/SubjectsSection';
import StreaksSection from '../components/dashboard/StreaksSection';
import MetricsSection from '../components/dashboard/MetricsSection';
import Loader from '../components/common/Loader';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { 
    user,
    stats,
    progress,
    streaks,
    recentSessions,
    combinedStats,
    loading,
    usingMockData
  } = useDashboard();
  
  const [activeExam, setActiveExam] = useState('jee');
  const [activeSection, setActiveSection] = useState('progress-tracker');
  const sectionRefs = useRef({});

  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading]);

  const handleExamChange = (exam) => {
    setActiveExam(exam);
    setActiveSection('progress-tracker');
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' });
  };

  const sidebarItems = [
    { id: 'progress-tracker', icon: 'fa-tasks', label: 'Progress Tracker' },
    { id: 'study-plan', icon: 'fa-calendar-alt', label: 'Study Plan' },
    { id: 'subjects', icon: 'fa-book', label: 'Subjects & Topics' },
    { id: 'progress', icon: 'fa-chart-line', label: 'Progress & Reports' },
    { id: 'syllabus', icon: 'fa-list-alt', label: 'Syllabus' },
    { id: 'streaks', icon: 'fa-fire', label: 'Study Streaks' },
  ];

  if (loading) {
    return (
      <div className="page-loader">
        <Loader size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Mock Data Indicator */}
      {usingMockData && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: '#ffd166',
          color: '#1e293b',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          ⚡ Using Demo Data (Backend not connected)
        </div>
      )}

      {/* Welcome Message */}
      {user && (
        <div className="welcome-message" style={{
          padding: '20px 40px 0',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Welcome back, {user.firstName || 'Student'}! 👋
        </div>
      )}

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
          <section 
            id="progress-tracker" 
            className="section"
            ref={el => sectionRefs.current['progress-tracker'] = el}
          >
            <ProgressTracker 
              examType={activeExam} 
              stats={combinedStats}
              recentSessions={recentSessions}
              onSaveSession={(sessionData) => {
                // This will be implemented in Day 10
                console.log('Save session:', sessionData);
              }}
            />
          </section>

          <section 
            id="study-plan" 
            className="section"
            ref={el => sectionRefs.current['study-plan'] = el}
          >
            <StudyPath 
              examType={activeExam} 
              progress={progress} 
            />
          </section>

          <section 
            id="subjects" 
            className="section"
            ref={el => sectionRefs.current['subjects'] = el}
          >
            <SubjectsSection 
              examType={activeExam} 
              subjectStats={{
                physics: combinedStats.physics,
                chemistry: combinedStats.chemistry,
                math: combinedStats.math,
                biology: combinedStats.biology
              }}
            />
          </section>

          <section 
            id="progress" 
            className="section"
            ref={el => sectionRefs.current['progress'] = el}
          >
            <MetricsSection 
              examType={activeExam} 
              stats={combinedStats}
            />
          </section>

          <section 
            id="syllabus" 
            className="section"
            ref={el => sectionRefs.current['syllabus'] = el}
          >
            <SyllabusSection examType={activeExam} />
          </section>

          <section 
            id="streaks" 
            className="section"
            ref={el => sectionRefs.current['streaks'] = el}
          >
            <StreaksSection 
              examType={activeExam} 
              streaks={{
                current: combinedStats.streak,
                longest: combinedStats.longestStreak,
                weekly: Array(7).fill(false).map((_, i) => i < combinedStats.weeklyGoal)
              }}
              recentSessions={recentSessions}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;