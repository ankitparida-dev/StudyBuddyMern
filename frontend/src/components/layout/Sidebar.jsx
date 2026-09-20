import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/syllabus', label: 'Syllabus', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen p-4 shadow-md fixed left-0 top-0">
      <div className="flex items-center gap-3 mb-8">
  <img
    src="/logo.png"
    alt="StudyBuddy Logo"
    className="w-10 h-10 rounded-full object-cover"
  />
  <h1 className="text-xl font-bold text-sb-blue">StudyBuddy</h1>
</div>
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive ? 'bg-sb-blue text-white' : 'hover:bg-sb-bg'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}