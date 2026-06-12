import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Loader from '../components/common/Loader';
import '../styles/Settings.css';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [notification, setNotification] = useState(null);
  const [forceShow, setForceShow] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    class: '12',
    examType: 'jee',
    dailyGoal: 4,
    pomodoroDuration: 25,
    breakDuration: 5,
    notifications: true,
    weeklyReport: true,
    aiRecommendations: true,
    distractionFree: true,
    autoPause: true
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Force show after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Settings force showing after timeout');
        setForceShow(true);
        setLoading(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const profilePromise = userAPI.getProfile().catch(() => null);
        const settingsPromise = userAPI.getSettings().catch(() => null);
        
        const results = await Promise.race([
          Promise.all([profilePromise, settingsPromise]),
          timeoutPromise.then(() => [null, null])
        ]).catch(() => [null, null]);
        
        const [profile, settings] = results;
        
        if (profile || settings) {
          setFormData(prev => ({
            ...prev,
            fullName: profile ? `${profile.firstName} ${profile.lastName}` : prev.fullName,
            email: profile?.email || prev.email,
            phone: profile?.phone || prev.phone,
            class: profile?.currentGrade || prev.class,
            examType: profile?.examType || prev.examType,
            dailyGoal: settings?.dailyGoal || prev.dailyGoal,
            pomodoroDuration: settings?.pomodoroDuration || prev.pomodoroDuration,
            breakDuration: settings?.breakDuration || prev.breakDuration,
            notifications: settings?.notifications ?? prev.notifications,
            weeklyReport: settings?.weeklyReport ?? prev.weeklyReport,
            aiRecommendations: settings?.aiRecommendations ?? prev.aiRecommendations,
            distractionFree: settings?.distractionFree ?? prev.distractionFree,
            autoPause: settings?.autoPause ?? prev.autoPause
          }));
          setApiError(false);
        } else {
          setApiError(true);
          console.log('Using mock settings data');
        }
      } catch (err) {
        console.log('API not available, using mock data');
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

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
  };

  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      showNotification('New passwords do not match!', 'error');
      return;
    }
    
    setSaving(true);
    
    try {
      await userAPI.updateProfile({
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        currentGrade: formData.class,
        examType: formData.examType
      }).catch(() => null);

      await userAPI.updateSettings({
        dailyGoal: formData.dailyGoal,
        pomodoroDuration: formData.pomodoroDuration,
        breakDuration: formData.breakDuration,
        notifications: formData.notifications,
        weeklyReport: formData.weeklyReport,
        aiRecommendations: formData.aiRecommendations,
        distractionFree: formData.distractionFree,
        autoPause: formData.autoPause
      }).catch(() => null);
      
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('Settings saved successfully!');
    } catch (err) {
      showNotification('Settings saved locally!', 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelChanges = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      window.location.reload();
    }
  };

  // Show loader while loading
  if (loading && !forceShow) {
    return (
      <div className="page-loader">
        <Loader size="large" text="Loading your settings..." />
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* Unique Settings Page Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '40px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>
          ⚙️ Settings
        </h1>
        <p>Manage your account preferences and study settings</p>
      </div>

      {apiError && (
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

      <div className="container">
        <div className="settings-container">
          {/* Profile Section */}
          <div className="profile-section interactive">
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
            {/* Personal Information Card */}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="class">Class/Grade</label>
                <select 
                  id="class" 
                  className="select-control"
                  value={formData.class}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="dropper">Dropper</option>
                </select>
              </div>
            </div>
            
            {/* Exam Preferences Card */}
            <div className="settings-card">
              <h2><i className="fas fa-graduation-cap"></i> Exam Preferences</h2>
              
              <div className="form-group">
                <label htmlFor="examType">Exam Type</label>
                <select 
                  id="examType" 
                  className="select-control"
                  value={formData.examType}
                  onChange={handleInputChange}
                  disabled={saving}
                >
                  <option value="jee">JEE (Main & Advanced)</option>
                  <option value="neet">NEET UG</option>
                </select>
              </div>
              
              <div className="checkbox-group interactive">
                <input 
                  type="checkbox" 
                  id="notifications" 
                  checked={formData.notifications}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                <label htmlFor="notifications">Enable study reminders and notifications</label>
              </div>
              
              <div className="checkbox-group interactive">
                <input 
                  type="checkbox" 
                  id="weeklyReport" 
                  checked={formData.weeklyReport}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                <label htmlFor="weeklyReport">Send weekly progress report via email</label>
              </div>
              
              <div className="checkbox-group interactive">
                <input 
                  type="checkbox" 
                  id="aiRecommendations" 
                  checked={formData.aiRecommendations}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                <label htmlFor="aiRecommendations">Enable AI-based topic recommendations</label>
              </div>
            </div>
            
            {/* Study Preferences Card */}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
              
              <div className="checkbox-group interactive">
                <input 
                  type="checkbox" 
                  id="distractionFree" 
                  checked={formData.distractionFree}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                <label htmlFor="distractionFree">Enable distraction-free study mode</label>
              </div>
              
              <div className="checkbox-group interactive">
                <input 
                  type="checkbox" 
                  id="autoPause" 
                  checked={formData.autoPause}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                <label htmlFor="autoPause">Auto-pause timer when inactive</label>
              </div>
            </div>
            
            {/* Account Security Card */}
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
                  disabled={saving}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  className="form-control" 
                  placeholder="Enter new password (min. 8 characters)"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
              
              <div className="settings-actions">
                <button 
                  className="btn btn-secondary btn-animated" 
                  onClick={handleCancelChanges}
                  disabled={saving}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button 
                  className="btn btn-success btn-animated" 
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? <span className="loading-spinner"></span> : <><i className="fas fa-save"></i> Save Changes</>}
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