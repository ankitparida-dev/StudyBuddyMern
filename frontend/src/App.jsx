import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import { ThemeProvider } from './hooks/useTheme';
import { LoadingProvider, useLoading } from './hooks/useLoading';
import { NotificationProvider } from './hooks/useNotifications';
import LoadingScreen from './components/common/LoadingScreen';
import Loader from './components/common/Loader';
import './styles/App.css';

// Lazy load components with proper error boundaries
const Header = lazy(() => import('./components/common/Header'));
const Footer = lazy(() => import('./components/common/Footer'));
const ChatAssistant = lazy(() => import('./components/chat/ChatAssistant'));

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StudyTools = lazy(() => import('./pages/StudyTools'));
const Features = lazy(() => import('./pages/Features'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/404page'));

// Page loading fallbacks
const pageLoaders = {
  home: <Loader size="large" text="Loading home page..." />,
  login: <Loader size="large" text="Loading login..." />,
  dashboard: <Loader size="large" text="Loading dashboard..." />,
  studyTools: <Loader size="large" text="Loading study tools..." />,
  features: <Loader size="large" text="Loading features..." />,
  settings: <Loader size="large" text="Loading settings..." />,
  notFound: <Loader size="medium" text="Loading..." />,
};

// ===== LAYOUT COMPONENT =====
function Layout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app">
      <ScrollToTop />
      
      {/* Show header on all pages except auth pages */}
      {!isAuthPage && (
        <Suspense fallback={<div className="header-loader" />}>
          <Header />
        </Suspense>
      )}
      
      <main className={`main-content ${isLoginPage ? 'login-page-content' : ''}`}>
        <div className="content-wrapper">
          <ErrorBoundary>
            <Suspense fallback={pageLoaders.home}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      
      {/* Show footer and chat on all pages except auth pages */}
      {!isAuthPage && (
        <>
          <Suspense fallback={<div className="footer-loader" />}>
            <Footer />
          </Suspense>
          <Suspense fallback={null}>
            <ChatAssistant />
          </Suspense>
        </>
      )}
    </div>
  );
}

// ===== AUTH GUARD COMPONENT =====
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// ===== PUBLIC ROUTE COMPONENT =====
function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// ===== APP CONTENT =====
function AppContent() {
  const { isLoading, loadingProgress } = useLoading();

  useEffect(() => {
    // Handle body class for loading state
    if (isLoading) {
      document.body.classList.add('loading-active');
    } else {
      document.body.classList.remove('loading-active');
    }
    
    return () => {
      document.body.classList.remove('loading-active');
    };
  }, [isLoading]);

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/study-tools" 
          element={
            <ProtectedRoute>
              <StudyTools />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/features" 
          element={
            <ProtectedRoute>
              <Features />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

// ===== MAIN APP =====
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