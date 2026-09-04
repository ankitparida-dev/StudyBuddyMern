import React, { useEffect, useRef, useState } from 'react';

// ============================================================
//  PURE FRONTEND STUDY TOOLS - All components self-contained
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

// --- Pomodoro Timer ---
const PomodoroTimer = React.forwardRef((props, ref) => {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // work, break
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (isActive) {
      clearInterval(timerRef.current);
      setIsActive(false);
    } else {
      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsActive(false);
            // Switch mode
            const newMode = mode === 'work' ? 'break' : 'work';
            setMode(newMode);
            return newMode === 'work' ? 25 * 60 : 5 * 60;
          }
          return prev - 1;
        });
      }, 1000);
      setIsActive(true);
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setMode('work');
    setTime(25 * 60);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="tool-card" style={{ textAlign: 'center' }}>
      <h3><i className="fas fa-clock"></i> Pomodoro Timer</h3>
      <div style={{ margin: '20px 0' }}>
        <div style={{ fontSize: '3rem', fontWeight: '700', color: '#0b1e33' }}>
          {formatTime(time)}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#4f6587', textTransform: 'capitalize' }}>
          {mode} Mode
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={toggleTimer}
          style={{
            padding: '10px 24px',
            borderRadius: '40px',
            border: 'none',
            background: isActive ? '#e74c3c' : '#1a4fc3',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            transition: '0.2s'
          }}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          style={{
            padding: '10px 24px',
            borderRadius: '40px',
            border: '1px solid #d0dcec',
            background: 'transparent',
            color: '#1f2a44',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6b7f9e' }}>
        {mode === 'work' ? '📚 Focus Session' : '☕ Break Time'}
      </div>
    </div>
  );
});

// --- Daily Goals ---
const DailyGoals = () => {
  const [goals, setGoals] = useState([
    { id: 1, text: 'Complete 3 study sessions', completed: false },
    { id: 2, text: 'Review Physics notes', completed: false },
    { id: 3, text: 'Practice 20 math problems', completed: false },
  ]);
  const [newGoal, setNewGoal] = useState('');

  const toggleGoal = (id) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now(), text: newGoal, completed: false }]);
      setNewGoal('');
    }
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="tool-card">
      <h3><i className="fas fa-tasks"></i> Daily Goals</h3>
      <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#4f6587' }}>
        {completedCount}/{goals.length} completed
      </div>
      <div style={{ width: '100%', height: '6px', background: '#eef3fa', borderRadius: '10px', marginBottom: '16px' }}>
        <div style={{ 
          width: `${(completedCount / goals.length) * 100}%`, 
          height: '100%', 
          background: '#2a6df4', 
          borderRadius: '10px',
          transition: 'width 0.3s'
        }} />
      </div>
      <ul style={{ listStyle: 'none', marginBottom: '12px' }}>
        {goals.map(goal => (
          <li key={goal.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '8px 0',
            borderBottom: '1px solid #eef3fa'
          }}>
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={() => toggleGoal(goal.id)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ 
              flex: 1,
              textDecoration: goal.completed ? 'line-through' : 'none',
              color: goal.completed ? '#6b7f9e' : '#0b1e33'
            }}>
              {goal.text}
            </span>
            <button 
              onClick={() => deleteGoal(goal.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e74c3c',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Add new goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #d0dcec',
            outline: 'none'
          }}
        />
        <button
          onClick={addGoal}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: '#1a4fc3',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};

// --- Focus Mode ---
const FocusMode = () => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isFocusMode) {
      interval = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusMode]);

  const formatFocusTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="tool-card" style={{ textAlign: 'center' }}>
      <h3><i className="fas fa-moon"></i> Focus Mode</h3>
      <div style={{ margin: '16px 0' }}>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0b1e33' }}>
          {formatFocusTime(focusTime)}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#4f6587' }}>Focus Time</div>
      </div>
      <button
        onClick={() => setIsFocusMode(!isFocusMode)}
        style={{
          padding: '10px 32px',
          borderRadius: '40px',
          border: 'none',
          background: isFocusMode ? '#e74c3c' : '#2a6df4',
          color: 'white',
          fontWeight: 600,
          cursor: 'pointer',
          transition: '0.2s'
        }}
      >
        {isFocusMode ? 'End Focus' : 'Start Focus'}
      </button>
      {isFocusMode && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6b7f9e' }}>
          🎯 Stay focused! Minimize distractions
        </div>
      )}
    </div>
  );
};

