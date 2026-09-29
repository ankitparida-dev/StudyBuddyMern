import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIWidget from '../widget/AIWidget';
import { getToken } from '../../utils/api';
import { useKeyboardShortcuts } from '../../utils/useKeyboardShortcuts';

export default function Layout() {
  const isAuthed = Boolean(getToken());
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Ctrl+K → open AI widget
  useKeyboardShortcuts({
    'ctrl+k': () => {
      const btn = document.querySelector('[title="AI Study Buddy"]');
      btn?.click();
    },
  });

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-sb-bg dark:bg-sb-dark-bg transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-24">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      <AIWidget />
    </div>
  );
}