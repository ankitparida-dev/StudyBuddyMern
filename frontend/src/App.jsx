import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { ThemeProvider } from './hooks/useTheme';
import { LoadingProvider } from './hooks/useLoading';
import { NotificationProvider } from './hooks/useNotifications';
import './styles/App.css';

function Layout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  return (
    <div className="app">
      {!isLoginPage && <Header />}
      <main className={`main-content ${isLoginPage ? 'login-page-content' : ''}`}>
        {children}
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;