import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/shared/PageTransition';
import Heatmap from '../components/insights/Heatmap';
import FocusTimeChart from '../components/insights/FocusTimeChart';
import SubjectBalance from '../components/insights/SubjectBalance';
import PredictedScore from '../components/insights/PredictedScore';
import ConsistencyScore from '../components/insights/ConsistencyScore';
import InsightBanner from '../components/insights/InsightBanner';
import { dashboardApi, learningApi } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: 'All time', days: 365 },
];

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function Insights() {
  usePageTitle('Insights');

  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  const [progressData, setProgressData] = useState([]); // [{date, hours}]
  const [subjects, setSubjects] = useState({}); // {physics: 12, ...}
  const [tests, setTests] = useState([]); // test analytics
  const [streakData, setStreakData] = useState({ current: 0, activeDays: 0 });
  const [focusTimeData, setFocusTimeData] = useState([]); // [{timeOfDay, hours}]

  // ---- Fetch all data ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [progressRes, subjectRes, testsRes, streakRes] =
          await Promise.all([
            dashboardApi.progress(range).catch(() => ({ daily: [] })),
            dashboardApi
              .subjectPerformance()
              .catch(() => ({ subjects: {} })),
            learningApi.tests(50).catch(() => ({ analytics: [] })),
            dashboardApi.streaks().catch(() => null),
          ]);

        if (cancelled) return;

        // Progress → [{date, hours}]
        const daily = (progressRes.daily || []).map((d) => ({
          date: d.date,
          hours: d.hours || 0,
        }));
        setProgressData(daily);

        // Subjects → {physics: 12, ...}
        const subjectObj = subjectRes.subjects || {};
        const subjectHours = {};
        Object.entries(subjectObj).forEach(([name, minutes]) => {
          subjectHours[name] = Math.round((minutes / 60) * 10) / 10;
        });
        setSubjects(subjectHours);

        // Tests
        setTests(testsRes.analytics || []);

        // Streak / active days
        const currentStreak = streakRes?.currentStreak || 0;
        const activeDays = daily.filter((d) => d.hours > 0).length;
        setStreakData({
          current: currentStreak,
          activeDays,
        });

        // Focus time — derive from daily (mock for now)
        // Real: needs backend aggregation by time-of-day
        // For now: assume evenly split
        const totalHours = daily.reduce((sum, d) => sum + d.hours, 0);
        setFocusTimeData([
          { timeOfDay: 'morning', hours: Math.round(totalHours * 0.35 * 10) / 10 },
          { timeOfDay: 'afternoon', hours: Math.round(totalHours * 0.25 * 10) / 10 },
          { timeOfDay: 'evening', hours: Math.round(totalHours * 0.3 * 10) / 10 },
          { timeOfDay: 'night', hours: Math.round(totalHours * 0.1 * 10) / 10 },
        ]);
      } catch (err) {
        toast.error(err.message || 'Failed to load insights');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [range]);

  // ---- Generate insight text ----
  const insight = useMemo(() => {
    const parts = [];

    // Consistency
    if (streakData.current >= 7) {
      parts.push(`You're on a ${streakData.current}-day streak 🔥`);
    } else if (streakData.current > 0) {
      parts.push(`${streakData.current}-day streak — build on it!`);
    }

    // Subject balance
    const subjectEntries = Object.entries(subjects).sort(
      (a, b) => b[1] - a[1]
    );
    if (subjectEntries.length >= 2) {
      const top = subjectEntries[0];
      const bottom = subjectEntries[subjectEntries.length - 1];
      const total = subjectEntries.reduce((sum, [, h]) => sum + h, 0);
      if (total > 0 && top[1] / total > 0.6) {
        parts.push(
          `${capitalize(top[0])} dominates at ${Math.round(
            (top[1] / total) * 100
          )}% — give ${capitalize(bottom[0])} some attention.`
        );
      }
    }

    // Test performance
    if (tests.length >= 2) {
      const recent = [...tests]
        .sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))
        .slice(0, 3);
      const avg = Math.round(
        recent.reduce((sum, t) => sum + (t.percentage || 0), 0) /
          recent.length
      );
      parts.push(`Recent test avg: ${avg}%.`);
    }

    // Empty state
    if (parts.length === 0) {
      return 'Log sessions and take mock tests to unlock personalized insights.';
    }

    return parts.join(' ');
  }, [subjects, tests, streakData]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold dark:text-sb-dark-text">
              Insights ✨
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analytics that help you study smarter, not just harder
            </p>
          </div>

          {/* Range filter */}
          <div className="flex gap-2 flex-wrap">
            {RANGES.map(({ label, days }) => (
              <button
                key={days}
                onClick={() => setRange(days)}
                className={`px-3 py-1.5 text-xs md:text-sm rounded-lg transition ${
                  range === days
                    ? 'bg-sb-blue text-white'
                    : 'bg-gray-100 dark:bg-sb-dark-border dark:text-sb-dark-text hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Insight banner */}
        {!loading && <InsightBanner insight={insight} />}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-sb-blue" size={36} />
          </div>
        ) : (
          <>
            {/* Heatmap */}
            <Heatmap data={progressData} />

            {/* Two columns: Focus time + Subject balance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FocusTimeChart data={focusTimeData} />
              <SubjectBalance subjects={subjects} />
            </div>

            {/* Two columns: Predicted score + Consistency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PredictedScore tests={tests} />
              <ConsistencyScore
                streak={streakData.current}
                activeDays={streakData.activeDays}
                totalDays={range}
              />
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}