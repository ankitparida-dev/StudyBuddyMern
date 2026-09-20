import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { syllabusCompletion } from '../data/mockData';

const COLORS = ['#4A90E2', '#F4A2A2'];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Syllabus Completion</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={syllabusCompletion}
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              label
            >
              {syllabusCompletion.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Physics', 'Chemistry', 'Math'].map((s) => (
          <div key={s} className="bg-white rounded-2xl shadow p-6">
            <h4 className="font-bold mb-2">{s}</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-sb-blue h-2 rounded-full"
                style={{ width: '60%' }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Weak Areas: Rotational Motion
            </p>
          </div>
        ))}
      </div>

      <div className="bg-yellow-100 p-6 rounded-2xl">
        🤖 <strong>AI Insight:</strong> Focus on Organic Chemistry this week —
        your test scores show a downward trend.
      </div>
    </div>
  );
}