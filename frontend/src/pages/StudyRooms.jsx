import { useState } from 'react';
import { Plus, Users, Sparkles, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import RoomCard from '../components/rooms/RoomCard';
import CreateRoomModal from '../components/rooms/CreateRoomModal';
import { usePageTitle } from '../utils/usePageTitle';

// Mock rooms — will be replaced by backend data later
const MOCK_ROOMS = [
  {
    id: 'physics-marathon',
    name: 'Physics Marathon',
    host: 'Ankit',
    topic: 'Rotational Motion',
    participants: 3,
    maxParticipants: 5,
    type: 'public',
    active: true,
    timerMode: 'focus',
    members: ['A', 'P', 'R'],
  },
  {
    id: 'neet-bio-squad',
    name: 'NEET Bio Squad',
    host: 'Priya',
    topic: 'Human Physiology',
    participants: 4,
    maxParticipants: 6,
    type: 'public',
    active: true,
    timerMode: 'focus',
    members: ['P', 'S', 'M', 'K'],
  },
  {
    id: 'math-quiet-zone',
    name: 'Math Quiet Zone',
    host: 'Rahul',
    topic: 'Calculus',
    participants: 2,
    maxParticipants: 5,
    type: 'public',
    active: false,
    timerMode: 'break',
    members: ['R', 'N'],
  },
];

export default function StudyRooms() {
  usePageTitle('Study Rooms');

  const navigate = useNavigate();
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = (newRoom) => {
    const id = newRoom.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const room = {
      id,
      host: 'You',
      participants: 1,
      active: true,
      timerMode: 'focus',
      members: ['Y'],
      ...newRoom,
    };
    setRooms((prev) => [room, ...prev]);
    toast.success('Room created! 🎉');
    setTimeout(() => navigate(`/rooms/${id}`), 500);
  };

  const totalLive = rooms.filter((r) => r.active).length;
  const totalUsers = rooms.reduce((sum, r) => sum + r.participants, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold dark:text-sb-dark-text">
              Study Rooms 🔥
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Focus together with others. Shared timer, live chat, real
              accountability.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sb-blue to-sb-teal text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition shrink-0"
          >
            <Plus size={18} />
            Create Room
          </button>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-xl font-bold dark:text-sb-dark-text">
                {totalLive}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Live rooms
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sb-blue/10 flex items-center justify-center shrink-0">
              <Users className="text-sb-blue" size={18} />
            </div>
            <div>
              <p className="text-xl font-bold dark:text-sb-dark-text">
                {totalUsers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Studying now
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <TrendingUp className="text-purple-500" size={18} />
            </div>
            <div>
              <p className="text-xl font-bold dark:text-sb-dark-text">
                {rooms.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total rooms
              </p>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-gradient-to-r from-sb-yellow/30 to-sb-pink/20 p-4 rounded-2xl flex items-start gap-3">
          <Sparkles className="text-sb-blue shrink-0 mt-0.5" size={18} />
          <p className="text-sm dark:text-sb-dark-text">
            <strong>Tip:</strong> Rooms stay open until everyone leaves. Join
            one and start the shared timer — everyone syncs automatically.
          </p>
        </div>

        {/* Public rooms */}
        <div>
          <h2 className="font-semibold mb-3 dark:text-sb-dark-text">
            Public Rooms
          </h2>
          {rooms.length === 0 ? (
            <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No rooms available
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Be the first — create one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateRoomModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </PageTransition>
  );
}