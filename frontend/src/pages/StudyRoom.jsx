import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, LogOut, Users, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageTransition from '../components/shared/PageTransition';
import ParticipantList from '../components/rooms/ParticipantList';
import SharedTimer from '../components/rooms/SharedTimer';
import RoomChat from '../components/rooms/RoomChat';
import useSocket from '../hooks/useSocket';
import { usePageTitle } from '../utils/usePageTitle';

// Mock room metadata — will come from backend later
const MOCK_ROOM_META = {
  'physics-marathon': {
    name: 'Physics Marathon',
    topic: 'Rotational Motion',
    host: 'Ankit',
  },
  'neet-bio-squad': {
    name: 'NEET Bio Squad',
    topic: 'Human Physiology',
    host: 'Priya',
  },
  'math-quiet-zone': {
    name: 'Math Quiet Zone',
    topic: 'Calculus',
    host: 'Rahul',
  },
};

export default function StudyRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const meta = MOCK_ROOM_META[roomId] || {
    name: roomId,
    topic: '',
    host: 'Someone',
  };

  usePageTitle(meta.name);

  const {
    connected,
    participants,
    messages,
    timerState,
    sendMessage,
    toggleTimer,
    resetTimer,
    switchMode,
  } = useSocket(roomId);

  const handleLeave = () => {
    if (!window.confirm('Leave this room?')) return;
    toast.success('Left the room');
    navigate('/rooms');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Room link copied! Share with friends 🔗');
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => navigate('/rooms')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-sb-dark-border transition shrink-0"
              title="Back to rooms"
            >
              <ArrowLeft size={20} className="dark:text-sb-dark-text" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold dark:text-sb-dark-text truncate">
                  {meta.name}
                </h1>
                {connected ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600">
                    Connecting...
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {meta.topic && `📖 ${meta.topic} · `} Hosted by {meta.host}
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sb-blue text-sb-blue font-semibold hover:bg-sb-blue/10 transition text-sm"
            >
              <Share2 size={16} /> Invite
            </button>
            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm"
            >
              <LogOut size={16} /> Leave
            </button>
          </div>
        </div>

        {/* Layout: 3 columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Participants */}
          <div className="lg:col-span-3">
            <ParticipantList participants={participants} />
          </div>

          {/* Center: Timer */}
          <div className="lg:col-span-5">
            <SharedTimer
              timerState={timerState}
              onToggle={toggleTimer}
              onReset={resetTimer}
              onSwitchMode={switchMode}
            />
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-4">
            <RoomChat
              messages={messages}
              onSend={sendMessage}
              currentUserId="me"
            />
          </div>
        </div>

        {/* Bottom info */}
        <div className="bg-sb-bg dark:bg-sb-dark-card rounded-2xl p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          🔒 This room will automatically close when everyone leaves. Stay
          focused and enjoy your session!
        </div>
      </div>
    </PageTransition>
  );
}