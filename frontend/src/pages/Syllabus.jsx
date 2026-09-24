import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { learningApi } from '../utils/api';
import TopicRow from '../components/syllabus/TopicRow';

export default function Syllabus() {
  const [topics, setTopics] = useState([]);
  const [subject, setSubject] = useState('physics');
  const [chapter, setChapter] = useState('');
  const [name, setName] = useState('');

  const loadTopics = async () => {
    try {
      const response = await learningApi.topics();
      setTopics(response.topics || []);
    } catch (error) {
      toast.error(error.message || 'Could not load syllabus');
    }
  };

  useEffect(() => { loadTopics(); }, []);

  const groupedTopics = useMemo(() => topics.reduce((groups, topic) => {
    if (!groups[topic.subject]) groups[topic.subject] = [];
    groups[topic.subject].push(topic);
    return groups;
  }, {}), [topics]);

  const addTopic = async (event) => {
    event.preventDefault();
    if (!chapter.trim() || !name.trim()) return;
    try {
      const response = await learningApi.createTopic({ subject, chapter, name });
      setTopics((current) => [...current, response.topic]);
      setChapter('');
      setName('');
      toast.success('Topic added');
    } catch (error) {
      toast.error(error.message || 'Could not add topic');
    }
  };

  const updateTopic = (updated) => {
    setTopics((current) => current.map((topic) => topic._id === updated._id ? updated : topic));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Add Syllabus Topic</h3>
        <form onSubmit={addTopic} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="p-3 border rounded-xl">
            {['physics', 'chemistry', 'math', 'biology'].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input value={chapter} onChange={(event) => setChapter(event.target.value)} placeholder="Chapter" className="p-3 border rounded-xl" required />
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Topic" className="p-3 border rounded-xl" required />
          <button type="submit" className="bg-sb-blue text-white rounded-xl">Add Topic</button>
        </form>
      </div>

      {Object.entries(groupedTopics).length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-6 text-gray-500">No syllabus topics yet. Add your first topic above.</div>
      ) : Object.entries(groupedTopics).map(([topicSubject, subjectTopics]) => (
        <div key={topicSubject} className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-lg mb-3 capitalize">{topicSubject}</h3>
          <div className="space-y-2">
            {subjectTopics.map((topic) => (
              <TopicRow key={topic._id} topic={topic} onUpdated={updateTopic} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}