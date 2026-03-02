import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { ThemeProvider } from './hooks/useTheme';
import { LoadingProvider } from './hooks/useLoading';
import { NotificationProvider } from './hooks/useNotifications';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <NotificationProvider>
          <Router>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;