import React, { useState, useEffect } from 'react';
import { goalsAPI } from '../../services/api';
import '../../styles/DailyGoals.css';

const DailyGoals = () => {
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSubject, setGoalSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsAPI.getGoals();
      
      console.log('API Response:', data);
      
      // Extract goals from the response
      let goalsArray = [];
      if (data && Array.isArray(data.all)) {
        goalsArray = data.all;
      } else if (Array.isArray(data)) {
        goalsArray = data;
      } else {
        goalsArray = [];
      }
      
      setGoals(goalsArray);
      localStorage.setItem('studyGoals', JSON.stringify(goalsArray));
      
    } catch (error) {
      console.error('Failed to load goals:', error);
      showNotification('Failed to load goals', 'error');
      
      const savedGoals = localStorage.getItem('studyGoals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addGoal = async () => {
    if (!goalTitle.trim() || !goalSubject) {
      showNotification('Please fill in both goal title and subject.', 'error');
      return;
    }

    setSaving(true);
    try {
      await goalsAPI.createGoal({
        title: goalTitle,
        subject: goalSubject
      });
      
      await fetchGoals(); // Refresh the list
      setGoalTitle('');
      setGoalSubject('');
      showNotification('Goal added successfully!');
      
    } catch (error) {
      console.error('Failed to add goal:', error);
      
      // Fallback
      const fallbackGoal = {
        _id: Date.now().toString(),
        title: goalTitle,
        subject: goalSubject,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      setGoals(prev => [...prev, fallbackGoal]);
      localStorage.setItem('studyGoals', JSON.stringify([...goals, fallbackGoal]));
      setGoalTitle('');
      setGoalSubject('');
      showNotification('Goal saved locally', 'success');
    } finally {
      setSaving(false);
    }
  };

  const completeGoal = async (id) => {
    try {
      await goalsAPI.completeGoal(id);
      await fetchGoals();
      showNotification('Goal completed! 🎉');
    } catch (error) {
      console.error('Failed to complete goal:', error);
      
      setGoals(prev => prev.map(goal =>
        (goal._id === id || goal.id === id)
          ? { ...goal, completed: true, completedAt: new Date().toISOString() }
          : goal
      ));
      localStorage.setItem('studyGoals', JSON.stringify(goals));
      showNotification('Goal completed (offline)', 'success');
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    
    try {
      await goalsAPI.deleteGoal(id);
      await fetchGoals();
      showNotification('Goal deleted.');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      
      setGoals(prev => prev.filter(goal => goal._id !== id && goal.id !== id));
      localStorage.setItem('studyGoals', JSON.stringify(goals));
      showNotification('Goal deleted (offline)');
    }
  };

  const subjects = [
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'math', label: 'Mathematics' },
    { value: 'biology', label: 'Biology' }
  ];

  if (loading) {
    return (
      <div className="tool-card feature-card">
        <div className="tool-header">
          <div className="tool-icon">
            <i className="fas fa-bullseye"></i>
          </div>
          <h2>Daily Goals</h2>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-card feature-card">
      <div className="tool-header">
        <div className="tool-icon">
          <i className="fas fa-bullseye"></i>
        </div>
        <h2>Daily Goals</h2>
      </div>
      
      <div className="goal-form">
        <div className="form-group">
          <label>Goal Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., Revise 2 chapters of Physics"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="form-group">
          <label>Subject</label>
          <select
            className="form-control"
            value={goalSubject}
            onChange={(e) => setGoalSubject(e.target.value)}
            disabled={saving}
          >
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={addGoal} 
          style={{ width: '100%' }}
          disabled={saving}
        >
          {saving ? 'Adding...' : 'Add Goal'}
        </button>
      </div>

      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-clipboard-list"></i>
            <p>No goals yet. Add your first goal!</p>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal._id || goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
              <div className="goal-info">
                <h4>{goal.title}</h4>
                <p>Subject: {goal.subject}</p>
                <small>Created: {new Date(goal.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="goal-actions">
                {!goal.completed && (
                  <button
                    className="goal-btn btn-complete"
                    onClick={() => completeGoal(goal._id || goal.id)}
                  >
                    ✓
                  </button>
                )}
                <button
                  className="goal-btn btn-delete"
                  onClick={() => deleteGoal(goal._id || goal.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default DailyGoals;