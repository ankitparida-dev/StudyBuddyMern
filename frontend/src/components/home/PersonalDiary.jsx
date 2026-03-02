import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/PersonalDiary.css';

const PersonalDiary = () => {
  const { showNotification } = useNotifications();
  const [streak, setStreak] = useState(7);
  const [alerts, setAlerts] = useState({ reminders: true, progress: true });
  const [todayEntry, setTodayEntry] = useState('Completed two chapters of Physics today. Feeling good about my progress!');
  const [todayMood, setTodayMood] = useState('happy');
  const [graphData, setGraphData] = useState('Study Hours This Week');

  const yesterdayEntry = 'Focused on Mathematics revision. Solved practice problems for 2 hours.';

  const handleSaveEntry = () => {
    showNotification('Diary entry saved successfully!');
  };

  const handleResetStreak = () => {
    setStreak(0);
    showNotification('Streak reset! Start fresh tomorrow.');
  };

  const handleToggleAlerts = () => {
    setAlerts(prev => ({
      reminders: !prev.reminders,
      progress: !prev.progress
    }));
    showNotification(alerts.reminders ? 'Alerts disabled' : 'Alerts enabled!');
  };

  const handleUpdateGraph = () => {
    setGraphData('Updated! Study Hours: 5h 30m');
    showNotification('Progress graph updated!');
  };

  const MoodOption = ({ mood, isActive, onClick }) => (
    <div 
      className={`mood-option mood-${mood} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      data-mood={mood}
    ></div>
  );

  return (
    <section className="personal-diary" id="personal-diary">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Personal Diary</h2>
          <p className="section-subtitle">Track your daily study journey, moods, and progress</p>
        </div>

        <div className="diary-container">
          <div className="diary-sidebar">
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
              <button 
                className="btn btn-primary btn-animated" 
                onClick={handleResetStreak}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Reset Streak
              </button>
            </div>

            <div className="diary-feature interactive-feature">
              <h3>
                <span className="feature-icon">🔔</span>
                SMS Alerts
              </h3>
              <p>Get reminders and motivational messages</p>
              <div className="alert-settings">
                <div className="alert-item">
                  <span>Study Reminders</span>
                  <span className="alert-status">
                    {alerts.reminders ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="alert-item">
                  <span>Progress Updates</span>
                  <span className="alert-status">
                    {alerts.progress ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-animated" 
                onClick={handleToggleAlerts}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Toggle Alerts
              </button>
            </div>

            <div className="diary-feature interactive-feature">
              <h3>
                <span className="feature-icon">📊</span>
                Progress Graph
              </h3>
              <p>Visualize your improvement over time</p>
              <div className="progress-graph">
                <div className="graph-placeholder">
                  {graphData}
                </div>
              </div>
              <button 
                className="btn btn-primary btn-animated" 
                onClick={handleUpdateGraph}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Update Graph
              </button>
            </div>
          </div>

          <div className="diary-main">
            <div className="diary-entry interactive-feature">
              <div className="entry-header">
                <div className="entry-date">Today</div>
                <div className="entry-mood">
                  <MoodOption 
                    mood="happy" 
                    isActive={todayMood === 'happy'}
                    onClick={() => setTodayMood('happy')}
                  />
                  <MoodOption 
                    mood="neutral" 
                    isActive={todayMood === 'neutral'}
                    onClick={() => setTodayMood('neutral')}
                  />
                  <MoodOption 
                    mood="sad" 
                    isActive={todayMood === 'sad'}
                    onClick={() => setTodayMood('sad')}
                  />
                </div>
              </div>
              <textarea 
                className="entry-content" 
                value={todayEntry}
                onChange={(e) => setTodayEntry(e.target.value)}
                placeholder="How did your study session go today? What did you accomplish? Any challenges you faced?"
              />
              <div className="entry-actions">
                <button 
                  className="save-btn btn-animated" 
                  onClick={handleSaveEntry}
                >
                  Save Entry
                </button>
              </div>
            </div>

            <div className="diary-entry interactive-feature">
              <div className="entry-header">
                <div className="entry-date">Yesterday</div>
                <div className="entry-mood">
                  <MoodOption mood="happy" isActive={false} />
                  <MoodOption mood="neutral" isActive={true} />
                  <MoodOption mood="sad" isActive={false} />
                </div>
              </div>
              <textarea 
                className="entry-content" 
                value={yesterdayEntry}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalDiary;