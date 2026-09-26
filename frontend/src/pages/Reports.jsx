import { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  BookOpen, Clock, Trophy, Sparkles, Activity, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { learningApi, dashboardApi } from '../utils/api';

const PIE_COLORS = ['#4A90E2', '#F5D547', '#E5E7EB']; // Completed / In Progress / Not Started
const SUBJECT_COLORS = {
  physics: '#4A90E2',
  chemistry: '#A78BFA',
  math: '#FB923C',
  biology: '#4ADE80',
  general: '#94A3B8',
};

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const formatDuration = (mins) => {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};

export default function Reports() {
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [topicsRes, statsRes, streaksRes, subjectsRes, recentRes] =
          await Promise.all([
            learningApi.topics().catch(() => ({ topics: [] })),
            dashboardApi.stats().catch(() => null),
            dashboardApi.streaks().catch(() => null),
            dashboardApi.subjectPerformance().catch(() => ({ subjects: {} })),
            dashboardApi.recentActivity().catch(() => ({ sessions: [] })),
          ]);

        setTopics(topicsRes.topics || []);
        setStats(statsRes);
        setStreaks(streaksRes);
        // subjects comes as object: { physics: 120, chemistry: 60 }
        const subjectObj = subjectsRes.subjects || {};
        setSubjects(
          Object.entries(subjectObj).map(([name, minutes]) => ({
            name,
            minutes,
          }))
        );
        setRecent(recentRes.sessions || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---- Syllabus completion breakdown ----
  const syllabusStats = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    topics.forEach((t) => {
      if (t.progress >= 100) completed += 1;
      else if (t.progress > 0) inProgress += 1;
      else notStarted += 1;
    });
    const total = topics.length || 1;
    return {
      total: topics.length,
      completed,
      inProgress,
      notStarted,
      completedPct: Math.round((completed / total) * 100),
      data: [
        { name: 'Completed', value: completed },
        { name: 'In Progress', value: inProgress },
        { name: 'Not Started', value: notStarted },
      ],
    };
  }, [topics]);

  // ---- Subject-wise stats for cards ----
  const subjectCards = useMemo(() => {
    const groups = {};
    topics.forEach((t) => {
      const key = t.subject || 'other';
      if (!groups[key]) {
        groups[key] = { total: 0, completed: 0, minutes: 0 };
      }
      groups[key].total += 1;
      if (t.progress >= 100) groups[key].completed += 1;
    });
    subjects.forEach((s) => {
      if (!groups[s.name]) groups[s.name] = { total: 0, completed: 0, minutes: 0 };
      groups[s.name].minutes = s.minutes;
    });

    return Object.entries(groups)
      .filter(([key]) => key !== 'other')
      .map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
        minutes: data.minutes,
        pct: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }));
  }, [topics, subjects]);

  // ---- AI insight (local logic) ----
  const aiInsight = useMemo(() => {
    if (topics.length === 0) return null;

    // Find subject with most not-started
    const weakest = [...subjectCards].sort(
      (a, b) => a.pct - b.pct
    )[0];

    // Find subject with most time spent
    const mostStudied = [...subjectCards].sort(
      (a, b) => b.minutes - a.minutes
    )[0];

    if (!weakest) return null;

    if (weakest.pct < 30) {
      return `${capitalize(weakest.name)} syllabus is only ${weakest.pct}% complete. ${
        mostStudied && mostStudied.name !== weakest.name
          ? `You've spent most time on ${capitalize(mostStudied.name)} — try balancing your effort.`
          : 'Consider adding focused sessions this week.'
      }`;
    }

    if (syllabusStats.completedPct >= 80) {
      return `Great progress! You've completed ${syllabusStats.completedPct}% of your syllabus. Focus on revision and mock tests now.`;
    }

    return `Keep going — ${syllabusStats.completedPct}% completed. Prioritize ${
      weakest.name
    } next (${weakest.pct}% done).`;
  }, [subjectCards, syllabusStats, topics.length]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-2xl shadow animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl shadow animate-pulse" />
          <div className="h-80 bg-white rounded-2xl shadow animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============ TOP STATS ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="text-sb-blue" size={24} />}
          label="Total Hours"
          value={`${stats?.total?.hours ?? 0}h`}
        />
        <StatCard
          icon={<BookOpen className="text-purple-500" size={24} />}
          label="Sessions"
          value={stats?.total?.sessions ?? 0}
        />
        <StatCard
          icon={<Trophy className="text-green-500" size={24} />}
          label="Completed Topics"
          value={`${syllabusStats.completed}/${syllabusStats.total}`}
        />
        <StatCard
          icon={<TrendingUp className="text-orange-500" size={24} />}
          label="Current Streak"
          value={`${streaks?.currentStreak ?? 0} d`}
        />
      </div>

      {/* ============ PIE + SUBJECT BARS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4">Syllabus Completion</h3>
          {syllabusStats.total === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No syllabus topics yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={syllabusStats.data.filter((d) => d.value > 0)}
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {syllabusStats.data.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex justify-center gap-4 mt-2 text-xs">
                {syllabusStats.data.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ background: PIE_COLORS[i] }}
                    />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 mt-3">
                {syllabusStats.completedPct}% of syllabus completed
              </p>
            </>
          )}
        </div>

        {/* Subject-wise hours */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4">Time per Subject</h3>
          {subjects.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No study sessions yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={subjects.map((s) => ({
                  name: capitalize(s.name),
                  hours: Math.round((s.minutes / 60) * 10) / 10,
                  fill: SUBJECT_COLORS[s.name] || '#94A3B8',
                }))}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  formatter={(v) => [`${v}h`, 'Hours']}
                  contentStyle={{ borderRadius: 12, border: 'none' }}
                />
                <Bar dataKey="hours" radius={[0, 8, 8, 0]}>
                  {subjects.map((s, i) => (
                    <Cell
                      key={i}
                      fill={SUBJECT_COLORS[s.name] || '#94A3B8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ============ SUBJECT CARDS ============ */}
      {subjectCards.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Subject-Wise Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectCards.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-2xl shadow p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold capitalize">{s.name}</h4>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: SUBJECT_COLORS[s.name] || '#94A3B8',
                    }}
                  />
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${s.pct}%`,
                      background: SUBJECT_COLORS[s.name] || '#94A3B8',
                    }}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  {s.completed}/{s.total} topics · {formatDuration(s.minutes)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ WEEKLY ACTIVITY ============ */}
      {streaks?.weekly && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} /> This Week
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {streaks.weekly.map((d) => (
              <div
                key={d.date}
                className={`p-3 rounded-xl text-center transition ${
                  d.studied
                    ? 'bg-sb-blue text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <p className="text-xs font-medium">{d.day}</p>
                <p className="text-lg font-bold mt-1">
                  {d.studied ? `${Math.round((d.minutes / 60) * 10) / 10}h` : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ RECENT ACTIVITY ============ */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        {recent.length === 0 ? (
          <p className="text-center py-6 text-gray-400">
            No activity yet. Start logging sessions!
          </p>
        ) : (
          <ul className="divide-y">
            {recent.slice(0, 10).map((s) => (
              <li key={s._id} className="py-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {capitalize(s.subject)}
                    {s.topic ? ` — ${s.topic}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(s.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · {s.sessionType}
                  </p>
                </div>
                <span className="text-sm font-semibold text-sb-blue shrink-0 ml-3">
                  {formatDuration(s.duration)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ============ AI INSIGHT ============ */}
      {aiInsight && (
        <div className="bg-gradient-to-r from-sb-yellow/40 to-sb-pink/30 p-6 rounded-2xl flex items-start gap-3">
          <Sparkles className="text-sb-blue shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-semibold mb-1">AI Insight</p>
            <p className="text-sm">{aiInsight}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-component
// ============================================
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl font-bold truncate">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}