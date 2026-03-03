import React, { useState, useEffect } from 'react';

const ProgressTracker = ({ examType }) => {
  const [currentSubject, setCurrentSubject] = useState(examType === 'jee' ? 'physics' : 'biology');
  const [topicName, setTopicName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem(`${examType}PracticeHistory`);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [examType]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getSubjectStats = () => {
    const totalQuestions = questions.length;
    const correctQuestions = questions.filter(q => q.checked).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
    return { totalQuestions, correctQuestions, accuracy };
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: `Question ${questions.length + 1} from ${topicName || 'Untitled Topic'}`,
      topic: topicName || 'Untitled Topic',
      subject: currentSubject,
      checked: false,
      timestamp: new Date().toISOString()
    };

    setQuestions(prev => [...prev, newQuestion]);
    if (questions.length === 0) {
      setTopicName('');
    }
  };

  const handleToggleQuestion = (id) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, checked: !q.checked } : q)
    );
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleClearAll = () => {
    if (questions.length > 0 && window.confirm('Are you sure you want to clear all questions?')) {
      setQuestions([]);
    }
  };

  const handleSaveSession = () => {
    if (questions.length === 0) {
      showNotification('Please add at least one question before saving.', 'error');
      return;
    }

    const { totalQuestions, correctQuestions, accuracy } = getSubjectStats();

    const session = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      timestamp: new Date().toISOString(),
      subject: currentSubject,
      totalQuestions,
      correctQuestions,
      accuracy,
      questions: [...questions]
    };

    const updatedHistory = [session, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(`${examType}PracticeHistory`, JSON.stringify(updatedHistory));
    
    setQuestions([]);
    showNotification('Practice session saved successfully!');
  };

  const { totalQuestions, correctQuestions, accuracy } = getSubjectStats();

  const subjects = examType === 'jee' 
    ? [
        { id: 'physics', icon: 'fa-atom', label: 'Physics' },
        { id: 'chemistry', icon: 'fa-flask', label: 'Chemistry' },
        { id: 'math', icon: 'fa-square-root-alt', label: 'Mathematics' }
      ]
    : [
        { id: 'physics', icon: 'fa-atom', label: 'Physics' },
        { id: 'chemistry', icon: 'fa-flask', label: 'Chemistry' },
        { id: 'biology', icon: 'fa-dna', label: 'Biology' }
      ];

  return (
    <div className="tracker-container">
      <div className="section-header">
        <h2 className="section-title">Practice Question Tracker</h2>
        <p className="section-subtitle">Track your daily practice performance by marking questions you answered correctly</p>
      </div>

      {/* Quick Stats */}
      <div className="tracker-stats-overview">
        <div className="stat-card interactive">
          <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{correctQuestions}</div>
            <div className="stat-label">Correct Today</div>
          </div>
        </div>
        <div className="stat-card interactive">
          <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Accuracy Rate</div>
          </div>
        </div>
        <div className="stat-card interactive">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
            <i className="fas fa-bullseye"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{correctQuestions}/10</div>
            <div className="stat-label">Daily Goal</div>
          </div>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="subject-selection">
        <h3>Select Subject</h3>
        <div className="subject-tabs">
          {subjects.map(subject => (
            <button
              key={subject.id}
              className={`subject-tab ${currentSubject === subject.id ? 'active' : ''}`}
              onClick={() => setCurrentSubject(subject.id)}
            >
              <i className={`fas ${subject.icon}`}></i> {subject.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracker Form */}
      <div className="tracker-form">
        <div className="form-header">
          <h3 className="form-title">Today's Practice Questions</h3>
          <div className="form-controls">
            <button className="btn btn-primary" onClick={handleAddQuestion}>
              <i className="fas fa-plus"></i> Add Question
            </button>
            <button className="btn" onClick={handleClearAll}>
              <i className="fas fa-trash"></i> Clear All
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="topic-name" className="form-label">Topic/Chapter Name</label>
          <input
            type="text"
            id="topic-name"
            className="form-input"
            placeholder="e.g., Kinematics, Organic Chemistry, etc."
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
          />
        </div>

        <div className="questions-grid">
          {questions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <p>No questions added yet. Click "Add Question" to get started!</p>
            </div>
          ) : (
            questions.map(question => (
              <div key={question.id} className={`question-item ${question.checked ? 'checked' : ''}`}>
                <div 
                  className={`question-checkbox ${question.checked ? 'checked' : ''}`}
                  onClick={() => handleToggleQuestion(question.id)}
                >
                  {question.checked && '✓'}
                </div>
                <div className="question-text">{question.text}</div>
                <button 
                  className="btn-icon" 
                  onClick={() => handleDeleteQuestion(question.id)}
                  aria-label="Delete question"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="tracker-actions">
          <div className="progress-summary">
            <div className="summary-item">
              <div className="summary-value">{totalQuestions}</div>
              <div className="summary-label">Total Questions</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{correctQuestions}</div>
              <div className="summary-label">Correct</div>
            </div>
            <div className="summary-item">
              <div className="summary-value">{accuracy}%</div>
              <div className="summary-label">Accuracy</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveSession}>
            <i className="fas fa-save"></i> Save Session
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="history-section">
        <h3>Recent Practice Sessions</h3>
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <p>No practice sessions recorded yet.</p>
            </div>
          ) : (
            history.slice(0, 5).map(session => (
              <div key={session.id} className="history-item">
                <div className="history-date">{session.date}</div>
                <div className="history-stats">
                  <div className="history-stat">
                    <div className="history-value">{session.totalQuestions}</div>
                    <div className="history-label">Total</div>
                  </div>
                  <div className="history-stat">
                    <div className="history-value">{session.correctQuestions}</div>
                    <div className="history-label">Correct</div>
                  </div>
                  <div className="history-stat">
                    <div className="history-value">{session.accuracy}%</div>
                    <div className="history-label">Accuracy</div>
                  </div>
                  <div className="history-stat">
                    <div className="history-value">{session.subject}</div>
                    <div className="history-label">Subject</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type === 'error' ? 'error' : ''}`}>
          <div className="notification-content">
            <i className={`fas fa-${notification.type === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;