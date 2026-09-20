import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { AMBIENT_SOUNDS, ALARM_URL } from '../../utils/sounds';
import { storage } from '../../utils/storage';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [seconds, setSeconds] = useState(FOCUS_TIME);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(null);
  const [sessions, setSessions] = useState(
    () => storage.get('sb_sessions', 0)
  );

  const audioRef = useRef(null);
  const alarmRef = useRef(null);

  // ask notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // countdown
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // ambient sound
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (sound) {
      const audio = new Audio(AMBIENT_SOUNDS[sound]);
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch((e) => console.warn('Audio blocked:', e));
      audioRef.current = audio;
    }
    return () => audioRef.current?.pause();
  }, [sound]);

  const handleComplete = () => {
    setRunning(false);

    // play alarm
    alarmRef.current = new Audio(ALARM_URL);
    alarmRef.current.play().catch(() => {});

    // browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        mode === 'focus' ? '✅ Focus session done!' : '☕ Break over!',
        {
          body:
            mode === 'focus'
              ? 'Take a 5-minute break.'
              : 'Time to get back to studying.',
          icon: '/logo.png',
        }
      );
    }

    if (mode === 'focus') {
      const newCount = sessions + 1;
      setSessions(newCount);
      storage.set('sb_sessions', newCount);
      setMode('break');
      setSeconds(BREAK_TIME);
    } else {
      setMode('focus');
      setSeconds(FOCUS_TIME);
    }
  };

  const reset = () => {
    setRunning(false);
    setSeconds(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (m) => {
    setMode(m);
    setRunning(false);
    setSeconds(m === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  const progress = mode === 'focus'
    ? ((FOCUS_TIME - seconds) / FOCUS_TIME) * 100
    : ((BREAK_TIME - seconds) / BREAK_TIME) * 100;

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => switchMode('focus')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition ${
            mode === 'focus'
              ? 'bg-sb-blue text-white'
              : 'bg-sb-bg text-gray-600'
          }`}
        >
          <Zap size={16} /> Focus
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition ${
            mode === 'break'
              ? 'bg-sb-yellow text-sb-teal'
              : 'bg-sb-bg text-gray-600'
          }`}
        >
          <Coffee size={16} /> Break
        </button>
      </div>

      {/* Circular progress + time */}
      <div className="flex justify-center my-4">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E8F4F8"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={mode === 'focus' ? '#4A90E2' : '#F5D547'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-sb-blue">
              {min}:{sec}
            </div>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
              {mode === 'focus' ? 'Focus' : 'Break'}
            </p>
          </div>
        </div>
      </div>

      {/* Session counter */}
      <p className="text-center text-sm text-gray-500 mb-3">
        🎯 <strong>{sessions}</strong> focus session{sessions !== 1 ? 's' : ''}{' '}
        completed today
      </p>

      {/* Controls */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => setRunning(!running)}
          className="bg-sb-blue text-white p-3 rounded-full hover:opacity-90 transition"
        >
          {running ? <Pause /> : <Play />}
        </button>
        <button
          onClick={reset}
          className="bg-sb-pink text-white p-3 rounded-full hover:opacity-90 transition"
        >
          <RotateCcw />
        </button>
      </div>

      {/* Ambient sounds */}
      <div className="flex gap-2 justify-center">
        {Object.keys(AMBIENT_SOUNDS).map((s) => (
          <button
            key={s}
            onClick={() => setSound(sound === s ? null : s)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              sound === s ? 'bg-sb-yellow' : 'bg-sb-bg'
            }`}
          >
            {s} {sound === s && '🔊'}
          </button>
        ))}
      </div>
    </div>
  );
}