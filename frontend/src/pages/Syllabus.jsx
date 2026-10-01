import { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import TopicRow from '../components/syllabus/TopicRow';
import PageTransition from '../components/shared/PageTransition';
import { learningApi } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function Syllabus() {
  usePageTitle('Syllabus');

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await learningApi.topics();
        if (!cancelled) setTopics(res.topics || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load syllabus');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdate = (updated) => {
    setTopics((curr) =>
      curr.map((t) => (t._id === updated._id ? updated : t))
    );
  };

  const subjects = useMemo(() => {
    const set = new Set(topics.map((t) => t.subject).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [topics]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return topics.filter((t) => {
      if (subjectFilter !== 'all' && t.subject !== subjectFilter) return false;
      if (!q) return true;
      return (
        (t.name || '').toLowerCase().includes(q) ||
        (t.chapter || '').toLowerCase().includes(q)
      );
    });
  }, [topics, search, subjectFilter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const key = t.subject || 'other';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const s = {};
    topics.forEach((t) => {
      const key = t.subject || 'other';
      if (!s[key])
        s[key] = { notStarted: 0, inProgress: 0, completed: 0, total: 0 };
      s[key].total += 1;
      if (t.progress >= 100) s[key].completed += 1;
      else if (t.progress > 0) s[key].inProgress += 1;
      else s[key].notStarted += 1;
    });
    return s;
  }, [topics]);

  const focusSubject = useMemo(() => {
    let best = null;
    let maxNotStarted = 0;
    Object.entries(stats).forEach(([subject, s]) => {
      if (s.notStarted > maxNotStarted) {
        maxNotStarted = s.notStarted;
        best = subject;
      }
    });
    return best;
  }, [stats]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {!loading && focusSubject && stats[focusSubject].notStarted > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle
              className="text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5"
              size={20}
            />
            <div className="dark:text-sb-dark-text">
              🎯 <strong>Focus Recommendation:</strong> Start{' '}
              <em>{capitalize(focusSubject)}</em> — you haven't begun{' '}
              {stats[focusSubject].notStarted} topic
              {stats[focusSubject].notStarted !== 1 ? 's' : ''} yet.
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics or chapters..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-card dark:border-sb-dark-border dark:text-sb-dark-text"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-card dark:border-sb-dark-border dark:text-sb-dark-text"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Subjects' : capitalize(s)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-6"
              >
                <div className="h-5 w-32 bg-gray-100 dark:bg-sb-dark-border rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-10 bg-gray-50 dark:bg-sb-dark-bg rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No topics in your syllabus yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Topics will appear here once they're added to your account.
            </p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-8 text-center text-gray-500 dark:text-gray-400">
            No topics match your search.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([subject, subjectTopics]) => {
              const s = stats[subject] || {
                notStarted: 0,
                inProgress: 0,
                completed: 0,
                total: 0,
              };
              const pct =
                s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;

              return (
                <div
                  key={subject}
                  className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-6 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg capitalize dark:text-sb-dark-text">
                        {subject}
                      </h3>
                      <div className="flex gap-2 text-xs flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {s.notStarted} Not Started
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          {s.inProgress} In Progress
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          {s.completed} Completed
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {pct}% complete
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 dark:bg-sb-dark-border rounded-full h-2 mb-4">
                    <div
                      className="bg-sb-blue h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {subjectTopics.map((t) => (
                      <TopicRow key={t._id} topic={t} onUpdate={handleUpdate} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}