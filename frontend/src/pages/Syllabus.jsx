import { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import TopicRow from '../components/syllabus/TopicRow';
import { learningApi } from '../utils/api';

// Capitalize subject for display: "physics" → "Physics"
const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export default function Syllabus() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // ---- Fetch topics on mount ----
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

  // ---- Update local state after tag change ----
  const handleUpdate = (updated) => {
    setTopics((curr) =>
      curr.map((t) => (t._id === updated._id ? updated : t))
    );
  };

  // ---- Unique subjects ----
  const subjects = useMemo(() => {
    const set = new Set(topics.map((t) => t.subject).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [topics]);

  // ---- Filter topics by search + subject ----
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

  // ---- Group by subject ----
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const key = t.subject || 'other';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [filtered]);

  // ---- Compute stats per subject (based on progress) ----
  const stats = useMemo(() => {
    const s = {};
    topics.forEach((t) => {
      const key = t.subject || 'other';
      if (!s[key]) {
        s[key] = { notStarted: 0, inProgress: 0, completed: 0, total: 0 };
      }
      s[key].total += 1;
      if (t.progress >= 100) s[key].completed += 1;
      else if (t.progress > 0) s[key].inProgress += 1;
      else s[key].notStarted += 1;
    });
    return s;
  }, [topics]);

  // ---- Focus subject = subject with most not-started topics ----
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
    <div className="space-y-6">
      {/* ---- Focus Recommendation ---- */}
      {!loading && focusSubject && stats[focusSubject].notStarted > 0 && (
        <div className="bg-yellow-100 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle
            className="text-yellow-700 shrink-0 mt-0.5"
            size={20}
          />
          <div>
            🎯 <strong>Focus Recommendation:</strong> Start{' '}
            <em>{capitalize(focusSubject)}</em> — you haven't begun{' '}
            {stats[focusSubject].notStarted} topic
            {stats[focusSubject].notStarted !== 1 ? 's' : ''} yet.
          </div>
        </div>
      )}

      {/* ---- Search + Subject Filter ---- */}
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
            className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:border-sb-blue"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="p-3 border rounded-xl outline-none focus:border-sb-blue bg-white"
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Subjects' : capitalize(s)}
            </option>
          ))}
        </select>
      </div>

      {/* ---- Content ---- */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-10 bg-gray-50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            No topics in your syllabus yet
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Topics will appear here once they're added to your account.
          </p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
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
              <div key={subject} className="bg-white rounded-2xl shadow p-6">
                {/* Subject header */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-lg capitalize">
                      {subject}
                    </h3>
                    <div className="flex gap-2 text-xs flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
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
                  <span className="text-sm text-gray-500">
                    {pct}% complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className="bg-sb-blue h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Topic rows */}
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
  );
}