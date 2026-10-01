import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';
import { createUserWithEmailAndPassword, reload, sendEmailVerification, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { firebaseAuth, firebaseConfigured } from '../config/firebase';
import { authApi, learningApi } from '../utils/api';
import { getExamCurriculum } from '../data/mockData';
import { storage } from '../utils/storage';
import { usePageTitle } from '../utils/usePageTitle';

export default function AuthPage() {
  usePageTitle('Login');

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
      if (!firebaseConfigured || !firebaseAuth) {
        throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to frontend/.env.local.');
      }
      const normalizedEmail = email.trim().toLowerCase();
      let credential;
      if (!isLogin) {
        if (name.trim().length < 2) throw new Error('Enter your full name.');
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          throw new Error('Password must be 8+ characters with uppercase, lowercase, number, and special character.');
        }
        credential = await createUserWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
        await updateProfile(credential.user, { displayName: name.trim() });
        await sendEmailVerification(credential.user);
        storage.set('sb_pending_profile', {
          currentGrade: `Class ${cls}`,
          examType: target,
        });
        await signOut(firebaseAuth);
        setIsLogin(true);
        setPassword('');
        toast.success('Verification email sent. Verify your email, then log in to link your account.');
        return;
      }

      credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
      await reload(credential.user);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(firebaseAuth);
        throw new Error('Your email is not verified yet. Check your inbox for the verification link, then log in again. We sent a new link.');
      }

      const token = await credential.user.getIdToken(true);
      const pendingProfile = storage.get('sb_pending_profile', {});
      const res = await authApi.firebaseSession(token, {
        name: credential.user.displayName || '',
        currentGrade: pendingProfile.currentGrade || `Class ${cls}`,
        examType: pendingProfile.examType || target,
      });
      const curriculum = getExamCurriculum(res.user.examType, res.user.currentGrade);
      await learningApi.seedTopics(curriculum);
      const user = res.user;
      storage.set('sb_user', user);
      storage.remove('sb_pending_profile');

      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      const firebaseHelp = {
        'auth/configuration-not-found': 'Firebase Auth configuration was not found. In Firebase Console, enable Authentication, turn on Email/Password, verify these web config values belong to the same project, and add localhost to Authorized domains. Restart Vite after changes.',
        'auth/operation-not-allowed': 'Email/Password sign-in is disabled. Enable it in Firebase Console under Authentication > Sign-in method.',
        'auth/invalid-api-key': 'Firebase API key is invalid. Copy the Web app config from the same Firebase project used by the backend service account.',
        'auth/unauthorized-domain': 'This site domain is not authorized. Add localhost or your deployed domain under Firebase Authentication > Settings > Authorized domains.',
        'auth/user-not-found': 'No Firebase account exists for this email yet. Register this account with Firebase first.',
      };
      toast.error(firebaseHelp[err.code] || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
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
              minLength={isLogin ? undefined : 8}
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
    </PageTransition>
  );
}