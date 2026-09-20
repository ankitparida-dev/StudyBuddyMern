import { useState } from 'react';
import { subjects } from '../data/mockData';
import TopicRow from '../components/syllabus/TopicRow';

export default function Syllabus() {
  const [cls, setCls] = useState('class11');
  const data = subjects[cls];

  return (
    <div className="space-y-6">
      <div className="bg-yellow-100 p-4 rounded-xl">
        🎯 <strong>Focus Recommendation:</strong> Start with{' '}
        <em>Thermodynamics</em> (marked weak).
      </div>

      <div className="flex gap-3">
        {['class11', 'class12'].map((c) => (
          <button
            key={c}
            onClick={() => setCls(c)}
            className={`px-4 py-2 rounded-xl ${
              cls === c ? 'bg-sb-blue text-white' : 'bg-white'
            }`}
          >
            {c === 'class11' ? 'Class 11' : 'Class 12'}
          </button>
        ))}
      </div>

      {Object.entries(data).map(([subject, topics]) => (
        <div key={subject} className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-bold text-lg mb-3">{subject}</h3>
          <div className="space-y-2">
            {topics.map((t) => (
              <TopicRow key={t} topic={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}