// --- Study Analytics ---
const StudyAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const stats = {
    week: { sessions: 12, hours: 18, avg: 1.5 },
    month: { sessions: 45, hours: 72, avg: 1.6 },
    year: { sessions: 380, hours: 560, avg: 1.47 }
  };

  return (
    <div className="tool-card">
      <h3><i className="fas fa-chart-pie"></i> Study Analytics</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['week', 'month', 'year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              padding: '4px 16px',
              borderRadius: '20px',
              border: 'none',
              background: timeRange === range ? '#1a4fc3' : '#eef3fa',
              color: timeRange === range ? 'white' : '#1f2a44',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.8rem',
              textTransform: 'capitalize'
            }}
          >
            {range}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div className="stat-card" style={{ background: '#f8faff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0b1e33' }}>
            {stats[timeRange].sessions}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#4f6587', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sessions
          </div>
        </div>
        <div className="stat-card" style={{ background: '#f8faff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0b1e33' }}>
            {stats[timeRange].hours}h
          </div>
          <div style={{ fontSize: '0.7rem', color: '#4f6587', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Hours
          </div>
        </div>
        <div className="stat-card" style={{ background: '#f8faff', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0b1e33' }}>
            {stats[timeRange].avg}h
          </div>
          <div style={{ fontSize: '0.7rem', color: '#4f6587', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Avg/Session
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Quick Sessions ---
const QuickSessions = () => {
  const quickSessions = [
    { id: 1, topic: 'Physics Quiz', duration: '15 min', icon: 'fa-bolt' },
    { id: 2, topic: 'Flashcards', duration: '10 min', icon: 'fa-cards' },
    { id: 3, topic: 'Practice Test', duration: '20 min', icon: 'fa-pencil-alt' },
  ];

  const startSession = (topic) => {
    alert(`🚀 Starting quick session: ${topic}`);
  };

  return (
    <div className="tool-card">
      <h3><i className="fas fa-bolt"></i> Quick Sessions</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {quickSessions.map(session => (
          <button
            key={session.id}
            onClick={() => startSession(session.topic)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: '16px',
              border: '1px solid #eef3fa',
              background: 'white',
              cursor: 'pointer',
              transition: '0.2s',
              width: '100%'
            }}
          >
            <span>
              <i className={`fas ${session.icon}`} style={{ color: '#1a4fc3', marginRight: '10px' }}></i>
              {session.topic}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6b7f9e' }}>
              {session.duration} <i className="fas fa-play" style={{ marginLeft: '8px', color: '#1a4fc3' }}></i>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Smart Breaks ---
const SmartBreaks = () => {
  const [breakActive, setBreakActive] = useState(false);
  const [breakTime, setBreakTime] = useState(0);

  useEffect(() => {
    let interval;
    if (breakActive) {
      interval = setInterval(() => {
        setBreakTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breakActive]);

  const startBreak = () => {
    setBreakActive(true);
    setBreakTime(0);
  };

  const endBreak = () => {
    setBreakActive(false);
    alert(`☕ Break completed! ${Math.floor(breakTime / 60)} minutes ${breakTime % 60} seconds`);
  };

  const formatBreakTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const breakIdeas = [
    '🧘 Stretch your arms and back',
    '👀 Look away from screen (20-20-20 rule)',
    '🚶 Take a short walk',
    '💧 Drink some water',
    '🧠 Quick meditation'
  ];

  return (
    <div className="tool-card" style={{ textAlign: 'center' }}>
      <h3><i className="fas fa-coffee"></i> Smart Breaks</h3>
      {breakActive ? (
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0b1e33', margin: '16px 0' }}>
            {formatBreakTime(breakTime)}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#4f6587', marginBottom: '12px' }}>
            {breakIdeas[Math.floor(Math.random() * breakIdeas.length)]}
          </div>
          <button
            onClick={endBreak}
            style={{
              padding: '10px 32px',
              borderRadius: '40px',
              border: 'none',
              background: '#0f7b4b',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            End Break
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '1rem', color: '#4f6587', marginBottom: '16px' }}>
            Take a structured break to recharge
          </div>
          <button
            onClick={startBreak}
            style={{
              padding: '10px 32px',
              borderRadius: '40px',
              border: 'none',
              background: '#2a6df4',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Start Break (5 min)
          </button>
        </div>
      )}
    </div>
  );
};

// --- Chat Assistant ---
const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you study today?', sender: 'bot', timestamp: '12:00' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      const newMessages = [
        ...messages,
        { text: input, sender: 'user', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ];
      setMessages(newMessages);
      setInput('');

      // Simulate bot response
      setTimeout(() => {
        const botResponses = [
          'Great question! Keep up the good work!',
          'I can help with that. Would you like me to explain further?',
          'Try breaking it down into smaller chunks.',
          'You\'re doing amazing! 💪',
          'Let me think about that...'
        ];
        setMessages([
          ...newMessages,
          { 
            text: botResponses[Math.floor(Math.random() * botResponses.length)], 
            sender: 'bot', 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1000);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            border: 'none',
            background: '#1a4fc3',
            color: 'white',
            fontSize: '1.8rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(26,79,195,0.3)',
            transition: '0.2s'
          }}
        >
          <i className="fas fa-comment-dots"></i>
        </button>
      ) : (
        <div style={{
          width: '350px',
          maxWidth: '90vw',
          height: '450px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            background: '#1a4fc3',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 600 }}>
              <i className="fas fa-robot" style={{ marginRight: '8px' }}></i>
              Study Assistant
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: msg.sender === 'user' ? '#1a4fc3' : '#f0f5ff',
                  color: msg.sender === 'user' ? 'white' : '#0b1e33',
                  padding: '8px 16px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.9rem'
                }}
              >
                {msg.text}
                <div style={{ fontSize: '0.6rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#6b7f9e', marginTop: '4px' }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px', borderTop: '1px solid #eef3fa', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #d0dcec',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: '#1a4fc3',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
//  MAIN STUDY TOOLS COMPONENT
// ============================================================

const StudyTools = () => {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const timerRef = useRef(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Intersection observer for animations
  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      document.querySelectorAll('.tools-grid, .tool-card').forEach(el => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="studytools-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader size="large" text="Loading study tools..." />
      </div>
    );
  }

  return (
    <div className="studytools-page">
      <div className="demo-badge">
        ⚡ Using Demo Data (Backend not connected)
      </div>

      <section className="study-tools-section">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Study Tools & Time Management</h1>
            <p className="page-subtitle">
              Maximize your productivity with AI-powered study tools and smart time management features
            </p>
          </div>

          <div className="tools-grid">
            <PomodoroTimer ref={timerRef} />
            <DailyGoals />
            <FocusMode />
            <StudyAnalytics />
            <QuickSessions />
            <SmartBreaks />
          </div>
        </div>
      </section>

      <ChatAssistant />

      {/* Styles */}
      <style>{`
        .studytools-page {
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

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #0b1e33;
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: #4f6587;
          font-size: 1rem;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .tool-card {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          border: 1px solid rgba(255,255,255,0.5);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .tool-card.animated {
          opacity: 1;
          transform: translateY(0);
        }

        .tool-card h3 {
          color: #0b1e33;
          margin-bottom: 16px;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tool-card h3 i {
          color: #1a4fc3;
          width: 24px;
        }

        @media (max-width: 768px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }
          .studytools-page {
            padding: 16px;
          }
          .page-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudyTools;