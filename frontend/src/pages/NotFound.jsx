import { Link } from 'react-router-dom';
import { Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sb-blue to-sb-teal flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-7xl font-bold text-sb-blue mb-2">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-sb-blue text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            <Home size={18} /> Dashboard
          </Link>
          <Link
            to="/syllabus"
            className="flex-1 flex items-center justify-center gap-2 border border-sb-blue text-sb-blue py-3 rounded-xl font-semibold hover:bg-sb-blue/10 transition"
          >
            <BookOpen size={18} /> Syllabus
          </Link>
        </div>
      </div>
    </div>
  );
}