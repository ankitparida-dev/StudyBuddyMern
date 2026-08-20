import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.css';

// ===== PERFORMANCE MONITORING =====
const reportPerformance = () => {
  if (process.env.NODE_ENV === 'production') {
    // Log performance metrics in production
    const perfData = performance.getEntriesByType('navigation')[0];
    if (perfData) {
      console.debug(
        `🚀 Page Load: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`
      );
    }
  }
};

// ===== ERROR HANDLING =====
const handleGlobalError = (error) => {
  console.error('🔥 Global Error:', error);
  
  // Log to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: send to error tracking service
    // Sentry.captureException(error);
  }
};

// ===== UNHANDLED REJECTION HANDLING =====
const handleUnhandledRejection = (event) => {
  console.error('🔥 Unhandled Promise Rejection:', event.reason);
  
  if (process.env.NODE_ENV === 'production') {
    // Example: send to error tracking service
    // Sentry.captureException(event.reason);
  }
};

// Register global error handlers
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// ===== GET ROOT ELEMENT =====
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element. Please check your HTML.');
}

// ===== CREATE ROOT =====
const root = ReactDOM.createRoot(rootElement);

// ===== RENDER APP =====
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ===== REPORT PERFORMANCE =====
reportPerformance();

// ===== SERVICE WORKER REGISTRATION (Optional) =====
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.debug('📦 Service Worker registered:', registration);
      })
      .catch((error) => {
        console.debug('📦 Service Worker registration failed:', error);
      });
  });
}

// ===== EXPOSE FOR DEBUGGING (Development Only) =====
if (process.env.NODE_ENV === 'development') {
  window.__APP_DEBUG__ = {
    root,
    App,
    version: '1.0.0',
  };
}