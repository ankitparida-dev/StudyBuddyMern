import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { practiceAPI } from '../../services/api';
import '../../styles/ProgressTracker.css';

const ProgressTracker = ({ 
  examType, 
  stats = {}, 
  recentSessions = [], 
  onSaveSession,
  maxQuestions = 50,
  showHistory = true,
  showStats = true
}) => {
  // State
  const [currentSubject, setCurrentSubject] = useState(() => {
    return examType === 'jee' ? 'physics' : 'biology';
  });
  const [topicName, setTopicName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filter, setFilter] = useState('all'); // all, correct, incorrect
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, topic
  
  // Refs
  const inputRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Use real stats from backend
  const todayMinutes = stats?.totalMinutes || 0;
  const todaySessions = stats?.totalSessions || 0;
  const overallAccuracy = stats?.accuracy || 0;
  const weeklyProgress = stats?.weeklyProgress || 0;

  // Load saved history
  useEffect(() => {
    const savedHistory = localStorage.getItem(`${examType}PracticeHistory`);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, [examType]);

  // Cleanup notification timeout
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // Get subject stats
  const getSubjectStats = useCallback(() => {
    const totalQuestions = questions.length;
    const correctQuestions = questions.filter(q => q.checked).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
    return { totalQuestions, correctQuestions, accuracy };
  }, [questions]);

  // Handle add question
  const handleAddQuestion = useCallback(() => {
    if (questions.length >= maxQuestions) {
      showNotification(`Maximum ${maxQuestions} questions allowed per session.`, 'error');
      return;
    }

    const newQuestion = {
      id: Date.now(),
      text: `Question ${questions.length + 1} from ${topicName || 'Untitled Topic'}`,
      topic: topicName || 'Untitled Topic',
      subject: currentSubject,
      checked: false,
      difficulty: 'medium',
      timestamp: new Date().toISOString()
    };

    setQuestions(prev => [...prev, newQuestion]);
    if (questions.length === 0) {
      setTopicName('');
    }
    
    // Focus input after adding
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [questions, topicName, currentSubject, maxQuestions, showNotification]);

  // Handle toggle question
  const handleToggleQuestion = useCallback((id) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, checked: !q.checked } : q)
    );
  }, []);

  // Handle delete question
  const handleDeleteQuestion = useCallback((id) => {
    if (window.confirm('Delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  }, []);

  // Handle edit question
  const handleEditQuestion = useCallback((id, newText) => {
    setQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, text: newText } : q)
    );
    setEditingQuestion(null);
  }, []);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    if (questions.length === 0) return;
    if (window.confirm('Are you sure you want to clear all questions?')) {
      setQuestions([]);
      showNotification('All questions cleared.', 'info');
    }
  }, [questions, showNotification]);

  // Handle save session
  const handleSaveSession = useCallback(async () => {
    if (questions.length === 0) {
      showNotification('Please add at least one question before saving.', 'error');
      return;
    }

    const { totalQuestions, correctQuestions, accuracy } = getSubjectStats();

    const sessionData = {
      subject: currentSubject,
      topic: topicName || 'General Practice',
      totalQuestions,
      correctAnswers: correctQuestions,
      accuracy,
      timeSpent: Math.ceil(questions.length * 2),
      difficulty: 'medium',
      notes: `Practiced ${topicName || 'various topics'}`,
      questions: questions.map(q => ({
        text: q.text,
        topic: q.topic,
        correct: q.checked,
        difficulty: q.difficulty
      }))
    };

    try {
      setSaving(true);
      
      // Try to save to backend
      const token = localStorage.getItem('token');
      if (token) {
        await practiceAPI.saveSession(sessionData);
      }
      
      // Save to localStorage as backup
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
        topic: topicName || 'General Practice',
        totalQuestions,
        correctQuestions,
        accuracy,
        questions: [...questions]
      };

      const updatedHistory = [session, ...history];
      setHistory(updatedHistory);
      localStorage.setItem(`${examType}PracticeHistory`, JSON.stringify(updatedHistory));
      
      setQuestions([]);
      setTopicName('');
      showNotification('Practice session saved successfully! 🎉');
      
      // Call parent callback
      if (onSaveSession) {
        onSaveSession(sessionData);
      }
      
    } catch (error) {
      showNotification('Failed to save session: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [questions, currentSubject, topicName, history, examType, onSaveSession, getSubjectStats, showNotification]);

  // Handle key press for adding questions
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddQuestion();
    }
  }, [handleAddQuestion]);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = [...questions];
    
    // Filter by status
    if (filter === 'correct') {
      filtered = filtered.filter(q => q.checked);
    } else if (filter === 'incorrect') {
      filtered = filtered.filter(q => !q.checked);
    }
    
    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(term) || 
        q.topic.toLowerCase().includes(term)
      );
    }
    
    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'topic') {
      filtered.sort((a, b) => a.topic.localeCompare(b.topic));
    }
    
    return filtered;
  }, [questions, filter, searchTerm, sortBy]);

  // Get subject config
  const subjects = useMemo(() => {
    const baseSubjects = [
      { id: 'physics', icon: 'fa-atom', label: 'Physics', color: '#4361ee' },
      { id: 'chemistry', icon: 'fa-flask', label: 'Chemistry', color: '#f8961e' },
    ];
    
    if (examType === 'jee') {
      baseSubjects.push({ id: 'math', icon: 'fa-square-root-alt', label: 'Mathematics', color: '#7209b7' });
    } else {
      baseSubjects.push({ id: 'biology', icon: 'fa-dna', label: 'Biology', color: '#10b981' });
    }
    
    return baseSubjects;
  }, [examType]);

  // Get stats
  const { totalQuestions, correctQuestions, accuracy } = getSubjectStats();

  // Calculate progress percentage
  const progressPercentage = totalQuestions > 0 ? (correctQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="tracker-container">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <i className="fas fa-clipboard-check"></i>
          Practice Question Tracker
        </h2>
        <p className="section-subtitle">
          Track your daily practice performance by marking questions you answered correctly
          <span className="question-limit"> • Max {maxQuestions} questions per session</span>
        </p>
      </div>

      {/* Stats Overview */}
      {showStats && (
        <div className="tracker-stats-overview">
          <div className="stat-card interactive">
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </div>
              <div className="stat-label">Study Time Today</div>
            </div>
          </div>
          <div className="stat-card interactive">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{overallAccuracy}%</div>
              <div className="stat-label">Overall Accuracy</div>
            </div>
          </div>
          <div className="stat-card interactive">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
              <i className="fas fa-bullseye"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{todaySessions}</div>
              <div className="stat-label">Sessions Today</div>
            </div>
          </div>
          <div className="stat-card interactive">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <i className="fas fa-fire"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{weeklyProgress}%</div>
              <div className="stat-label">Weekly Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="recent-sessions">
          <h3 className="recent-sessions-title">
            <i className="fas fa-clock-rotate-left"></i>
            Recent Practice
          </h3>
          <div className="recent-sessions-list">
            {recentSessions.slice(0, 4).map((session, idx) => (
              <div key={idx} className="recent-session-tag">
                <span className="session-subject">{session.subject}</span>
                <span className="session-accuracy">{session.accuracy}%</span>
                <span className="session-time">{session.timeSpent}min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Selection */}
      <div className="subject-selection">
        <h3>Select Subject</h3>
        <div className="subject-tabs">
          {subjects.map(subject => (
            <button
              key={subject.id}
              className={`subject-tab ${currentSubject === subject.id ? 'active' : ''}`}
              onClick={() => setCurrentSubject(subject.id)}
              style={{
                '--subject-color': subject.color
              }}
            >
              <i className={`fas ${subject.icon}`}></i>
              <span>{subject.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tracker Form */}
      <div className="tracker-form">
        <div className="form-header">
          <h3 className="form-title">
            <i className="fas fa-pencil-alt"></i>
            Today's Practice Questions
            <span className="question-count">{questions.length} / {maxQuestions}</span>
          </h3>
          <div className="form-controls">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleAddQuestion} 
              disabled={saving || questions.length >= maxQuestions}
            >
              <i className="fas fa-plus"></i> Add Question
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleClearAll} 
              disabled={saving || questions.length === 0}
            >
              <i className="fas fa-trash"></i> Clear All
            </button>
          </div>
        </div>

        {/* Topic Input */}
        <div className="form-group">
          <label htmlFor="topic-name" className="form-label">
            <i className="fas fa-tag"></i>
            Topic/Chapter Name
          </label>
          <div className="input-with-shortcut">
            <input
              ref={inputRef}
              type="text"
              id="topic-name"
              className="form-input"
              placeholder="e.g., Kinematics, Organic Chemistry, etc."
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={saving}
            />
            <span className="input-shortcut">Ctrl+Enter to add</span>
          </div>
        </div>

        {/* Filters and Search */}
        {questions.length > 0 && (
          <div className="tracker-filters">
            <div className="filter-group">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({questions.length})
              </button>
              <button 
                className={`filter-btn correct ${filter === 'correct' ? 'active' : ''}`}
                onClick={() => setFilter('correct')}
              >
                Correct ({questions.filter(q => q.checked).length})
              </button>
              <button 
                className={`filter-btn incorrect ${filter === 'incorrect' ? 'active' : ''}`}
                onClick={() => setFilter('incorrect')}
              >
                Incorrect ({questions.filter(q => !q.checked).length})
              </button>
            </div>
            <div className="sort-group">
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="topic">By Topic</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Questions Grid */}
        <div className="questions-grid">
          {filteredQuestions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <p>
                {searchTerm ? 'No matching questions found.' : 'No questions added yet. Click "Add Question" to get started!'}
              </p>
              {searchTerm && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            filteredQuestions.map(question => (
              <div key={question.id} className={`question-item ${question.checked ? 'checked' : ''}`}>
                <div 
                  className={`question-checkbox ${question.checked ? 'checked' : ''}`}
                  onClick={() => !saving && handleToggleQuestion(question.id)}
                  role="checkbox"
                  aria-checked={question.checked}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleQuestion(question.id);
                    }
                  }}
                >
                  {question.checked && <i className="fas fa-check"></i>}
                </div>
                <div className="question-content">
                  <div className="question-text">
                    {editingQuestion === question.id ? (
                      <input
                        type="text"
                        className="question-edit-input"
                        defaultValue={question.text}
                        onBlur={(e) => handleEditQuestion(question.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditQuestion(question.id, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span onClick={() => setEditingQuestion(question.id)}>
                        {question.text}
                      </span>
                    )}
                  </div>
                  <div className="question-meta">
                    <span className="question-topic">
                      <i className="fas fa-tag"></i> {question.topic}
                    </span>
                    <span className="question-difficulty">
                      <i className="fas fa-signal"></i> {question.difficulty || 'medium'}
                    </span>
                  </div>
                </div>
                <div className="question-actions">
                  <button 
                    className="btn-icon edit" 
                    onClick={() => setEditingQuestion(question.id)}
                    aria-label="Edit question"
                    disabled={saving}
                  >
                    <i className="fas fa-pen"></i>
                  </button>
                  <button 
                    className="btn-icon delete" 
                    onClick={() => !saving && handleDeleteQuestion(question.id)}
                    aria-label="Delete question"
                    disabled={saving}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Summary */}
        {totalQuestions > 0 && (
          <div className="progress-summary">
            <div className="progress-summary-header">
              <div className="summary-item">
                <span className="summary-label">Total</span>
                <span className="summary-value">{totalQuestions}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Correct</span>
                <span className="summary-value">{correctQuestions}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Accuracy</span>
                <span className="summary-value">{accuracy}%</span>
              </div>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: progressPercentage >= 70 ? '#10b981' : 
                             progressPercentage >= 40 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="progress-status">
              {progressPercentage >= 70 ? '🌟 Great job!' :
               progressPercentage >= 40 ? '📈 Keep practicing!' :
               '💪 Practice more to improve!'}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="tracker-actions">
          <button 
            className="btn btn-success btn-large" 
            onClick={handleSaveSession}
            disabled={saving || questions.length === 0}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Session ({totalQuestions} questions)
              </>
            )}
          </button>
        </div>
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="history-section">
          <div className="history-header">
            <h3>
              <i className="fas fa-history"></i>
              Recent Practice Sessions
              <span className="history-count">{history.length} sessions</span>
            </h3>
            {history.length > 0 && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (window.confirm('Clear all history?')) {
                    setHistory([]);
                    localStorage.removeItem(`${examType}PracticeHistory`);
                    showNotification('History cleared.', 'info');
                  }
                }}
              >
                <i className="fas fa-trash"></i> Clear History
              </button>
            )}
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-history"></i>
                <p>No practice sessions recorded yet.</p>
              </div>
            ) : (
              history.slice(0, 5).map(session => (
                <div key={session.id} className="history-item">
                  <div className="history-item-header">
                    <span className="history-date">
                      <i className="fas fa-calendar"></i> {session.date}
                    </span>
                    <span className="history-subject">
                      <i className="fas fa-book"></i> {session.subject}
                    </span>
                  </div>
                  <div className="history-stats">
                    <div className="history-stat">
                      <span className="history-stat-value">{session.totalQuestions}</span>
                      <span className="history-stat-label">Total</span>
                    </div>
                    <div className="history-stat">
                      <span className="history-stat-value">{session.correctQuestions}</span>
                      <span className="history-stat-label">Correct</span>
                    </div>
                    <div className="history-stat">
                      <span className="history-stat-value">{session.accuracy}%</span>
                      <span className="history-stat-label">Accuracy</span>
                    </div>
                  </div>
                  {session.topic && (
                    <div className="history-topic">
                      <i className="fas fa-tag"></i> {session.topic}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

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