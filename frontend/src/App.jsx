import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import loadable from '@loadable/component';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ChatAssistant from './components/chat/ChatAssistant';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loader from './components/common/Loader';
import ScrollToTop from './components/common/ScrollToTop';
import { ThemeProvider } from './hooks/useTheme';
import { LoadingProvider, useLoading } from './hooks/useLoading';
import { NotificationProvider } from './hooks/useNotifications';
import LoadingScreen from './components/common/LoadingScreen';
import './styles/App.css';

// Lazy load pages
const Home = loadable(() => import('./pages/Home'), { 
  fallback: <Loader size="large" text="Loading home..." /> 
});

const Login = loadable(() => import('./pages/Login'), { 
  fallback: <Loader size="large" text="Loading login..." /> 
});

const Dashboard = loadable(() => import('./pages/Dashboard'), { 
  fallback: <Loader size="large" text="Loading dashboard..." /> 
});

const StudyTools = loadable(() => import('./pages/StudyTools'), { 
  fallback: <Loader size="large" text="Loading study tools..." /> 
});

const Features = loadable(() => import('./pages/Features'), { 
  fallback: <Loader size="large" text="Loading features..." /> 
});

const Settings = loadable(() => import('./pages/Settings'), { 
  fallback: <Loader size="large" text="Loading settings..." /> 
});

const NotFound = loadable(() => import('./pages/404page'), { 
  fallback: <Loader size="medium" text="..." /> 
});

function Layout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  // REMOVED the forceScrollbar function entirely
  
  return (
    <div className="app">
      <ScrollToTop />
      {!isLoginPage && <Header />}
      <main className={`main-content ${isLoginPage ? 'login-page-content' : ''}`}>
        <div className="content-wrapper">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
      {!isLoginPage && <Footer />}
      {!isLoginPage && <ChatAssistant />}
    </div>
  );
}

// AppContent handles loading state
function AppContent() {
  const { isLoading } = useLoading();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/study-tools" element={<StudyTools />} />
        <Route path="/features" element={<Features />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;