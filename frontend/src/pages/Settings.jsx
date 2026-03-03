import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';

const Settings = () => {
  // State for all form fields
  const [formData, setFormData] = useState({
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    class: '12',
    examType: 'jee',
    language: 'english',
    dailyGoal: '4',
    pomodoroDuration: '25',
    breakDuration: '5',
    notifications: true,
    weeklyReport: true,
    aiRecommendations: true,
    distractionFree: true,
    autoPause: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password fields state (separate to handle them differently)
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification state
  const [notification, setNotification] = useState(null);

  // Auto-save timeout
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));

    // Clear any existing auto-save timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new auto-save timeout
    const timeout = setTimeout(() => {
      if (id !== 'currentPassword' && id !== 'newPassword' && id !== 'confirmPassword') {
        showNotification('Changes auto-saved');
      }
    }, 2000);
    setAutoSaveTimeout(timeout);
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCheckboxClick = (e) => {
    const checkbox = e.target.closest('.checkbox-group');
    if (checkbox) {
      checkbox.classList.add('success-animation');
      setTimeout(() => {
        checkbox.classList.remove('success-animation');
      }, 600);
    }
  };

  const handleSaveChanges = () => {
    // Validate passwords if they are filled
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      showNotification('New passwords do not match!', 'error');
      return;
    }
    
    if (passwords.newPassword && !passwords.currentPassword) {
      showNotification('Please enter current password to change password', 'error');
      return;
    }
    
    // Add success animation to save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.classList.add('success-animation');
      setTimeout(() => {
        saveBtn.classList.remove('success-animation');
      }, 600);
    }
    
    showNotification('Settings saved successfully!');
    
    // Simulate API call delay
    setTimeout(() => {
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1000);
  };

  const handleCancelChanges = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      // Reset form to original values
      setFormData({
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        class: '12',
        examType: 'jee',
        language: 'english',
        dailyGoal: '4',
        pomodoroDuration: '25',
        breakDuration: '5',
        notifications: true,
        weeklyReport: true,
        aiRecommendations: true,
        distractionFree: true,
        autoPause: true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      const cancelBtn = document.getElementById('cancelBtn');
      if (cancelBtn) {
        cancelBtn.classList.add('success-animation');
        setTimeout(() => {
          cancelBtn.classList.remove('success-animation');
        }, 600);
      }
      
      showNotification('Changes discarded');
    }
  };

  const handleProfileClick = () => {
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
      profileSection.classList.add('success-animation');
      setTimeout(() => {
        profileSection.classList.remove('success-animation');
      }, 600);
    }
    showNotification('Profile picture updated successfully!');
  };

  const handleInputFocus = (e) => {
    const parent = e.target.parentElement;
    if (parent) {
      parent.classList.add('success-animation');
      setTimeout(() => {
        parent.classList.remove('success-animation');
      }, 600);
    }
  };

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-container">
          <div className="settings-header">
            <h1>Account Settings</h1>
            <p>Manage your profile, preferences, and account settings</p>
          </div>
          
          <div 
            className="profile-section interactive"
            onClick={handleProfileClick}
          >
            <div className="profile-avatar">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="profile-info">
              <h3>{formData.fullName}</h3>
              <p>
                <i className="fas fa-graduation-cap"></i>
                {formData.examType === 'jee' ? 'JEE Aspirant' : 'NEET Aspirant'} | Class {formData.class === '12' ? '12' : formData.class === '11' ? '11' : 'Dropper'}
              </p>
            </div>
          </div>
          
          <div className="settings-grid">
            {/* Personal Information */}
            <div className="settings-card">
              <h2><i className="fas fa-user"></i> Personal Information</h2>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  className="form-control" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-control" 
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="form-control" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="form-group">
                <label htmlFor="class">Class/Grade</label>
                <select 
                  id="class" 
                  className="select-control"
                  value={formData.class}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="dropper">Dropper</option>
                </select>
              </div>
            </div>
            
            {/* Exam Preferences */}
            <div className="settings-card">
              <h2><i className="fas fa-graduation-cap"></i> Exam Preferences</h2>
              <div className="form-group">
                <label htmlFor="examType">Exam Type</label>
                <select 
                  id="examType" 
                  className="select-control"
                  value={formData.examType}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                >
                  <option value="jee">JEE (Main & Advanced)</option>
                  <option value="neet">NEET UG</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="language">Preferred Language</label>
                <select 
                  id="language" 
                  className="select-control"
                  value={formData.language}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                >
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="bengali">Bengali</option>
                  <option value="tamil">Tamil</option>
                  <option value="telugu">Telugu</option>
                  <option value="marathi">Marathi</option>
                </select>
              </div>
              <div 
                className="checkbox-group interactive"
                onClick={handleCheckboxClick}
              >
                <input 
                  type="checkbox" 
                  id="notifications" 
                  checked={formData.notifications}
                  onChange={handleInputChange}
                />
                <label htmlFor="notifications">Enable study reminders and notifications</label>
              </div>
              <div 
                className="checkbox-group interactive"
                onClick={handleCheckboxClick}
              >
                <input 
                  type="checkbox" 
                  id="weeklyReport" 
                  checked={formData.weeklyReport}
                  onChange={handleInputChange}
                />
                <label htmlFor="weeklyReport">Send weekly progress report via email</label>
              </div>
              <div 
                className="checkbox-group interactive"
                onClick={handleCheckboxClick}
              >
                <input 
                  type="checkbox" 
                  id="aiRecommendations" 
                  checked={formData.aiRecommendations}
                  onChange={handleInputChange}
                />
                <label htmlFor="aiRecommendations">Enable AI-based topic recommendations</label>
              </div>
            </div>
            
            {/* Study Preferences */}
            <div className="settings-card">
              <h2><i className="fas fa-book-open"></i> Study Preferences</h2>
              <div className="form-group">
                <label htmlFor="dailyGoal">Daily Study Goal (hours)</label>
                <input 
                  type="number" 
                  id="dailyGoal" 
                  className="form-control" 
                  min="1" 
                  max="12" 
                  value={formData.dailyGoal}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pomodoroDuration">Pomodoro Session Duration (minutes)</label>
                <input 
                  type="number" 
                  id="pomodoroDuration" 
                  className="form-control" 
                  min="15" 
                  max="60" 
                  value={formData.pomodoroDuration}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="form-group">
                <label htmlFor="breakDuration">Break Duration (minutes)</label>
                <input 
                  type="number" 
                  id="breakDuration" 
                  className="form-control" 
                  min="5" 
                  max="30" 
                  value={formData.breakDuration}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div 
                className="checkbox-group interactive"
                onClick={handleCheckboxClick}
              >
                <input 
                  type="checkbox" 
                  id="distractionFree" 
                  checked={formData.distractionFree}
                  onChange={handleInputChange}
                />
                <label htmlFor="distractionFree">Enable distraction-free study mode</label>
              </div>
              <div 
                className="checkbox-group interactive"
                onClick={handleCheckboxClick}
              >
                <input 
                  type="checkbox" 
                  id="autoPause" 
                  checked={formData.autoPause}
                  onChange={handleInputChange}
                />
                <label htmlFor="autoPause">Auto-pause timer when inactive</label>
              </div>
            </div>
            
            {/* Account Security */}
            <div className="settings-card">
              <h2><i className="fas fa-shield-alt"></i> Account Security</h2>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  className="form-control" 
                  placeholder="Enter current password"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  className="form-control" 
                  placeholder="Enter new password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="form-control" 
                  placeholder="Confirm new password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  onFocus={handleInputFocus}
                />
              </div>
              <div className="settings-actions">
                <button 
                  className="btn btn-secondary btn-animated" 
                  id="cancelBtn"
                  onClick={handleCancelChanges}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className="btn btn-success btn-animated" 
                  id="saveBtn"
                  onClick={handleSaveChanges}
                >
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type === 'error' ? 'error' : ''}`}>
          <div className="notification-content">
            <i className={`fas fa-${notification.type === 'error' ? 'exclamation' : 'check'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;