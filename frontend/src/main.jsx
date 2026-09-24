import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2500,
        style: {
          background: '#fff',
          color: '#1A4D4D',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        success: { iconTheme: { primary: '#4A90E2', secondary: '#fff' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>
);