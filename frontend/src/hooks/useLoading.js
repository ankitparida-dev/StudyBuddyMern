import React, { createContext, useState, useContext, useEffect } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Prevent body scrolling when loading screen is active
  useEffect(() => {
    if (isLoading) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add class to body for CSS targeting
      document.body.classList.add('loading-active');
      
      // Disable scrolling on BOTH html and body
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Also prevent any margin/padding that might cause scroll
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    } else {
      // Remove class from body
      document.body.classList.remove('loading-active');
      
      // Re-enable scrolling and restore scroll position
      const scrollY = document.body.style.top;
      
      // Restore html element
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      
      // Restore body
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('loading-active');
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, [isLoading]);

  // Progress animation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // ✅ FIXED: Auto-complete loading when progress reaches 100%
  useEffect(() => {
    if (progress === 100 && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [progress, isLoading]);

  const completeLoading = () => {
    setProgress(100);
  };

  return React.createElement(
    LoadingContext.Provider,
    { value: { isLoading, progress, completeLoading } },
    children
  );
};