import React, { useEffect, useRef, useState } from 'react';
import PomodoroTimer from '../components/studytools/PomodoroTimer';
import DailyGoals from '../components/studytools/DailyGoals';
import FocusMode from '../components/studytools/FocusMode';
import StudyAnalytics from '../components/studytools/StudyAnalytics';
import QuickSessions from '../components/studytools/QuickSessions';
import SmartBreaks from '../components/studytools/SmartBreaks';
import ChatAssistant from '../components/chat/ChatAssistant';
import Loader from '../components/common/Loader';
import '../styles/StudyTools.css';

const StudyTools = () => {
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check API connection
    const checkApi = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setApiError(true);
          setLoading(false);
          return;
        }
        
        // ✅ FIX: Use environment variable
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
        const res = await fetch(`${API_URL}/study/goals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) setApiError(true);
      } catch {
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };

    checkApi();
  }, []);

  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      document.querySelectorAll('.tools-grid, .tool-card').forEach(el => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="page-loader">
        <Loader size="large" text="Loading study tools..." />
      </div>
    );
  }

  return (
    <div className="studytools-page">
      {apiError && (
        <div className="demo-data-badge">
          ⚡ Using Demo Data (Backend not connected)
        </div>
      )}

      <section className="study-tools-section">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">Study Tools & Time Management</h1>
            <p className="page-subtitle">
              Maximize your productivity with AI-powered study tools and smart time management features
            </p>
          </div>

          <div className="tools-grid">
            <PomodoroTimer ref={timerRef} />
            <DailyGoals />
            <FocusMode />
            <StudyAnalytics />
            <QuickSessions />
            <SmartBreaks />
          </div>
        </div>

        <iframe
          id="lofi-player"
          width="0"
          height="0"
          src="https://www.youtube.com/embed/n61ULEU7CO0?start=0&loop=1&playlist=n61ULEU7CO0"
          frameBorder="0"
          allow="autoplay"
          allowFullScreen
          title="lofi music"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />
      </section>

      <ChatAssistant />
    </div>
  );
};

export default StudyTools;