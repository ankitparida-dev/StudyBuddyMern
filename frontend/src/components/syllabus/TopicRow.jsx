import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';

const tags = ['Weak', 'Review', 'Strong'];
const tagColors = {
  Weak: 'bg-red-200 text-red-700',
  Review: 'bg-yellow-200 text-yellow-700',
  Strong: 'bg-green-200 text-green-700',
};

export default function TopicRow({ topic }) {
  const [tag, setTag] = useState(() => storage.get(`sb_tag_${topic}`, null));

  useEffect(() => {
    if (tag) storage.set(`sb_tag_${topic}`, tag);
    else storage.remove(`sb_tag_${topic}`);
  }, [tag, topic]);

  return (
    <div className="flex items-center justify-between p-3 border rounded-xl">
      <span>{topic}</span>
      <div className="flex gap-2">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`px-3 py-1 text-xs rounded-full transition ${
              tag === t ? tagColors[t] : 'bg-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}