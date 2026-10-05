import { useState } from 'react';
import { X, Lock, Globe, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateRoomModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    topic: '',
    maxParticipants: 5,
    type: 'public',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name.trim().length < 3) {
      toast.error('Room name must be at least 3 characters');
      return;
    }
    onCreate({
      name: form.name.trim(),
      topic: form.topic.trim(),
      maxParticipants: parseInt(form.maxParticipants, 10),
      type: form.type,
    });
    setForm({
      name: '',
      topic: '',
      maxParticipants: 5,
      type: 'public',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-sb-dark-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-300 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1 dark:text-sb-dark-text">
          Create Study Room
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Invite others to focus together
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-sb-dark-text">
              Room name
            </label>
            <input
              type="text"
              placeholder="e.g. Physics Marathon"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
              required
              maxLength={50}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-sb-dark-text">
              Topic (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Rotational Motion"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-sb-dark-text">
              Max participants
            </label>
            <select
              value={form.maxParticipants}
              onChange={(e) =>
                setForm({ ...form, maxParticipants: e.target.value })
              }
              className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue bg-white dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
            >
              {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} people
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-sb-dark-text">
              Privacy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'public' })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  form.type === 'public'
                    ? 'border-sb-blue bg-sb-blue/5'
                    : 'border-gray-200 dark:border-sb-dark-border hover:border-gray-300'
                }`}
              >
                <Globe
                  size={22}
                  className={
                    form.type === 'public'
                      ? 'text-sb-blue'
                      : 'text-gray-400'
                  }
                />
                <span className="text-sm font-medium dark:text-sb-dark-text">
                  Public
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Anyone can join
                </span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'private' })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                  form.type === 'private'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-sb-dark-border hover:border-gray-300'
                }`}
              >
                <Lock
                  size={22}
                  className={
                    form.type === 'private'
                      ? 'text-purple-500'
                      : 'text-gray-400'
                  }
                />
                <span className="text-sm font-medium dark:text-sb-dark-text">
                  Private
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Invite only
                </span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-sb-dark-border hover:bg-gray-50 dark:hover:bg-sb-dark-bg transition dark:text-sb-dark-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sb-blue text-white font-semibold hover:opacity-90 transition"
            >
              <Plus size={18} />
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}