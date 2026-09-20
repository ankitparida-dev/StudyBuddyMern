import { CheckCircle2, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import PomodoroTimer from '../components/dashboard/PomodoroTimer';
import { storage } from '../utils/storage';

const DEFAULT_TASKS = [
  { id: 1, text: 'Revise Kinematics formulas', done: false },
  { id: 2, text: 'Solve 20 Physics numericals', done: true },
  { id: 3, text: 'Read Organic Chemistry notes', done: false },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(() =>
    storage.get('sb_tasks', DEFAULT_TASKS)
  );

  const [streak, setStreak] = useState(() => {
    const saved = storage.get('sb_streak', { count: 0, lastVisit: null });
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (saved.lastVisit === today) return saved;

    if (saved.lastVisit === yesterday) {
      const updated = { count: saved.count + 1, lastVisit: today };
      storage.set('sb_streak', updated);
      return updated;
    }

    const reset = { count: 1, lastVisit: today };
    storage.set('sb_streak', reset);
    return reset;
  });

  useEffect(() => {
    storage.set('sb_tasks', tasks);
  }, [tasks]);

  const toggle = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <Flame className="text-orange-500" size={40} />
          <div>
            <p className="text-3xl font-bold">
              {streak.count} Day{streak.count !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-500">Current Streak</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <PomodoroTimer />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4">Today's Targets</h3>
          <ul className="space-y-3">
            {tasks.map((t) => (
              <li
                key={t.id}
                onClick={() => toggle(t.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <CheckCircle2
                  className={t.done ? 'text-green-500' : 'text-gray-300'}
                />
                <span className={t.done ? 'line-through text-gray-400' : ''}>
                  {t.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4">Quick Log Session</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Physics', 'Chemistry', 'Math'].map((s) => (
              <button
                key={s}
                className="bg-sb-yellow p-4 rounded-xl font-semibold hover:scale-105 transition"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}