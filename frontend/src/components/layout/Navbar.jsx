import { useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import { storage } from '../../utils/storage';
import { useTheme } from '../../utils/useTheme';

export default function Navbar({ onMenuClick = () => {} }) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const user = storage.get('sb_user', { name: 'Student' });

  const logout = () => {
    storage.remove('sb_authed');
    storage.remove('sb_user');
    storage.remove('sb_token');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white dark:bg-sb-dark-card shadow-sm flex items-center justify-between px-4 md:px-8 z-30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-600 dark:text-sb-dark-text p-1"
          title="Open menu"
        >
          <Menu size={22} />
        </button>

        <h2 className="text-sm md:text-lg font-semibold dark:text-sb-dark-text truncate">
          Welcome back, {user.name} 👋
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button
          onClick={toggle}
          className="text-gray-500 hover:text-sb-blue dark:text-gray-300 dark:hover:text-sb-yellow transition p-1"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-sb-pink flex items-center justify-center font-bold text-sm shrink-0">
          {user.name?.[0]?.toUpperCase() || 'S'}
        </div>

        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition p-1"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}