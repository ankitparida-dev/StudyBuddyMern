import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/PersonalDiary.css';

const PersonalDiary = () => {
  const { showNotification } = useNotifications();
  const [streak, setStreak] = useState(7);
  const [alerts, setAlerts] = useState({ reminders: true, progress: true });
  const [todayEntry, setTodayEntry] = useState('Completed two chapters of Physics today. Feeling good about my progress!');
  const [todayMood, setTodayMood] = useState('happy');
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [graphData, setGraphData] = useState([5, 4, 6, 3, 7, 5, 6]);

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('diaryEntries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (e) {
        console.error('Failed to parse diary entries:', e);
      }
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('diaryEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const getDateString = useCallback((date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  const getMoodEmoji = useCallback((mood) => {
    const emojis = {
      happy: '😊',
      neutral: '😐',
      sad: '😔',
      excited: '🤩',
      tired: '😴',
      focused: '🧠'
    };
    return emojis[mood] || '😊';
  }, []);

  const handleSaveEntry = useCallback(() => {
    if (!todayEntry.trim()) {
      showNotification('Please write something before saving.', 'error');
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: getDateString(selectedDate),
      content: todayEntry,
      mood: todayMood,
      timestamp: selectedDate.toISOString()
    };

    setEntries(prev => [newEntry, ...prev]);
    showNotification('📝 Diary entry saved successfully!');
    setTodayEntry('');
  }, [todayEntry, todayMood, selectedDate, getDateString, showNotification]);

  const handleResetStreak = useCallback(() => {
    if (window.confirm('Are you sure you want to reset your streak?')) {
      setStreak(0);
      showNotification('Streak reset! Start fresh tomorrow.', 'warning');
    }
  }, [showNotification]);

  const handleToggleAlerts = useCallback(() => {
    setAlerts(prev => ({
      reminders: !prev.reminders,
      progress: !prev.progress
    }));
    showNotification(alerts.reminders ? '🔕 Alerts disabled' : '🔔 Alerts enabled!');
  }, [alerts.reminders, showNotification]);

  const handleUpdateGraph = useCallback(() => {
    const newData = graphData.map(() => Math.floor(Math.random() * 6) + 2);
    setGraphData(newData);
    showNotification('📊 Progress graph updated!');
  }, [graphData, showNotification]);

  const handleDeleteEntry = useCallback((id) => {
    if (window.confirm('Delete this entry?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
      showNotification('Entry deleted.', 'info');
    }
  }, [showNotification]);

  const MoodOption = useCallback(({ mood, isActive, onClick, emoji }) => (
    <button 
      className={`mood-option mood-${mood} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      data-mood={mood}
      aria-label={`Select ${mood} mood`}
      title={mood.charAt(0).toUpperCase() + mood.slice(1)}
    >
      {emoji}
    </button>
  ), []);

  const moodOptions = useMemo(() => [
    { mood: 'happy', emoji: '😊' },
    { mood: 'excited', emoji: '🤩' },
    { mood: 'focused', emoji: '🧠' },
    { mood: 'neutral', emoji: '😐' },
    { mood: 'tired', emoji: '😴' },
    { mood: 'sad', emoji: '😔' }
  ], []);

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(e => new Date(e.timestamp).toDateString() === today);
    const averageMood = todayEntries.length > 0 
      ? todayEntries.reduce((acc, e) => acc + moodOptions.findIndex(m => m.mood === e.mood) + 1, 0) / todayEntries.length
      : 0;
    
    return {
      count: todayEntries.length,
      averageMood: Math.round(averageMood)
    };
  }, [entries, moodOptions]);

  return (
    <section className="personal-diary" id="personal-diary">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fas fa-book-journal-whills"></i>
            Personal Diary
          </h2>
          <p className="section-subtitle">
            Track your daily study journey, moods, and progress
            <span className="diary-stats">
              {entries.length} entries • {todayStats.count} today
            </span>
          </p>
        </div>

        <div className="diary-container">
          {/* Sidebar */}
          <div className="diary-sidebar">
            {/* Study Streaks */}
            <div className="diary-feature interactive-feature">
              <h3>
                <span className="feature-icon">🔥</span>
                Study Streaks
              </h3>
              <p>Maintain consistency with your study routine</p>
              <div className="streak-container">
                <div className="streak-count">{streak}</div>
                <div className="streak-label">days in a row!</div>
              </div>
              <div className="streak-message">
                {streak >= 30 ? '🏆 Legendary! Keep going!' :
                 streak >= 14 ? '🌟 Amazing consistency!' :
                 streak >= 7 ? '💪 Great momentum!' :
                 '🌱 Every day counts! Start today!'}
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleResetStreak}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Reset Streak
              </button>
            </div>

            {/* SMS Alerts */}
            <div className="diary-feature interactive-feature">
              <h3>
                <span className="feature-icon">🔔</span>
                SMS Alerts
              </h3>
              <p>Get reminders and motivational messages</p>
              <div className="alert-settings">
                <div className="alert-item">
                  <span>Study Reminders</span>
                  <span className={`alert-status ${alerts.reminders ? 'active' : 'inactive'}`}>
                    {alerts.reminders ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="alert-item">
                  <span>Progress Updates</span>
                  <span className={`alert-status ${alerts.progress ? 'active' : 'inactive'}`}>
                    {alerts.progress ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleToggleAlerts}
                style={{ marginTop: '10px', width: '100%' }}
              >
                {alerts.reminders ? 'Disable Alerts' : 'Enable Alerts'}
              </button>
            </div>

            {/* Progress Graph */}
            <div className="diary-feature interactive-feature">
              <h3>
                <span className="feature-icon">📊</span>
                Progress Graph
              </h3>
              <p>Visualize your improvement over time</p>
              <div className="progress-graph">
                <div className="graph-container">
                  {graphData.map((value, index) => (
                    <div 
                      key={index} 
                      className="graph-bar"
                      style={{ 
                        height: `${(value / 7) * 100}%`,
                        backgroundColor: `hsl(210, 70%, ${30 + value * 8}%)`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <span className="graph-value">{value}h</span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={handleUpdateGraph}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Update Graph
              </button>
            </div>
          </div>

          {/* Main Diary */}
          <div className="diary-main">
            {/* Today's Entry */}
            <div className="diary-entry interactive-feature">
              <div className="entry-header">
                <div className="entry-date">
                  <i className="fas fa-calendar-day"></i>
                  {getDateString(selectedDate)}
                </div>
                <div className="entry-mood">
                  {moodOptions.map((option) => (
                    <MoodOption
                      key={option.mood}
                      mood={option.mood}
                      emoji={option.emoji}
                      isActive={todayMood === option.mood}
                      onClick={() => setTodayMood(option.mood)}
                    />
                  ))}
                </div>
              </div>
              <textarea 
                className="entry-content" 
                value={todayEntry}
                onChange={(e) => setTodayEntry(e.target.value)}
                placeholder="How did your study session go today? What did you accomplish? Any challenges you faced?"
                rows={4}
              />
              <div className="entry-actions">
                <button 
                  className="save-btn btn-animated" 
                  onClick={handleSaveEntry}
                  disabled={!todayEntry.trim()}
                >
                  <i className="fas fa-save"></i>
                  Save Entry
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setTodayEntry('')}
                >
                  <i className="fas fa-times"></i>
                  Clear
                </button>
              </div>
            </div>

            {/* Previous Entries */}
            <div className="diary-entries-history">
              <h4>
                <i className="fas fa-history"></i>
                Previous Entries
                <span className="entry-count">{entries.length} entries</span>
              </h4>
              {entries.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-book"></i>
                  <p>No entries yet. Start your diary today!</p>
                </div>
              ) : (
                entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="diary-entry compact">
                    <div className="entry-header">
                      <div className="entry-date">
                        <i className="fas fa-calendar-day"></i>
                        {entry.date}
                      </div>
                      <div className="entry-mood-info">
                        <span className="entry-mood-emoji">{getMoodEmoji(entry.mood)}</span>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDeleteEntry(entry.id)}
                          aria-label="Delete entry"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                    <p className="entry-content-preview">{entry.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalDiary;