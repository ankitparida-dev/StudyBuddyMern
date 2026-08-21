import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { goalsAPI } from '../../services/api';
import '../../styles/DailyGoals.css';

const DailyGoals = ({ onGoalUpdate = null }) => {
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSubject, setGoalSubject] = useState('');
  const [goalPriority, setGoalPriority] = useState('medium');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [editingGoal, setEditingGoal] = useState(null);

  // Load goals
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await goalsAPI.getGoals();
      
      let goalsArray = [];
      if (data && Array.isArray(data.all)) {
        goalsArray = data.all;
      } else if (Array.isArray(data)) {
        goalsArray = data;
      }
      
      setGoals(goalsArray);
      localStorage.setItem('studyGoals', JSON.stringify(goalsArray));
      
    } catch (error) {
      console.error('Failed to load goals:', error);
      const savedGoals = localStorage.getItem('studyGoals');
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      showNotification('Failed to load goals', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addGoal = useCallback(async () => {
    if (!goalTitle.trim()) {
      showNotification('Please enter a goal title.', 'error');
      return;
    }
    if (!goalSubject) {
      showNotification('Please select a subject.', 'error');
      return;
    }

    setSaving(true);
    try {
      const newGoal = {
        title: goalTitle.trim(),
        subject: goalSubject,
        priority: goalPriority,
        deadline: goalDeadline || undefined
      };

      const response = await goalsAPI.createGoal(newGoal);
      await fetchGoals();
      
      setGoalTitle('');
      setGoalSubject('');
      setGoalPriority('medium');
      setGoalDeadline('');
      
      showNotification('🎯 Goal added successfully!');
      onGoalUpdate?.('added', response);
      
    } catch (error) {
      console.error('Failed to add goal:', error);
      
      // Fallback
      const fallbackGoal = {
        _id: Date.now().toString(),
        title: goalTitle.trim(),
        subject: goalSubject,
        priority: goalPriority,
        deadline: goalDeadline,
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
  }, [goalTitle, goalSubject, goalPriority, goalDeadline, goals, fetchGoals, showNotification, onGoalUpdate]);

  const completeGoal = useCallback(async (id) => {
    try {
      await goalsAPI.completeGoal(id);
      await fetchGoals();
      showNotification('🎉 Goal completed! Great job!');
      onGoalUpdate?.('completed', { id });
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
  }, [fetchGoals, showNotification, onGoalUpdate]);

  const deleteGoal = useCallback(async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    
    try {
      await goalsAPI.deleteGoal(id);
      await fetchGoals();
      showNotification('Goal deleted.');
      onGoalUpdate?.('deleted', { id });
    } catch (error) {
      console.error('Failed to delete goal:', error);
      
      setGoals(prev => prev.filter(goal => goal._id !== id && goal.id !== id));
      localStorage.setItem('studyGoals', JSON.stringify(goals));
      showNotification('Goal deleted (offline)');
    }
  }, [fetchGoals, showNotification, onGoalUpdate]);

  const editGoal = useCallback((goal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalSubject(goal.subject);
    setGoalPriority(goal.priority || 'medium');
    setGoalDeadline(goal.deadline || '');
  }, []);

  const updateGoal = useCallback(async () => {
    if (!editingGoal) return;
    
    try {
      await goalsAPI.updateGoal(editingGoal._id, {
        title: goalTitle.trim(),
        subject: goalSubject,
        priority: goalPriority,
        deadline: goalDeadline
      });
      
      await fetchGoals();
      setEditingGoal(null);
      setGoalTitle('');
      setGoalSubject('');
      setGoalPriority('medium');
      setGoalDeadline('');
      showNotification('Goal updated successfully!');
      
    } catch (error) {
      console.error('Failed to update goal:', error);
      showNotification('Failed to update goal', 'error');
    }
  }, [editingGoal, goalTitle, goalSubject, goalPriority, goalDeadline, fetchGoals, showNotification]);

  const subjects = useMemo(() => [
    { value: 'physics', label: 'Physics', icon: 'fa-atom', color: '#4cc9f0' },
    { value: 'chemistry', label: 'Chemistry', icon: 'fa-flask', color: '#f8961e' },
    { value: 'math', label: 'Mathematics', icon: 'fa-square-root-alt', color: '#7209b7' },
    { value: 'biology', label: 'Biology', icon: 'fa-dna', color: '#4caf50' }
  ], []);

  const priorities = useMemo(() => [
    { value: 'high', label: '🔥 High', color: '#ef4444' },
    { value: 'medium', label: '⚡ Medium', color: '#f59e0b' },
    { value: 'low', label: '💤 Low', color: '#10b981' }
  ], []);

  const filteredGoals = useMemo(() => {
    if (filter === 'active') {
      return goals.filter(g => !g.completed);
    } else if (filter === 'completed') {
      return goals.filter(g => g.completed);
    }
    return goals;
  }, [goals, filter]);

  const stats = useMemo(() => ({
    total: goals.length,
    completed: goals.filter(g => g.completed).length,
    active: goals.filter(g => !g.completed).length
  }), [goals]);

  if (loading) {
    return (
      <div className="tool-card feature-card">
        <div className="tool-header">
          <div className="tool-icon"><i className="fas fa-bullseye"></i></div>
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
        <div className="tool-icon"><i className="fas fa-bullseye"></i></div>
        <h2>Daily Goals</h2>
        <span className="goal-stats-badge">{stats.active} active</span>
      </div>
      
      {/* Stats */}
      <div className="goal-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.active}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>

      {/* Goal Form */}
      <div className="goal-form">
        <div className="form-row">
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
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select
              className="form-control"
              value={goalPriority}
              onChange={(e) => setGoalPriority(e.target.value)}
              disabled={saving}
            >
              {priorities.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Deadline (Optional)</label>
            <input
              type="date"
              className="form-control"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <button 
          className={`btn ${editingGoal ? 'btn-warning' : 'btn-primary'}`} 
          onClick={editingGoal ? updateGoal : addGoal}
          disabled={saving}
        >
          {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Add Goal'}
        </button>
        {editingGoal && (
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setEditingGoal(null);
              setGoalTitle('');
              setGoalSubject('');
              setGoalPriority('medium');
              setGoalDeadline('');
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="goal-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({stats.active})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {/* Goals List */}
      <div className="goals-list">
        {filteredGoals.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-clipboard-list"></i>
            <p>{filter === 'all' ? 'No goals yet. Add your first goal!' : 
                  filter === 'active' ? 'No active goals. 🎉' : 
                  'No completed goals yet.'}</p>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const subject = subjects.find(s => s.value === goal.subject);
            const priority = priorities.find(p => p.value === (goal.priority || 'medium'));
            
            return (
              <div key={goal._id || goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                <div className="goal-info">
                  <div className="goal-header">
                    <h4>{goal.title}</h4>
                    <span className="goal-priority" style={{ color: priority?.color }}>
                      {priority?.label || '⚡ Medium'}
                    </span>
                  </div>
                  <div className="goal-meta">
                    {subject && (
                      <span className="goal-subject" style={{ color: subject.color }}>
                        <i className={`fas ${subject.icon}`}></i> {subject.label}
                      </span>
                    )}
                    {goal.deadline && (
                      <span className="goal-deadline">
                        <i className="fas fa-calendar"></i> Due: {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span className="goal-date">
                      <i className="fas fa-clock"></i> {new Date(goal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="goal-actions">
                  {!goal.completed && (
                    <button
                      className="goal-btn btn-complete"
                      onClick={() => completeGoal(goal._id || goal.id)}
                      title="Complete goal"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  )}
                  {!goal.completed && (
                    <button
                      className="goal-btn btn-edit"
                      onClick={() => editGoal(goal)}
                      title="Edit goal"
                    >
                      <i className="fas fa-pen"></i>
                    </button>
                  )}
                  <button
                    className="goal-btn btn-delete"
                    onClick={() => deleteGoal(goal._id || goal.id)}
                    title="Delete goal"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <i className={`fas fa-${notification.type === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyGoals;