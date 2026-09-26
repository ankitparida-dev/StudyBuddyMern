import { useState } from 'react';
import toast from 'react-hot-toast';
import { learningApi } from '../../utils/api';

// Progress-based levels (matches backend auto-status logic)
const PROGRESS_LEVELS = [
  { value: 0,   label: 'Not Started', active: 'bg-gray-300 text-gray-800' },
  { value: 50,  label: 'In Progress', active: 'bg-yellow-200 text-yellow-800' },
  { value: 100, label: 'Completed',   active: 'bg-green-200 text-green-800' },
];

// Convert raw progress (0-100) to nearest button level
const nearestLevel = (progress) => {
  if (progress >= 100) return 100;
  if (progress > 0) return 50;
  return 0;
};

export default function TopicRow({ topic, onUpdate }) {
  const [current, setCurrent] = useState(topic);
  const [saving, setSaving] = useState(false);

  const setLevel = async (value) => {
    if (saving || current.progress === value) return;

    const prev = current;
    // Optimistic update
    setCurrent({ ...current, progress: value });
    setSaving(true);

    try {
      // Backend auto-updates status field via pre('save') hook
      const { topic: updated } = await learningApi.updateTopic(current._id, {
        progress: value,
      });
      setCurrent(updated);
      onUpdate?.(updated);
      toast.success(
        `Marked as ${PROGRESS_LEVELS.find((l) => l.value === value).label}`
      );
    } catch (err) {
      // Revert on failure
      setCurrent(prev);
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const currentLevel = nearestLevel(current.progress);

  return (
    <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-sb-bg/40 transition">
      <div className="flex-1 min-w-0 pr-3">
        <p className="font-medium truncate">{current.name}</p>
        {current.chapter && (
          <p className="text-xs text-gray-500 truncate">{current.chapter}</p>
        )}
      </div>

      <div className="flex gap-2 shrink-0">
        {PROGRESS_LEVELS.map(({ value, label, active }) => (
          <button
            key={value}
            onClick={() => setLevel(value)}
            disabled={saving}
            className={`px-3 py-1 text-xs rounded-full transition ${
              currentLevel === value ? active : 'bg-gray-100 hover:bg-gray-200'
            } ${saving ? 'opacity-50 cursor-wait' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}