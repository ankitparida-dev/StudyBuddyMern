import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIWidget from '../widget/AIWidget';
import { storage } from '../../utils/storage';

export default function Layout() {
  const isAuthed = storage.get('sb_authed', false);

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Navbar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
      <AIWidget />
    </div>
  );
}