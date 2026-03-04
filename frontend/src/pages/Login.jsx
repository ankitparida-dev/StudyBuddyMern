import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    currentGrade: '',
    examType: ''
  });

  // Notification state
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(loginData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (registerData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!registerData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (registerData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!registerData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(registerData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!registerData.currentGrade) {
      newErrors.currentGrade = 'Please select your status';
    }
    
    if (!registerData.examType) {
      newErrors.examType = 'Please select your exam type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Login successful! Redirecting...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        showNotification(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('Could not connect to the server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          email: registerData.email,
          password: registerData.password,
          current_grade: registerData.currentGrade,
          exam_type: registerData.examType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Registration successful! Please login.');
        setRegisterData({
          firstName: '', lastName: '', email: '', password: '', currentGrade: '', examType: ''
        });
        setTimeout(() => setIsRightPanelActive(false), 2000);
      } else {
        showNotification(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      showNotification('Could not connect to the server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
        
        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Welcome Back!</h1>
            
            <div className="input-group">
              <i className="fas fa-envelope"></i>
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={loginData.email}
                onChange={handleLoginChange}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
            
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={loginData.password}
                onChange={handleLoginChange}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <span className="loading-spinner"></span> : 'Sign In'}
            </button>
            
            <p className="switch-text">
              Don't have an account?{' '}
              <span onClick={() => setIsRightPanelActive(true)}>
                Sign Up
              </span>
            </p>
          </form>
        </div>

        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegisterSubmit}>
            <h1>Create Account</h1>
            
            <div className="name-group">
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input 
                  type="text" 
                  name="firstName" 
                  placeholder="First Name" 
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                />
              </div>
              
              <div className="input-group">
                <i className="fas fa-user"></i>
                <input 
                  type="text" 
                  name="lastName" 
                  placeholder="Last Name" 
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                />
              </div>
            </div>
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}

            <div className="input-group">
              <i className="fas fa-envelope"></i>
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={registerData.email}
                onChange={handleRegisterChange}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}

            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                value={registerData.password}
                onChange={handleRegisterChange}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}

            <div className="selection-group">
              <p className="status-title">Select Your Status:</p>
              <div className="status-options">
                <label className={`radio-label ${registerData.currentGrade === 'Class 11' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="currentGrade" 
                    value="Class 11" 
                    checked={registerData.currentGrade === 'Class 11'}
                    onChange={handleRegisterChange}
                  />
                  <span>Class 11</span>
                </label>
                
                <label className={`radio-label ${registerData.currentGrade === 'Class 12' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="currentGrade" 
                    value="Class 12"
                    checked={registerData.currentGrade === 'Class 12'}
                    onChange={handleRegisterChange}
                  />
                  <span>Class 12</span>
                </label>
                
                <label className={`radio-label ${registerData.currentGrade === 'Dropper' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="currentGrade" 
                    value="Dropper"
                    checked={registerData.currentGrade === 'Dropper'}
                    onChange={handleRegisterChange}
                  />
                  <span>Dropper</span>
                </label>
              </div>
            </div>

            <div className="selection-group">
              <p className="status-title">Select Your Exam:</p>
              <div className="status-options">
                <label className={`radio-label ${registerData.examType === 'JEE' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="examType" 
                    value="JEE" 
                    checked={registerData.examType === 'JEE'}
                    onChange={handleRegisterChange}
                  />
                  <span>JEE</span>
                </label>
                
                <label className={`radio-label ${registerData.examType === 'NEET' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="examType" 
                    value="NEET"
                    checked={registerData.examType === 'NEET'}
                    onChange={handleRegisterChange}
                  />
                  <span>NEET</span>
                </label>
              </div>
            </div>
            
            <button type="submit" className="signup-btn" disabled={isLoading}>
              {isLoading ? <span className="loading-spinner"></span> : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start your journey with us</p>
              <button type="button" className="ghost-btn" onClick={() => setIsRightPanelActive(false)}>
                Back to Login
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Welcome to StudyBuddy</h1>
              <p>Join thousands of students preparing for JEE & NEET</p>
              <button type="button" className="ghost-btn" onClick={() => setIsRightPanelActive(true)}>
                Create Account
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Notification */}
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

export default Login;