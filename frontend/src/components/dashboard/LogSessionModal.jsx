import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LogSessionModal({ isOpen, onClose, onSave, defaultSubject }) {
  const [subject, setSubject] = useState(defaultSubject || 'Physics');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (!h || h <= 0 || h > 24) {
      toast.error('Please enter valid hours (0.1 - 24)');
      return;
    }
    onSave({ subject, hours: h, date });
    setHours('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1">Log Study Session</h2>
        <p className="text-sm text-gray-500 mb-5">
          Record your focus time for today
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue"
            >
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Mathematics</option>
              <option>Biology</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Hours Studied
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="24"
              placeholder="e.g. 1.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none focus:border-sb-blue"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-sb-blue text-white font-semibold hover:opacity-90 transition"
            >
              Save Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}