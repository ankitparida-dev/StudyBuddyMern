import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';

export default function SharedTimer({ timerState, onToggle, onReset, onSwitchMode }) {
  const { mode, secondsLeft, running } = timerState;
  const min = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const sec = String(secondsLeft % 60).padStart(2, '0');

  const total = mode === 'focus' ? 25 * 60 : 5 * 60;
  const progress = ((total - secondsLeft) / total) * 100;

  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-6">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onSwitchMode('focus')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition ${
            mode === 'focus'
              ? 'bg-sb-blue text-white'
              : 'bg-sb-bg dark:bg-sb-dark-bg text-gray-600 dark:text-sb-dark-text'
          }`}
        >
          <Zap size={14} /> Focus
        </button>
        <button
          onClick={() => onSwitchMode('break')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition ${
            mode === 'break'
              ? 'bg-sb-yellow text-sb-teal'
              : 'bg-sb-bg dark:bg-sb-dark-bg text-gray-600 dark:text-sb-dark-text'
          }`}
        >
          <Coffee size={14} /> Break
        </button>
      </div>

      {/* Ring */}
      <div className="flex justify-center my-4">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className="text-sb-bg dark:text-sb-dark-border"
              strokeWidth="7"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={mode === 'focus' ? '#4A90E2' : '#F5D547'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-sb-blue">
              {min}:{sec}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
              {mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={onToggle}
          className="bg-sb-blue text-white p-3 rounded-full hover:opacity-90 transition"
        >
          {running ? <Pause /> : <Play />}
        </button>
        <button
          onClick={onReset}
          className="bg-sb-pink text-white p-3 rounded-full hover:opacity-90 transition"
        >
          <RotateCcw />
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
        Everyone in the room sees the same timer ⏱️
      </p>
    </div>
  );
}