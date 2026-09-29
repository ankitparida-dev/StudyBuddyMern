import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, Plus, Loader2, Award, Clock, Target, BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/shared/PageTransition';
import { learningApi, dashboardApi } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

const SUBJECTS = ['physics', 'chemistry', 'math', 'biology', 'general'];
const SESSION_TYPES = ['study', 'practice', 'revision', 'test', 'focus'];

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const tooltipStyle = {
  borderRadius: 12,
  border: 'none',
  fontSize: 12,
  padding: '8px 12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

export default function Progress() {
  usePageTitle('Progress');

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [trend, setTrend] = useState([]);
  const [trendDays, setTrendDays] = useState(7);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const [tests, setTests] = useState([]);
  const [testSummary, setTestSummary] = useState(null);
  const [loadingTests, setLoadingTests] = useState(true);

  const [sessionForm, setSessionForm] = useState({
    subject: 'physics',
    topic: '',
    duration: '',
    sessionType: 'study',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [submittingSession, setSubmittingSession] = useState(false);

  const [testForm, setTestForm] = useState({
    testName: '',
    subject: 'physics',
    testType: 'practice',
    totalQuestions: '',
    attempted: '',
    correct: '',
    timeSpentMinutes: '',
    takenAt: new Date().toISOString().split('T')[0],
  });
  const [submittingTest, setSubmittingTest] = useState(false);

  // ---- Fetch sessions ----
  useEffect(() => {
    (async () => {
      setLoadingSessions(true);
      try {
        const res = await learningApi.sessions(50);
        setSessions(res.sessions || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load sessions');
      } finally {
        setLoadingSessions(false);
      }
    })();
  }, []);

  // ---- Fetch tests + summary ----
  const fetchTests = async () => {
    setLoadingTests(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        learningApi.tests(50).catch(() => ({ analytics: [] })),
        learningApi.testSummary().catch(() => ({ summary: null })),
      ]);
      setTests(listRes.analytics || []);
      setTestSummary(summaryRes.summary || null);
    } catch (err) {
      toast.error(err.message || 'Failed to load tests');
    } finally {
      setLoadingTests(false);
    }
  };
  useEffect(() => {
    fetchTests();
  }, []);

  // ---- Fetch trend ----
  useEffect(() => {
    (async () => {
      setLoadingTrend(true);
      try {
        const res =
          trendDays === 7
            ? await dashboardApi.weekly()
            : await dashboardApi.monthly();
        const daily = res.daily || [];
        setTrend(
          daily.map((d) => ({
            day: new Date(d.date).toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
            }),
            hours: d.hours || 0,
          }))
        );
      } catch (err) {
        toast.error(err.message || 'Failed to load trend');
      } finally {
        setLoadingTrend(false);
      }
    })();
  }, [trendDays]);

  // ---- Submit session ----
  const handleSubmitSession = async (e) => {
    e.preventDefault();
    const duration = parseInt(sessionForm.duration, 10);
    if (!duration || duration < 1 || duration > 720) {
      toast.error('Duration must be 1-720 minutes');
      return;
    }

    setSubmittingSession(true);
    try {
      const { session } = await learningApi.logSession({
        subject: sessionForm.subject,
        topic: sessionForm.topic || 'general',
        duration,
        sessionType: sessionForm.sessionType,
        date: sessionForm.date,
        notes: sessionForm.notes,
      });
      setSessions((curr) => [session, ...curr]);
      setSessionForm({
        subject: 'physics',
        topic: '',
        duration: '',
        sessionType: 'study',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      toast.success('Session logged ✅');

      const res =
        trendDays === 7
          ? await dashboardApi.weekly()
          : await dashboardApi.monthly();
      setTrend(
        (res.daily || []).map((d) => ({
          day: new Date(d.date).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
          }),
          hours: d.hours || 0,
        }))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to log session');
    } finally {
      setSubmittingSession(false);
    }
  };

  // ---- Submit test ----
  const handleSubmitTest = async (e) => {
    e.preventDefault();
    const total = parseInt(testForm.totalQuestions, 10);
    const attempted = parseInt(testForm.attempted, 10);
    const correct = parseInt(testForm.correct, 10);

    if (!testForm.testName.trim()) return toast.error('Test name is required');
    if (!total || total < 1) return toast.error('Total questions required');
    if (attempted < 0 || attempted > total)
      return toast.error('Attempted must be 0-total');
    if (correct < 0 || correct > attempted)
      return toast.error('Correct must be 0-attempted');

    setSubmittingTest(true);
    try {
      const { analytics } = await learningApi.recordTest({
        testName: testForm.testName,
        subject: testForm.subject,
        testType: testForm.testType,
        totalQuestions: total,
        attempted,
        correct,
        incorrect: attempted - correct,
        skipped: total - attempted,
        timeSpentMinutes: parseInt(testForm.timeSpentMinutes, 10) || 0,
        takenAt: testForm.takenAt,
      });
      setTests((curr) => [analytics, ...curr]);
      setTestForm({
        testName: '',
        subject: 'physics',
        testType: 'practice',
        totalQuestions: '',
        attempted: '',
        correct: '',
        timeSpentMinutes: '',
        takenAt: new Date().toISOString().split('T')[0],
      });
      toast.success('Test recorded ✅');

      const s = await learningApi.testSummary().catch(() => ({ summary: null }));
      setTestSummary(s.summary || null);
    } catch (err) {
      toast.error(err.message || 'Failed to record test');
    } finally {
      setSubmittingTest(false);
    }
  };

  const todayTotal = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sessions
      .filter((s) => new Date(s.date).toISOString().split('T')[0] === today)
      .reduce((sum, s) => sum + (s.duration || 0), 0);
  }, [sessions]);

  const formatDuration = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* ---- Stat cards ---- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Clock className="text-sb-blue" size={24} />}
            label="Today"
            value={formatDuration(todayTotal)}
          />
          <StatCard
            icon={<BookOpen className="text-purple-500" size={24} />}
            label="Sessions"
            value={sessions.length}
          />
          <StatCard
            icon={<Award className="text-green-500" size={24} />}
            label="Tests"
            value={testSummary?.tests ?? tests.length}
          />
          <StatCard
            icon={<Target className="text-orange-500" size={24} />}
            label="Avg Accuracy"
            value={`${testSummary?.averagePercentage?.toFixed(1) ?? 0}%`}
          />
        </div>

        {/* ---- Form + Trend ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6 transition-colors">
            <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-sb-dark-text">
              <Plus size={18} /> Log Study Session
            </h3>
            <form onSubmit={handleSubmitSession} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={sessionForm.subject}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, subject: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {capitalize(s)}
                    </option>
                  ))}
                </select>
                <select
                  value={sessionForm.sessionType}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      sessionType: e.target.value,
                    })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {capitalize(t)}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Topic (optional)"
                value={sessionForm.topic}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, topic: e.target.value })
                }
                className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                maxLength={100}
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="1"
                  max="720"
                  placeholder="Duration (min)"
                  value={sessionForm.duration}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, duration: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                  required
                />
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, date: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                />
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={sessionForm.notes}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, notes: e.target.value })
                }
                className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue resize-none dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                rows={2}
                maxLength={1000}
              />

              <button
                type="submit"
                disabled={submittingSession}
                className="w-full py-3 rounded-xl bg-sb-blue text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingSession && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Save Session
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2 dark:text-sb-dark-text">
                <TrendingUp size={18} /> Study Trend
              </h3>
              <div className="flex gap-2">
                {[7, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setTrendDays(d)}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      trendDays === d
                        ? 'bg-sb-blue text-white'
                        : 'bg-gray-100 dark:bg-sb-dark-border dark:text-sb-dark-text hover:bg-gray-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {loadingTrend ? (
              <div className="h-56 md:h-64 bg-gray-50 dark:bg-sb-dark-bg rounded-xl animate-pulse" />
            ) : trend.every((t) => t.hours === 0) ? (
              <div className="h-56 md:h-64 flex items-center justify-center text-gray-400">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} width={30} />
                  <Tooltip
                    formatter={(value) => [`${value}h`, 'Hours']}
                    contentStyle={tooltipStyle}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Bar dataKey="hours" fill="#4A90E2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ---- Recent Sessions ---- */}
        <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6 transition-colors">
          <h3 className="font-semibold mb-4 dark:text-sb-dark-text">
            Recent Sessions
          </h3>
          {loadingSessions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-50 dark:bg-sb-dark-bg rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-center py-8 text-gray-400">
              No sessions logged yet. Add your first one above!
            </p>
          ) : (
            <ul className="divide-y dark:divide-sb-dark-border max-h-80 overflow-y-auto">
              {sessions.map((s) => (
                <li
                  key={s._id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate dark:text-sb-dark-text">
                      {capitalize(s.subject)}
                      {s.topic ? ` — ${s.topic}` : ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(s.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      · {s.sessionType}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-sb-blue shrink-0">
                    {formatDuration(s.duration)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---- Test Form + Chart ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6 transition-colors">
            <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-sb-dark-text">
              <Award size={18} /> Add Mock Test
            </h3>
            <form onSubmit={handleSubmitTest} className="space-y-3">
              <input
                type="text"
                placeholder="Test name (e.g. Physics Mock 1)"
                value={testForm.testName}
                onChange={(e) =>
                  setTestForm({ ...testForm, testName: e.target.value })
                }
                className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                required
                maxLength={150}
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={testForm.subject}
                  onChange={(e) =>
                    setTestForm({ ...testForm, subject: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                >
                  {[...SUBJECTS, 'mixed'].map((s) => (
                    <option key={s} value={s}>
                      {capitalize(s)}
                    </option>
                  ))}
                </select>
                <select
                  value={testForm.testType}
                  onChange={(e) =>
                    setTestForm({ ...testForm, testType: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                >
                  <option value="practice">Practice</option>
                  <option value="mock">Mock</option>
                  <option value="sectional">Sectional</option>
                  <option value="full-length">Full-Length</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <input
                  type="number"
                  min="1"
                  placeholder="Total Q"
                  value={testForm.totalQuestions}
                  onChange={(e) =>
                    setTestForm({ ...testForm, totalQuestions: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Attempted"
                  value={testForm.attempted}
                  onChange={(e) =>
                    setTestForm({ ...testForm, attempted: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Correct"
                  value={testForm.correct}
                  onChange={(e) =>
                    setTestForm({ ...testForm, correct: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  placeholder="Time spent (min)"
                  value={testForm.timeSpentMinutes}
                  onChange={(e) =>
                    setTestForm({
                      ...testForm,
                      timeSpentMinutes: e.target.value,
                    })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                />
                <input
                  type="date"
                  value={testForm.takenAt}
                  onChange={(e) =>
                    setTestForm({ ...testForm, takenAt: e.target.value })
                  }
                  className="p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTest}
                className="w-full py-3 rounded-xl bg-sb-yellow text-sb-teal font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingTest && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Save Test
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6 transition-colors">
            <h3 className="font-semibold mb-4 dark:text-sb-dark-text">
              Test Performance
            </h3>
            {loadingTests ? (
              <div className="h-56 md:h-64 bg-gray-50 dark:bg-sb-dark-bg rounded-xl animate-pulse" />
            ) : tests.length === 0 ? (
              <div className="h-56 md:h-64 flex items-center justify-center text-gray-400">
                No tests recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={[...tests]
                    .reverse()
                    .map((t) => ({
                      name: t.testName?.slice(0, 12) || 'Test',
                      percentage: t.percentage,
                    }))}
                  margin={{ left: -20, right: 8, top: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11 }}
                    width={30}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Score']}
                    contentStyle={tooltipStyle}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#F5D547"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-3 md:p-4 flex items-center gap-2 md:gap-3 transition-colors">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xl md:text-2xl font-bold truncate dark:text-sb-dark-text">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {label}
        </p>
      </div>
    </div>
  );
}