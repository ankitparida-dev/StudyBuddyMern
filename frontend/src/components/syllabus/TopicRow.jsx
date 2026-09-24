import { useState } from 'react';
import toast from 'react-hot-toast';
import { learningApi } from '../../utils/api';

export default function TopicRow({ topic, onUpdated }) {
  const [saving, setSaving] = useState(false);

  const updateProgress = async (progress) => {
    setSaving(true);
    try {
      const { topic: updated } = await learningApi.updateTopic(topic._id, { progress });
      onUpdated(updated);
    } catch (error) {
      toast.error(error.message || 'Could not update topic');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-xl">
      <div>
        <span>{topic.name}</span>
        <p className="text-xs text-gray-500 mt-1">{topic.progress}% complete</p>
      </div>
      <div className="flex gap-2">
        {[0, 50, 100].map((progress) => (
          <button
            key={progress}
            type="button"
            disabled={saving}
            onClick={() => updateProgress(progress)}
            className={`px-3 py-1 text-xs rounded-full transition ${topic.progress === progress ? 'bg-sb-blue text-white' : 'bg-gray-100'}`}
          >
            {progress}%
          </button>
        ))}
      </div>
    </div>
  );
}