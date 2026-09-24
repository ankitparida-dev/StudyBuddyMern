import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { storage } from '../../utils/storage';

export default function Navbar() {
  const navigate = useNavigate();
  const user = storage.get('sb_user', { name: 'Student' });

  const logout = () => {
    storage.remove('sb_authed');
    storage.remove('sb_token');
    storage.remove('sb_user');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 ml-64">
      <h2 className="text-lg font-semibold">
        Welcome back, {user.name} 👋
      </h2>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-sb-pink flex items-center justify-center font-bold">
          {user.name?.[0]?.toUpperCase() || 'S'}
        </div>
        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-500 transition"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}