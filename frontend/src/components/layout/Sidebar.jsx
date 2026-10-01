import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, TrendingUp, BarChart3, X,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/syllabus', label: 'Syllabus', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="StudyBuddy Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1 className="text-xl font-bold text-sb-blue">StudyBuddy</h1>
        </div>
        {/* Close button only on mobile */}
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-gray-700 dark:text-gray-300"
          title="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? 'bg-sb-blue text-white'
                  : 'hover:bg-sb-bg dark:hover:bg-sb-dark-border dark:text-sb-dark-text'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Desktop fixed sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-sb-dark-card h-screen p-4 shadow-md fixed left-0 top-0 flex-col transition-colors">
        {content}
      </aside>

      {/* Mobile sliding drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-72 bg-white dark:bg-sb-dark-card p-4 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
}