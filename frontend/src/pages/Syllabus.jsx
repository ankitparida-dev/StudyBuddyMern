import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Loader2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/shared/PageTransition';
import TopicRow from '../components/syllabus/TopicRow';
import { getExamCurriculum, getExamSubjects } from '../data/mockData';
import { learningApi } from '../utils/api';
import { storage } from '../utils/storage';
import { usePageTitle } from '../utils/usePageTitle';

const capitalize = (value) => value ? value[0].toUpperCase() + value.slice(1) : value;

export default function Syllabus() {
  usePageTitle('Syllabus');

  const account = storage.get('sb_user', {});
  const examType = account.examType === 'NEET' ? 'NEET' : 'JEE';
  const currentGrade = account.currentGrade || 'Class 11';
  const examSubjects = useMemo(() => getExamSubjects(examType), [examType]);

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [newTopic, setNewTopic] = useState({ subject: 'physics', chapter: '', name: '' });
  const [savingTopic, setSavingTopic] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadSyllabus = async () => {
      setLoading(true);
      try {
        await learningApi.seedTopics(getExamCurriculum(examType, currentGrade));
        const response = await learningApi.topics();
        if (!cancelled) setTopics(response.topics || []);
      } catch (error) {
        if (!cancelled) toast.error(error.message || 'Could not load syllabus');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSyllabus();
    return () => { cancelled = true; };
  }, [examType, currentGrade]);

  const examTopics = useMemo(
    () => topics.filter((topic) => examSubjects.includes(topic.subject)),
    [topics, examSubjects]
  );

  const subjects = useMemo(() => ['all', ...examSubjects], [examSubjects]);

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    return examTopics.filter((topic) => {
      if (subjectFilter !== 'all' && topic.subject !== subjectFilter) return false;
      if (!query) return true;
      return topic.name?.toLowerCase().includes(query)
        || topic.chapter?.toLowerCase().includes(query);
    });
  }, [examTopics, search, subjectFilter]);

  const groupedTopics = useMemo(() => {
    const groups = {};
    filteredTopics.forEach((topic) => {
      if (!groups[topic.subject]) groups[topic.subject] = [];
      groups[topic.subject].push(topic);
    });
    return groups;
  }, [filteredTopics]);

  const subjectStats = useMemo(() => {
    const stats = {};
    examTopics.forEach((topic) => {
      if (!stats[topic.subject]) {
        stats[topic.subject] = { notStarted: 0, inProgress: 0, completed: 0, total: 0 };
      }
      const subject = stats[topic.subject];
      subject.total += 1;
      if (topic.progress >= 100) subject.completed += 1;
      else if (topic.progress > 0) subject.inProgress += 1;
      else subject.notStarted += 1;
    });
    return stats;
  }, [examTopics]);

  const focusSubject = useMemo(() => {
    return Object.entries(subjectStats)
      .sort(([, first], [, second]) => second.notStarted - first.notStarted)[0]?.[0] || null;
  }, [subjectStats]);

  const handleUpdate = (updatedTopic) => {
    setTopics((current) => current.map((topic) =>
      topic._id === updatedTopic._id ? updatedTopic : topic
    ));
  };

  const handleAddTopic = async (event) => {
    event.preventDefault();
    const subject = examSubjects.includes(newTopic.subject) ? newTopic.subject : examSubjects[0];
    setSavingTopic(true);
    try {
      const response = await learningApi.createTopic({
        subject,
        chapter: newTopic.chapter.trim(),
        name: newTopic.name.trim(),
      });
      setTopics((current) => [...current, response.topic]);
      setNewTopic({ subject, chapter: '', name: '' });
      toast.success('Syllabus topic added');
    } catch (error) {
      toast.error(error.message || 'Could not add topic');
    } finally {
      setSavingTopic(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {!loading && focusSubject && subjectStats[focusSubject].notStarted > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-yellow-700 dark:text-yellow-400 shrink-0 mt-0.5" size={20} />
            <div className="dark:text-sb-dark-text">
              <strong>{examType} focus:</strong> Start {capitalize(focusSubject)}. You have {subjectStats[focusSubject].notStarted} topics not started.
            </div>
          </div>
        )}

        <section className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 md:p-6 transition-colors">
          <div className="mb-3">
            <h3 className="font-semibold dark:text-sb-dark-text">{examType} syllabus · {currentGrade}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add a topic to one of your exam subjects.</p>
          </div>
          <form onSubmit={handleAddTopic} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={examSubjects.includes(newTopic.subject) ? newTopic.subject : examSubjects[0]}
              onChange={(event) => setNewTopic({ ...newTopic, subject: event.target.value })}
              className="p-3 border rounded-xl bg-white dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
            >
              {examSubjects.map((subject) => <option key={subject} value={subject}>{capitalize(subject)}</option>)}
            </select>
            <input
              value={newTopic.chapter}
              onChange={(event) => setNewTopic({ ...newTopic, chapter: event.target.value })}
              placeholder="Chapter"
              maxLength={150}
              required
              className="p-3 border rounded-xl dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
            />
            <input
              value={newTopic.name}
              onChange={(event) => setNewTopic({ ...newTopic, name: event.target.value })}
              placeholder="Topic"
              maxLength={150}
              required
              className="p-3 border rounded-xl dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
            />
            <button
              type="submit"
              disabled={savingTopic}
              className="px-4 py-3 rounded-xl bg-sb-blue text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {savingTopic ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add topic
            </button>
          </form>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search topics or chapters..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-card dark:border-sb-dark-border dark:text-sb-dark-text"
            />
          </div>
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-card dark:border-sb-dark-border dark:text-sb-dark-text"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject === 'all' ? 'All Subjects' : capitalize(subject)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-6">
                <div className="h-5 w-32 bg-gray-100 dark:bg-sb-dark-border rounded animate-pulse mb-4" />
                <div className="space-y-2">{[1, 2, 3].map((row) => <div key={row} className="h-10 bg-gray-50 dark:bg-sb-dark-bg rounded-xl animate-pulse" />)}</div>
              </div>
            ))}
          </div>
        ) : examTopics.length === 0 ? (
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No topics in your syllabus yet</p>
            <p className="text-sm text-gray-400 mt-1">Add a topic above to begin tracking your syllabus.</p>
          </div>
        ) : Object.keys(groupedTopics).length === 0 ? (
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-8 text-center text-gray-500 dark:text-gray-400">No topics match your search.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTopics).map(([subject, subjectTopics]) => {
              const stats = subjectStats[subject] || { notStarted: 0, inProgress: 0, completed: 0, total: 0 };
              const percent = stats.total ? Math.round(stats.completed / stats.total * 100) : 0;
              return (
                <section key={subject} className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-6 transition-colors">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg capitalize dark:text-sb-dark-text">{subject}</h3>
                      <div className="flex gap-2 text-xs flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{stats.notStarted} Not Started</span>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{stats.inProgress} In Progress</span>
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">{stats.completed} Completed</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{percent}% complete</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-sb-dark-border rounded-full h-2 mb-4">
                    <div className="bg-sb-blue h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="space-y-2">
                    {subjectTopics.map((topic) => <TopicRow key={topic._id} topic={topic} onUpdate={handleUpdate} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
