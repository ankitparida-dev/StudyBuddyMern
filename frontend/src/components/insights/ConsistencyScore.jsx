import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';

const getScoreColor = (score) => {
  if (score >= 80) return { ring: '#10B981', label: 'Excellent' };
  if (score >= 60) return { ring: '#4A90E2', label: 'Good' };
  if (score >= 40) return { ring: '#F5D547', label: 'Fair' };
  return { ring: '#EF4444', label: 'Needs work' };
};

export default function ConsistencyScore({ streak = 0, activeDays = 0, totalDays = 30 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Calculate score
  // - 40% streak
  // - 60% active days ratio
  const streakScore = Math.min(100, (streak / 30) * 100);
  const daysScore = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;
  const score = Math.round(streakScore * 0.4 + daysScore * 0.6);

  const { ring, label } = getScoreColor(score);

  // Animate the score on mount
  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score]);

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference * (1 - animatedScore / 100);

  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6">
      <div className="mb-4">
        <h3 className="font-semibold dark:text-sb-dark-text">
          🏆 Consistency Score
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          How regularly you study — not just how much
        </p>
      </div>

      <div className="flex items-center justify-center my-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className="text-gray-100 dark:text-sb-dark-border"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={ring}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold" style={{ color: ring }}>
              {animatedScore}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">/ 100</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-3">
        <p
          className="text-sm font-bold"
          style={{ color: ring }}
        >
          {label}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-50 dark:bg-sb-dark-bg rounded-lg p-2 text-center">
          <p className="text-gray-500 dark:text-gray-400">Streak</p>
          <p className="font-bold dark:text-sb-dark-text">{streak} days</p>
        </div>
        <div className="bg-gray-50 dark:bg-sb-dark-bg rounded-lg p-2 text-center">
          <p className="text-gray-500 dark:text-gray-400">Active days</p>
          <p className="font-bold dark:text-sb-dark-text">
            {activeDays}/{totalDays}
          </p>
        </div>
      </div>
    </div>
  );
}