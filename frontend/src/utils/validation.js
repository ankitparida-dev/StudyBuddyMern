export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

export const validateName = (name) => {
  return name.trim().length >= 2 && name.trim().length <= 50 && /^[a-zA-Z\s]+$/.test(name.trim());
};

export const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,10}$/;
  return re.test(phone);
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegisterForm = (data) => {
  const errors = {};
  
  if (!data.firstName) {
    errors.firstName = 'First name is required';
  } else if (!validateName(data.firstName)) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  
  if (!data.lastName) {
    errors.lastName = 'Last name is required';
  } else if (!validateName(data.lastName)) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(data.password)) {
    errors.password = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
  }
  
  if (!data.currentGrade) {
    errors.currentGrade = 'Please select your grade';
  }
  
  if (!data.examType) {
    errors.examType = 'Please select your exam type';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};