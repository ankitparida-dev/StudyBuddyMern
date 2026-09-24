import { CheckCircle2, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import PomodoroTimer from '../components/dashboard/PomodoroTimer';
import { storage } from '../utils/storage';
import { learningApi } from '../utils/api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [taskError, setTaskError] = useState('');

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
    learningApi.tasks()
      .then(({ tasks: serverTasks }) => setTasks(serverTasks))
      .catch((error) => setTaskError(error.message));
  }, []);

  const toggle = async (task) => {
    try {
      const progress = task.completed ? 0 : 100;
      const { task: updated } = await learningApi.updateTask(task._id, {
        progress,
        completed: progress === 100,
      });
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (error) {
      setTaskError(error.message);
    }
  };

  const logQuickSession = async (subject) => {
    try {
      await learningApi.logSession({
        subject: subject.toLowerCase(),
        topic: 'Quick log session',
        duration: 25,
        sessionType: 'study',
      });
    } catch (error) {
      setTaskError(error.message);
    }
  };

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
                key={t._id}
                onClick={() => toggle(t)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <CheckCircle2
                  className={t.completed ? 'text-green-500' : 'text-gray-300'}
                />
                <span className={t.completed ? 'line-through text-gray-400' : ''}>
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
          {taskError && <p className="text-sm text-red-600 mt-3">{taskError}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4">Quick Log Session</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Physics', 'Chemistry', 'Math'].map((s) => (
              <button
                key={s}
                onClick={() => logQuickSession(s)}
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