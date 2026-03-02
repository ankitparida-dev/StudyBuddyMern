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

  const completeLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, progress, completeLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};