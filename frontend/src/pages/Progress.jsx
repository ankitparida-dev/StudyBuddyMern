import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { dashboardApi, learningApi } from '../utils/api';

const subjects = ['Physics', 'Chemistry', 'Math', 'Biology'];

export default function Progress() {
  const [progress, setProgress] = useState({ daily: [], total: {} });
  const [tests, setTests] = useState([]);
  const [subject, setSubject] = useState('Physics');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [progressResponse, testsResponse] = await Promise.all([
        dashboardApi.progress(30),
        learningApi.tests(20),
      ]);
      setProgress(progressResponse);
      setTests(testsResponse.analytics || []);
    } catch (error) {
      toast.error(error.message || 'Could not load progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const duration = Math.round(Number(hours) * 60);
    if (!duration || duration < 1 || duration > 720) {
      toast.error('Enter study time between 0.1 and 12 hours');
      return;
    }
    try {
      await learningApi.logSession({ subject: subject.toLowerCase(), topic: 'Study session', duration, sessionType: 'study', date });
      setHours('');
      toast.success('Study session logged');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Could not log session');
    }
  };

  const dailyData = (progress.daily || []).map((item) => ({ day: item.date.slice(5), hours: Number(item.hours || 0) }));
  const testData = [...tests].reverse().map((test) => ({ name: test.testName, score: test.percentage }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Log Study Session</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="p-3 border rounded-xl">
            {subjects.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input type="number" min="0.1" max="12" step="0.1" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Hours" className="p-3 border rounded-xl" required />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="p-3 border rounded-xl" required />
          <button type="submit" className="bg-sb-blue text-white rounded-xl">Log Session</button>
        </form>
        <p className="text-sm text-gray-500 mt-3">Last 30 days: {loading ? 'Loading...' : `${progress.total?.hours || 0} hours across ${progress.total?.sessions || 0} sessions`}</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Daily Study Trend</h3>
        {dailyData.length === 0 ? <p className="text-gray-500">No study sessions recorded yet.</p> : <ResponsiveContainer width="100%" height={250}><BarChart data={dailyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis /><Tooltip /><Bar dataKey="hours" fill="#4A90E2" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Test Performance</h3>
        {testData.length === 0 ? <p className="text-gray-500">Record a test to see performance here.</p> : <ResponsiveContainer width="100%" height={250}><LineChart data={testData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="score" stroke="#F5D547" strokeWidth={3} /></LineChart></ResponsiveContainer>}
      </div>
    </div>
  );
}