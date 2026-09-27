import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIWidget from '../widget/AIWidget';
import { getToken } from '../../utils/api';

export default function Layout() {
  const isAuthed = Boolean(getToken());
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-sb-bg dark:bg-sb-dark-bg transition-colors">
      <Sidebar />
      <Navbar />
      <main className="ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-24">
        <Outlet />
      </main>
      <AIWidget />
    </div>
  );
}