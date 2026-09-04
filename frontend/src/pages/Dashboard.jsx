import React, { useState, useEffect, useRef } from 'react';

// ============================================================
//  PURE FRONTEND DASHBOARD - All components self-contained
//  Fully interactive with mock data, no external dependencies
// ============================================================

// --- Sub-components (self-contained) ---

const Loader = ({ size = 'medium', text = 'Loading...' }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '16px',
    padding: '40px'
  }}>
    <div style={{
      width: size === 'large' ? '60px' : size === 'small' ? '30px' : '45px',
      height: size === 'large' ? '60px' : size === 'small' ? '30px' : '45px',
      border: '4px solid #eef3fa',
      borderTop: `4px solid #1a4fc3`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: '#4f6587', fontSize: '1rem', fontWeight: 500 }}>{text}</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const ProgressTracker = ({ examType, stats, recentSessions, onSaveSession }) => {
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDuration, setSessionDuration] = useState('');

  const handleSave = () => {
    if (sessionTopic && sessionDuration) {
      onSaveSession({ topic: sessionTopic, duration: sessionDuration, date: 'Today' });
      setSessionTopic('');
      setSessionDuration('');
    }
  };

  return (
    <div>
      <div className="tracker-grid">
        <div className="stat-card">
          <div className="num">{stats.totalStudyTime || 42}h</div>
          <div className="label">Study Time</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.totalSessions || 18}</div>
          <div className="label">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.accuracy || 76}%</div>
          <div className="label">Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.streak || 12}🔥</div>
          <div className="label">Current Streak</div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', color: '#4f6587', marginBottom: '8px' }}>Recent Sessions</h4>
        {(recentSessions || []).map((session, idx) => (
          <div key={idx} className="mock-session">
            <span><strong>{session.topic || 'Study Session'}</strong> · {session.duration || '1h'}</span>
            <span style={{ color: '#6b7f9e' }}>{session.date || 'Today'}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#f8faff', borderRadius: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', color: '#4f6587', marginBottom: '8px' }}>Log New Session</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Topic" 
            value={sessionTopic}
            onChange={(e) => setSessionTopic(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #d0dcec', flex: 1, minWidth: '120px' }}
          />
          <input 
            type="text" 
            placeholder="Duration (e.g. 2.5h)" 
            value={sessionDuration}
            onChange={(e) => setSessionDuration(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #d0dcec', flex: 1, minWidth: '120px' }}
          />
          <button 
            onClick={handleSave}
            style={{ padding: '8px 24px', background: '#1a4fc3', color: 'white', border: 'none', borderRadius: '40px', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
};

const StudyPath = ({ examType, progress }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const topics = {
    'jee': ['Mechanics', 'Thermodynamics', 'Organic Chem', 'Calculus', 'Electromagnetism', 'Coordination', 'Probability'],
    'neet': ['Cell Biology', 'Human Physiology', 'Genetics', 'Ecology', 'Biotechnology', 'Plant Physiology', 'Evolution']
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            style={{
              padding: '10px 18px',
              borderRadius: '40px',
              border: 'none',
              background: selectedDay === idx ? '#1a4fc3' : '#eef3fa',
              color: selectedDay === idx ? 'white' : '#1f2a44',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: '0.2s'
            }}
          >
            {day}
          </button>
        ))}
      </div>

      <div style={{ background: '#f8faff', padding: '20px', borderRadius: '20px' }}>
        <h4 style={{ marginBottom: '12px', color: '#0b1e33' }}>
          {examType === 'jee' ? 'JEE' : 'NEET'} Study Plan - {days[selectedDay]}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topics[examType].map((topic, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 12px', 
              background: 'white', 
              borderRadius: '12px',
              border: '1px solid #e8edf8'
            }}>
              <span>{topic}</span>
              <span style={{ color: idx <= selectedDay ? '#2a6df4' : '#b0c4de' }}>
                {idx <= selectedDay ? '✅ Completed' : '⏳ Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SyllabusSection = ({ examType }) => {
  const syllabus = {
    'jee': {
      physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
      chemistry: ['Organic', 'Inorganic', 'Physical', 'Analytical'],
      math: ['Calculus', 'Algebra', 'Geometry', 'Probability', 'Trigonometry']
    },
    'neet': {
      physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics'],
      chemistry: ['Organic', 'Inorganic', 'Physical', 'Biochemistry'],
      biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology', 'Plant Biology']
    }
  };

  const subjects = syllabus[examType] || syllabus.jee;

  return (
    <div>
      {Object.entries(subjects).map(([subject, topics]) => (
        <div key={subject} style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#0b1e33', marginBottom: '8px', textTransform: 'capitalize' }}>
            {subject}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {topics.map((topic, idx) => (
              <span key={idx} style={{
                padding: '4px 16px',
                background: idx % 2 === 0 ? '#f0f5ff' : '#f8faff',
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#1f3a6b',
                border: '1px solid #e8edf8'
              }}>
                {topic}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const SubjectsSection = ({ examType, subjectStats }) => {
  const subjects = examType === 'neet' 
    ? ['physics', 'chemistry', 'biology'] 
    : ['physics', 'chemistry', 'math'];

  const subjectLabels = {
    physics: 'Physics',
    chemistry: 'Chemistry',
    math: 'Mathematics',
    biology: 'Biology'
  };

  return (
    <div>
      <div className="subject-row">
        {subjects.map(subject => (
          <div key={subject} className="subject-pill">
            {subjectLabels[subject]}
            <span className="bar">
              <span className="fill" style={{ width: `${subjectStats[subject]?.accuracy || 65}%` }}></span>
            </span>
            {subjectStats[subject]?.accuracy || 65}%
          </div>
        ))}
      </div>
      <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#4f6587' }}>
        <i className="fas fa-check-circle" style={{ color: '#2a6df4' }}></i> 
        {Object.values(subjectStats).reduce((sum, s) => sum + (s.topicsCompleted || 0), 0)} topics completed
      </div>
    </div>
  );
};

const StreaksSection = ({ examType, streaks, recentSessions }) => {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weeklyData = streaks?.weekly || [true, false, true, true, false, true, false];

  return (
    <div>
      <div className="streak-box">
        <div className="streak-badge">
          🔥 {streaks?.current || 12} days
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#4f6587' }}>
            Longest: {streaks?.longest || 21} days
          </span>
        </div>
      </div>
      <div className="week-dots" style={{ marginTop: '14px' }}>
        {weekDays.map((day, i) => (
          <div key={i} className={`dot ${weeklyData[i] ? 'active' : ''}`}>
            {day}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6b7f9e' }}>
        <i className="fas fa-info-circle"></i> Study at least 30 min daily to maintain streak
      </div>
    </div>
  );
};

const MetricsSection = ({ examType, stats }) => {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {['week', 'month', 'year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              padding: '6px 20px',
              borderRadius: '40px',
              border: 'none',
              background: timeRange === range ? '#1a4fc3' : '#eef3fa',
              color: timeRange === range ? 'white' : '#1f2a44',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              textTransform: 'capitalize'
            }}
          >
            {range}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '14px' }}>
        <div className="stat-card">
          <div className="num">+12%</div>
          <div className="label">Improvement</div>
        </div>
        <div className="stat-card">
          <div className="num">84%</div>
          <div className="label">Overall Progress</div>
        </div>
        <div className="stat-card">
          <div className="num">4.2h</div>
          <div className="label">Avg. Daily</div>
        </div>
      </div>

      <button 
        className="btn-outline" 
        style={{ marginTop: '16px' }} 
        onClick={() => alert('📊 Detailed report would open here')}
      >
        View Detailed Report <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
};

// ============================================================
//  MAIN DASHBOARD COMPONENT
// ============================================================

const Dashboard = () => {
  // --- State ---
  const [activeExam, setActiveExam] = useState('jee');
  const [activeSection, setActiveSection] = useState('progress-tracker');
  const [loading, setLoading] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const sectionRefs = useRef({});

  // Mock data with all required fields
  const mockData = {
    user: { firstName: 'Alex', lastName: 'Student' },
    stats: {
      totalStudyTime: 42,
      totalSessions: 18,
      accuracy: 76,
      streak: 12,
      longestStreak: 21
    },
    progress: { overall: 68, weekly: 12 },
    streaks: { current: 12, longest: 21, weekly: [true, false, true, true, false, true, false] },
    recentSessions: [
      { date: 'Today', duration: '2.5h', topic: 'Thermodynamics' },
      { date: 'Yesterday', duration: '1.8h', topic: 'Organic Chemistry' },
      { date: '2 days ago', duration: '3h', topic: 'Calculus' }
    ],
    combinedStats: {
      totalStudyTime: 42,
      totalSessions: 18,
      accuracy: 76,
      streak: 12,
      longestStreak: 21,
      physics: { accuracy: 72, topicsCompleted: 14 },
      chemistry: { accuracy: 81, topicsCompleted: 11 },
      math: { accuracy: 68, topicsCompleted: 9 },
      biology: { accuracy: 79, topicsCompleted: 8 }
    },
    usingMockData: true
  };

  // --- Effects ---
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Dashboard loading timeout - forcing display');
        setTimeoutReached(true);
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Intersection observer for animations
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

  // --- Handlers ---
  const handleExamChange = (exam) => {
    setActiveExam(exam);
    setActiveSection('progress-tracker');
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveSession = (sessionData) => {
    console.log('Session saved:', sessionData);
    alert(`✅ Session logged: ${sessionData.topic} - ${sessionData.duration}`);
  };

  const sidebarItems = [
    { id: 'progress-tracker', icon: 'fa-tasks', label: 'Progress Tracker' },
    { id: 'study-plan', icon: 'fa-calendar-alt', label: 'Study Plan' },
    { id: 'subjects', icon: 'fa-book', label: 'Subjects & Topics' },
    { id: 'progress', icon: 'fa-chart-line', label: 'Progress & Reports' },
    { id: 'syllabus', icon: 'fa-list-alt', label: 'Syllabus' },
    { id: 'streaks', icon: 'fa-fire', label: 'Study Streaks' },
  ];

  // --- Render ---
  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Mock Data Indicator */}
      <div className="demo-badge">
        ⚡ Using Demo Data (Backend not connected)
      </div>

      {/* Welcome Message */}
      <div className="welcome-message">
        Welcome back, {mockData.user.firstName}! 👋
      </div>

      <div className="container dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul className="sidebar-menu">
            {sidebarItems.map(item => (
              <li key={item.id} className="sidebar-item">
                <button
                  className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => handleSectionChange(item.id)}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          
          <div className="exam-selection">
            <button
              className={`exam-tab jee-tab ${activeExam === 'jee' ? 'active' : ''}`}
              onClick={() => handleExamChange('jee')}
            >
              JEE
            </button>
            <button
              className={`exam-tab neet-tab ${activeExam === 'neet' ? 'active' : ''}`}
              onClick={() => handleExamChange('neet')}
            >
              NEET
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <section 
            id="progress-tracker" 
            className="section"
            ref={el => sectionRefs.current['progress-tracker'] = el}
          >
            <div className="section-title">
              <i className="fas fa-tasks"></i> Progress Tracker
            </div>
            <ProgressTracker 
              examType={activeExam} 
              stats={mockData.combinedStats}
              recentSessions={mockData.recentSessions}
              onSaveSession={handleSaveSession}
            />
          </section>

          <section 
            id="study-plan" 
            className="section"
            ref={el => sectionRefs.current['study-plan'] = el}
          >
            <div className="section-title">
              <i className="fas fa-calendar-alt"></i> Study Plan
            </div>
            <StudyPath 
              examType={activeExam} 
              progress={mockData.progress} 
            />
          </section>

          <section 
            id="subjects" 
            className="section"
            ref={el => sectionRefs.current['subjects'] = el}
          >
            <div className="section-title">
              <i className="fas fa-book"></i> Subjects & Topics
            </div>
            <SubjectsSection 
              examType={activeExam} 
              subjectStats={mockData.combinedStats}
            />
          </section>

          <section 
            id="progress" 
            className="section"
            ref={el => sectionRefs.current['progress'] = el}
          >
            <div className="section-title">
              <i className="fas fa-chart-line"></i> Progress & Reports
            </div>
            <MetricsSection 
              examType={activeExam} 
              stats={mockData.combinedStats}
            />
          </section>

          <section 
            id="syllabus" 
            className="section"
            ref={el => sectionRefs.current['syllabus'] = el}
          >
            <div className="section-title">
              <i className="fas fa-list-alt"></i> Syllabus
            </div>
            <SyllabusSection examType={activeExam} />
          </section>

          <section 
            id="streaks" 
            className="section"
            ref={el => sectionRefs.current['streaks'] = el}
          >
            <div className="section-title">
              <i className="fas fa-fire"></i> Study Streaks
            </div>
            <StreaksSection 
              examType={activeExam} 
              streaks={mockData.streaks}
              recentSessions={mockData.recentSessions}
            />
          </section>
        </main>
      </div>

      {/* Styles */}
      <style>{`
        /* Reset & base */
        .dashboard-page * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
        }

        .dashboard-page {
          width: 100%;
          max-width: 1440px;
          background: #f4f7fc;
          border-radius: 32px;
          padding: 20px 24px 40px;
          margin: 0 auto;
        }

        .demo-badge {
          background: #ffeed9;
          color: #a9670e;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 10px 18px;
          border-radius: 40px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          border: 1px solid #f7d8a6;
        }

        .welcome-message {
          font-size: 1.8rem;
          font-weight: 600;
          color: #0b1e33;
          margin-bottom: 28px;
        }

        .dashboard-container {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }

        /* Sidebar */
        .sidebar {
          flex: 0 0 230px;
          background: white;
          border-radius: 28px;
          padding: 24px 12px;
          box-shadow: 0 12px 30px -8px rgba(0,0,0,0.06);
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .sidebar-menu {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 18px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f2a44;
          transition: 0.2s;
          cursor: pointer;
          text-align: left;
        }
        .sidebar-link i {
          width: 22px;
          font-size: 1.1rem;
          color: #5d6f8b;
        }
        .sidebar-link:hover {
          background: #eef3fa;
        }
        .sidebar-link.active {
          background: #e1e9f5;
          color: #0f3b8c;
          font-weight: 600;
        }
        .sidebar-link.active i {
          color: #1a4fc3;
        }

        .exam-selection {
          margin-top: 30px;
          display: flex;
          gap: 10px;
          padding: 0 4px;
        }
        .exam-tab {
          flex: 1;
          padding: 10px 0;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.9rem;
          background: #eef3fa;
          color: #1f2a44;
          cursor: pointer;
          transition: 0.2s;
        }
        .exam-tab.jee-tab.active {
          background: #1a4fc3;
          color: white;
          box-shadow: 0 6px 14px rgba(26,79,195,0.25);
        }
        .exam-tab.neet-tab.active {
          background: #0f7b4b;
          color: white;
          box-shadow: 0 6px 14px rgba(15,123,75,0.25);
        }
        .exam-tab:hover {
          transform: scale(0.97);
        }

        /* Main content */
        .main-content {
          flex: 1;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .section {
          background: white;
          border-radius: 28px;
          padding: 24px 28px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.02);
          border: 1px solid rgba(255,255,255,0.5);
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.5s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
          scroll-margin-top: 20px;
        }
        .section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #0f1e3a;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-title i {
          color: #2a6df4;
          font-size: 1.4rem;
          width: 32px;
        }

        .tracker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 16px;
          margin-top: 6px;
        }
        .stat-card {
          background: #f8faff;
          padding: 16px 14px;
          border-radius: 20px;
          border: 1px solid #e8edf8;
          text-align: center;
        }
        .stat-card .num {
          font-size: 2rem;
          font-weight: 700;
          color: #0b1e33;
        }
        .stat-card .label {
          color: #4f6587;
          font-size: 0.8rem;
          font-weight: 500;
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .subject-row {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          justify-content: space-between;
        }
        .subject-pill {
          background: #f0f5ff;
          padding: 8px 22px;
          border-radius: 40px;
          font-weight: 500;
          color: #1f3a6b;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .subject-pill .bar {
          width: 70px;
          height: 6px;
          background: #d9e2f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .subject-pill .bar .fill {
          height: 100%;
          background: #2a6df4;
          border-radius: 10px;
        }

        .streak-box {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 30px;
        }
        .streak-badge {
          background: #fff0e0;
          padding: 6px 24px;
          border-radius: 60px;
          font-weight: 600;
          color: #b45309;
        }
        .week-dots {
          display: flex;
          gap: 12px;
        }
        .dot {
          width: 34px;
          height: 34px;
          border-radius: 40px;
          background: #e6edf8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: #2b3f62;
        }
        .dot.active {
          background: #2a6df4;
          color: white;
        }

        .mock-session {
          background: #fafcff;
          border-radius: 20px;
          padding: 12px 18px;
          border-left: 4px solid #2a6df4;
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
        }

        .btn-outline {
          border: 1px solid #d0dcec;
          background: transparent;
          padding: 8px 20px;
          border-radius: 40px;
          font-weight: 500;
          color: #1f3a6b;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-outline:hover {
          background: #eef3fa;
          border-color: #a0b6d4;
        }

        /* Responsive */
        @media (max-width: 800px) {
          .sidebar {
            flex: 1 1 100%;
            position: relative;
            top: 0;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            padding: 16px 12px;
          }
          .sidebar-menu {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 4px;
          }
          .sidebar-link {
            padding: 8px 14px;
            font-size: 0.85rem;
            gap: 8px;
          }
          .exam-selection {
            margin-top: 10px;
            width: 100%;
            justify-content: center;
          }
          .dashboard-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;