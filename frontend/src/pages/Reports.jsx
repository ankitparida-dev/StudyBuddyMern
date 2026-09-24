import { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import { learningApi } from '../utils/api';

const COLORS = ['#4A90E2', '#F4A2A2'];

export default function Reports() {
  const [topics, setTopics] = useState([]);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    Promise.all([learningApi.topics(), learningApi.tests(100)])
      .then(([topicResponse, testResponse]) => {
        setTopics(topicResponse.topics || []);
        setTests(testResponse.analytics || []);
      })
      .catch((error) => toast.error(error.message || 'Could not load reports'));
  }, []);

  const completion = useMemo(() => {
    const completed = topics.filter((topic) => topic.progress >= 100).length;
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: Math.max(0, topics.length - completed) },
    ];
  }, [topics]);

  const subjectReports = ['physics', 'chemistry', 'math', 'biology'].map((subject) => {
    const subjectTopics = topics.filter((topic) => topic.subject === subject);
    const subjectTests = tests.filter((test) => test.subject === subject);
    const average = subjectTests.length
      ? Math.round(subjectTests.reduce((sum, test) => sum + test.percentage, 0) / subjectTests.length)
      : 0;
    const progress = subjectTopics.length
      ? Math.round(subjectTopics.reduce((sum, topic) => sum + topic.progress, 0) / subjectTopics.length)
      : 0;
    return { subject, progress, average };
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Syllabus Completion</h3>
        {topics.length === 0 ? <p className="text-gray-500">Add syllabus topics to see completion reports.</p> : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart><Pie data={completion} innerRadius={60} outerRadius={100} dataKey="value" label><Cell fill={COLORS[0]} /><Cell fill={COLORS[1]} /></Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjectReports.map(({ subject, progress, average }) => (
          <div key={subject} className="bg-white rounded-2xl shadow p-6">
            <h4 className="font-bold mb-2 capitalize">{subject}</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-sb-blue h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">Syllabus: {progress}%</p>
            <p className="text-sm text-gray-500">Average test score: {average}%</p>
          </div>
        ))}
      </div>

      <div className="bg-yellow-100 p-6 rounded-2xl">
        <strong>Study summary:</strong> {tests.length
          ? `You have recorded ${tests.length} test${tests.length === 1 ? '' : 's'}.`
          : 'Record your first test to generate performance insights.'}
      </div>
    </div>
  );
}