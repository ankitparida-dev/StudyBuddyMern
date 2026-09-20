import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { studyTrend, mockTests } from '../data/mockData';

export default function Progress() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Log Study Session</h3>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select className="p-3 border rounded-xl">
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Math</option>
          </select>
          <input type="number" placeholder="Hours" className="p-3 border rounded-xl" />
          <input type="date" className="p-3 border rounded-xl" />
          <button className="bg-sb-blue text-white rounded-xl">Log Session</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Daily Study Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={studyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#4A90E2" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-4">Mock Test Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={mockTests}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#F5D547" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}