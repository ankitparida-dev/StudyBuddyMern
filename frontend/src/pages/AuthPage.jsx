import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('JEE');
  const [cls, setCls] = useState('11');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = {
      name: isLogin ? email.split('@')[0] : name,
      email,
      target: isLogin ? 'JEE' : target,
      class: isLogin ? '11' : cls,
      joinedAt: Date.now(),
    };

    storage.set('sb_user', user);
    storage.set('sb_authed', true);
    navigate('/dashboard');
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
            className="w-full bg-sb-blue text-white p-3 rounded-xl font-semibold hover:opacity-90"
          >
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