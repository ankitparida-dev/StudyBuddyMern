import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { authApi } from '../utils/api';
import { storage } from '../utils/storage';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('JEE');
  const [cls, setCls] = useState('11');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = isLogin
        ? { email, password }
        : { name, email, password, target, class: cls };

      const res = isLogin
        ? await authApi.login(payload)
        : await authApi.register(payload);

      // Backend returns: { success, user, token } (or similar — adjust if needed)
      const user = res.user || res;
      const token = res.token;

      if (token) storage.set('sb_token', token);
      storage.set('sb_user', user);
      storage.set('sb_authed', true);

      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sb-blue to-sb-teal p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="StudyBuddy Logo"
            className="w-24 h-24 rounded-full object-cover shadow-md mb-3"
          />
          <h1 className="text-3xl font-bold text-sb-blue">StudyBuddy</h1>
          <p className="text-center text-gray-500 mt-1">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue"
            required
          />

          {!isLogin && (
            <>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full p-3 border rounded-xl outline-none"
              >
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
              </select>
              <div className="flex gap-4">
                {['11', '12'].map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="class"
                      value={c}
                      checked={cls === c}
                      onChange={(e) => setCls(e.target.value)}
                    />
                    Class {c}
                  </label>
                ))}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sb-blue text-white p-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sb-blue font-semibold"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}