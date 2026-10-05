import { Crown, MicOff } from 'lucide-react';

export default function ParticipantList({ participants }) {
  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm dark:text-sb-dark-text">
          Participants
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {participants.length} online
        </span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {participants.map((p, idx) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-sb-bg dark:hover:bg-sb-dark-bg transition"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                p.isSelf
                  ? 'bg-sb-blue text-white'
                  : 'bg-sb-blue/15 text-sb-blue'
              }`}
            >
              {p.avatar || p.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-sb-dark-text">
                {p.name}
                {p.isSelf && (
                  <span className="text-xs text-gray-400 ml-1">(you)</span>
                )}
              </p>
              {p.status && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {p.status}
                </p>
              )}
            </div>
            {idx === 0 && !p.isSelf && (
              <Crown size={14} className="text-yellow-500 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}