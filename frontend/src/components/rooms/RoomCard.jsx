import { Users, Lock, Globe, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoomCard({ room }) {
  const isFull = room.participants >= room.maxParticipants;
  const isPrivate = room.type === 'private';

  return (
    <Link
      to={`/rooms/${room.id}`}
      className="block bg-white dark:bg-sb-dark-card rounded-2xl shadow hover:shadow-md transition p-5 border border-transparent hover:border-sb-blue/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPrivate
                ? 'bg-purple-100 text-purple-600'
                : 'bg-sb-blue/10 text-sb-blue'
            }`}
          >
            {isPrivate ? <Lock size={18} /> : <Globe size={18} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate dark:text-sb-dark-text">
              {room.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              by {room.host}
            </p>
          </div>
        </div>
        {room.active && (
          <span className="flex items-center gap-1 text-xs text-green-600 shrink-0">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {room.topic && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-1">
          📖 {room.topic}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Users size={14} />
          {room.participants}/{room.maxParticipants}
          {isFull && <span className="text-red-500 ml-1">Full</span>}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {room.timerMode === 'focus' ? '25 min focus' : '5 min break'}
        </span>
      </div>

      {/* Avatar row */}
      <div className="flex items-center mt-3">
        <div className="flex -space-x-2">
          {room.members?.slice(0, 4).map((m, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full bg-sb-blue/20 border-2 border-white dark:border-sb-dark-card flex items-center justify-center text-xs font-semibold text-sb-blue"
            >
              {m[0]}
            </div>
          ))}
        </div>
        {room.participants > 4 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            +{room.participants - 4} more
          </span>
        )}
      </div>
    </Link>
  );
}