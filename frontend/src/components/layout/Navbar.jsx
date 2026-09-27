import { useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { storage } from '../../utils/storage';
import { useTheme } from '../../utils/useTheme';

export default function Navbar() {
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
      <h2 className="text-base md:text-lg font-semibold dark:text-sb-dark-text truncate">
        Welcome back, {user.name} 👋
      </h2>

      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={toggle}
          className="text-gray-500 hover:text-sb-blue dark:text-gray-300 dark:hover:text-sb-yellow transition"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-sb-pink flex items-center justify-center font-bold text-sm">
          {user.name?.[0]?.toUpperCase() || 'S'}
        </div>

        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}