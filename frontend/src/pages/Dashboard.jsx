import {
  CheckCircle2,
  Flame,
  Clock,
  Plus,
  X,
  Trophy,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PomodoroTimer from '../components/dashboard/PomodoroTimer';
import LogSessionModal from '../components/dashboard/LogSessionModal';
import { learningApi, dashboardApi } from '../utils/api';

const SUBJECT_COLORS = {
  physics: 'bg-blue-100 text-blue-700',
  chemistry: 'bg-purple-100 text-purple-700',
  math: 'bg-orange-100 text-orange-700',
  biology: 'bg-green-100 text-green-700',
  general: 'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ count: 0 });
  const [todayMinutes, setTodayMinutes] = useState(0);

  const [newTask, setNewTask] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('general');
  const [addingTask, setAddingTask] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubject, setModalSubject] = useState('Physics');

  // ============================================
  // Fetch all dashboard data
  // ============================================
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tasksRes, streakRes, statsRes] = await Promise.all([
        learningApi.tasks(),
        dashboardApi.streaks().catch(() => ({ currentStreak: 0 })),
        dashboardApi.stats().catch(() => null),
      ]);

      setTasks(tasksRes.tasks || []);
      setStreak({ count: streakRes.currentStreak || 0 });
      if (statsRes?.today) setTodayMinutes(statsRes.today.minutes || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ============================================
  // Toggle task complete (optimistic)
  // ============================================
  const toggle = async (task) => {
    const nextCompleted = !task.completed;
    const next = {
      ...task,
      completed: nextCompleted,
      progress: nextCompleted ? 100 : 0,
    };

    // Optimistic update
    setTasks((curr) => curr.map((t) => (t._id === task._id ? next : t)));

    try {
      const { task: updated } = await learningApi.updateTask(task._id, {
        progress: next.progress,
      });
      setTasks((curr) =>
        curr.map((t) => (t._id === updated._id ? updated : t))
      );
    } catch (err) {
      // Revert on failure
      setTasks((curr) => curr.map((t) => (t._id === task._id ? task : t)));
      toast.error('Failed to update task');
    }
  };

  // ============================================
  // Add task
  // ============================================
  const addTask = async (e) => {
    e.preventDefault();
    const title = newTask.trim();
    if (title.length < 3) {
      toast.error('Task title must be at least 3 characters');
      return;
    }

    setAddingTask(true);
    try {
      const { task } = await learningApi.createTask({
        title,
        subject: newTaskSubject,
        priority: 'medium',
        type: 'daily',
        progress: 0,
      });
      setTasks((curr) => [...curr, task]);
      setNewTask('');
      setNewTaskSubject('general');
      toast.success('Task added ✅');
    } catch (err) {
      toast.error(err.message || 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  // ============================================
  // Delete task (optimistic)
  // ============================================
  const deleteTask = async (id) => {
    const backup = tasks;
    setTasks((curr) => curr.filter((t) => t._id !== id));
    try {
      await learningApi.deleteTask(id);
      toast.success('Task removed');
    } catch (err) {
      setTasks(backup);
      toast.error('Failed to delete task');
    }
  };

  // ============================================
  // Session logging
  // ============================================
  const openLogModal = (subject) => {
    setModalSubject(subject);
    setModalOpen(true);
  };

  const handleSaveSession = async (data) => {
    try {
      await learningApi.logSession({
        subject: data.subject.toLowerCase(),
        topic: 'Quick log session',
        duration: Math.round(data.hours * 60),
        sessionType: 'study',
        date: data.date,
      });
      toast.success(`Logged ${data.hours}h of ${data.subject} 🎯`);
      fetchAll(); // refresh stats
    } catch (err) {
      toast.error(err.message || 'Failed to log session');
    }
  };

  // ============================================
  // Derived values
  // ============================================
  const allDone = tasks.length > 0 && tasks.every((t) => t.completed);
  const todayHours = (todayMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* Top row: Streak + Hours + Timer              */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <Flame className="text-orange-500" size={40} />
          <div>
            <p className="text-3xl font-bold">
              {streak.count} Day{streak.count !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-500">Current Streak</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <Clock className="text-sb-blue" size={40} />
          <div>
            <p className="text-3xl font-bold">{todayHours}h</p>
            <p className="text-sm text-gray-500">Studied Today</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <PomodoroTimer />
        </div>
      </div>

      {/* ============================================ */}
      {/* Second row: Tasks + Quick Log                */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* -------------- Tasks -------------- */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Today's Targets</h3>
            {allDone && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Trophy size={16} /> All done!
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No tasks yet.</p>
              <p className="text-sm mt-1">Add your first one below!</p>
            </div>
          ) : (
            <ul className="space-y-3 mb-4">
              {tasks.map((t) => (
                <li key={t._id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggle(t)}
                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                  >
                    <CheckCircle2
                      className={`shrink-0 ${
                        t.completed ? 'text-green-500' : 'text-gray-300'
                      }`}
                      size={20}
                    />
                    <span
                      className={`flex-1 truncate ${
                        t.completed ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {t.title}
                    </span>
                  </button>

                  {t.subject && t.subject !== 'general' && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        SUBJECT_COLORS[t.subject] || SUBJECT_COLORS.general
                      }`}
                    >
                      {t.subject}
                    </span>
                  )}

                  <button
                    onClick={() => deleteTask(t._id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition shrink-0"
                    title="Delete task"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Add task form */}
          <form
            onSubmit={addTask}
            className="flex gap-2 mt-4 flex-wrap"
          >
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 min-w-[140px] p-3 border rounded-xl outline-none focus:border-sb-blue text-sm"
              disabled={addingTask}
              maxLength={200}
            />
            <select
              value={newTaskSubject}
              onChange={(e) => setNewTaskSubject(e.target.value)}
              disabled={addingTask}
              className="p-3 border rounded-xl outline-none focus:border-sb-blue text-sm bg-white"
            >
              <option value="general">General</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="math">Math</option>
              <option value="biology">Biology</option>
            </select>
            <button
              type="submit"
              disabled={addingTask}
              className="bg-sb-blue text-white px-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
            >
              {addingTask ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
            </button>
          </form>
        </div>

        {/* -------------- Quick Log -------------- */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4">Quick Log Session</h3>
          <div className="grid grid-cols-3 gap-3">
            {['Physics', 'Chemistry', 'Mathematics'].map((s) => (
              <button
                key={s}
                onClick={() => openLogModal(s)}
                className="bg-sb-yellow p-4 rounded-xl font-semibold hover:scale-105 transition"
              >
                + {s}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Or click below to log any session
          </p>
          <button
            onClick={() => openLogModal('Physics')}
            className="w-full mt-2 py-3 rounded-xl border border-sb-blue text-sb-blue font-semibold hover:bg-sb-blue/10 transition"
          >
            Custom Session
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* Modal                                       */}
      {/* ============================================ */}
      <LogSessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSession}
        defaultSubject={modalSubject}
      />
    </div>
  );
}