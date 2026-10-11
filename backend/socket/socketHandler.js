const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory store for active study rooms
const rooms = new Map();

// Helper to initialize default public rooms
const initDefaultRooms = () => {
  const defaultRooms = [
    {
      id: 'physics-marathon',
      name: 'Physics Marathon',
      topic: 'Rotational Motion',
      host: 'Ankit',
      type: 'public',
      maxParticipants: 10,
    },
    {
      id: 'neet-bio-squad',
      name: 'NEET Bio Squad',
      topic: 'Human Physiology',
      host: 'Priya',
      type: 'public',
      maxParticipants: 10,
    },
    {
      id: 'math-quiet-zone',
      name: 'Math Quiet Zone',
      topic: 'Calculus',
      host: 'Rahul',
      type: 'public',
      maxParticipants: 10,
    },
  ];

  defaultRooms.forEach((r) => {
    if (!rooms.has(r.id)) {
      rooms.set(r.id, {
        id: r.id,
        name: r.name,
        topic: r.topic,
        host: r.host,
        type: r.type,
        maxParticipants: r.maxParticipants,
        participants: new Map(), // socketId -> participant info
        messages: [
          {
            id: `sys_welcome_${r.id}`,
            type: 'system',
            text: `Welcome to ${r.name}! Study together, stay focused 💪`,
            timestamp: Date.now() - 60000,
          },
        ],
        timer: {
          mode: 'focus', // 'focus' | 'break'
          secondsLeft: 25 * 60,
          running: false,
        },
      });
    }
  });
};

initDefaultRooms();

// Token verification helper matching authMiddleware
const verifyAuthToken = async (token) => {
  if (!token) return null;
  try {
    const getFirebaseAdmin = require('../config/firebaseAdmin');
    const decoded = await getFirebaseAdmin().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decoded.uid }).select(
      'firstName lastName email avatar'
    );
    if (user) return user;
  } catch (firebaseErr) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(
        'firstName lastName email avatar'
      );
      if (user) return user;
    } catch (jwtErr) {
      return null;
    }
  }
  return null;
};

// Return formatted list of rooms for REST API and sockets
const getRoomsList = () => {
  return Array.from(rooms.values()).map((r) => {
    const participantsList = Array.from(r.participants.values());
    return {
      id: r.id,
      name: r.name,
      topic: r.topic,
      host: r.host,
      participants: participantsList.length,
      maxParticipants: r.maxParticipants || 10,
      type: r.type || 'public',
      active: participantsList.length > 0 || r.timer.running,
      timerMode: r.timer.mode,
      members: participantsList.map((p) => p.avatar || p.name[0] || 'U'),
    };
  });
};

// Create a new room dynamically
const createRoomData = (roomData, creatorUser = null) => {
  const slug = (roomData.name || 'Room')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const id = roomData.id || `${slug}-${Date.now().toString(36)}`;
  const hostName =
    creatorUser?.firstName ||
    roomData.host ||
    'Host';

  const newRoom = {
    id,
    name: roomData.name || 'Study Room',
    topic: roomData.topic || '',
    host: hostName,
    type: roomData.type || 'public',
    maxParticipants: Number(roomData.maxParticipants) || 10,
    participants: new Map(),
    messages: [
      {
        id: `sys_welcome_${id}`,
        type: 'system',
        text: `Welcome to ${roomData.name || 'the room'}! Ready to focus? 🔥`,
        timestamp: Date.now(),
      },
    ],
    timer: {
      mode: 'focus',
      secondsLeft: 25 * 60,
      running: false,
    },
  };

  rooms.set(id, newRoom);
  return newRoom;
};

let ioInstance = null;

// Setup Socket.IO
const initSocket = (server, corsOptions) => {
  const io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 30000,
    pingInterval: 15000,
  });

  ioInstance = io;

  // Global socket auth middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

      if (token) {
        const user = await verifyAuthToken(token);
        if (user) {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
          socket.user = {
            id: user._id.toString(),
            name: fullName,
            avatar: (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase(),
            email: user.email,
            isGuest: false,
          };
          return next();
        }
      }

      // Guest fallback (e.g. testing with multiple tabs or non-logged in visitor)
      const guestName =
        socket.handshake.auth?.userName ||
        `Student ${socket.id.slice(0, 4)}`;
      socket.user = {
        id: `guest_${socket.id.slice(0, 8)}`,
        name: guestName,
        avatar: guestName.charAt(0).toUpperCase() || 'S',
        email: null,
        isGuest: true,
      };
      next();
    } catch (err) {
      console.error('Socket auth middleware error:', err.message);
      next();
    }
  });

  // Global timer ticker: 1-second interval across all rooms
  setInterval(() => {
    rooms.forEach((room) => {
      if (room.timer.running) {
        room.timer.secondsLeft -= 1;

        if (room.timer.secondsLeft <= 0) {
          // Switch modes
          const nextMode = room.timer.mode === 'focus' ? 'break' : 'focus';
          const nextDuration = nextMode === 'focus' ? 25 * 60 : 5 * 60;
          room.timer.mode = nextMode;
          room.timer.secondsLeft = nextDuration;
          room.timer.running = false;

          const finishMsg = {
            id: `sys_${Date.now()}`,
            type: 'system',
            text:
              nextMode === 'break'
                ? '🎉 Focus session finished! Take a well-deserved 5-minute break.'
                : '🔔 Break finished! Time to dive back into focus mode.',
            timestamp: Date.now(),
          };
          room.messages.push(finishMsg);
          if (room.messages.length > 100) room.messages.shift();

          io.to(room.id).emit('new-message', finishMsg);
          io.to(room.id).emit('timer-state', { ...room.timer });
        } else {
          // Broadcast ticking state
          io.to(room.id).emit('timer-tick', {
            secondsLeft: room.timer.secondsLeft,
            running: room.timer.running,
            mode: room.timer.mode,
          });
        }
      }
    });
  }, 1000);

  // Connection Handler
  io.on('connection', (socket) => {
    console.log(
      `🔌 Socket connected: ${socket.id} (${socket.user?.name || 'Anonymous'})`
    );

    // Helper to leave current room cleanly
    const leaveCurrentRoom = (roomId) => {
      const room = rooms.get(roomId);
      if (!room) return;

      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        socket.leave(roomId);

        const updatedParticipants = Array.from(room.participants.values());
        io.to(roomId).emit('participants-update', updatedParticipants);

        const leaveMsg = {
          id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: 'system',
          text: `${socket.user.name} left the room`,
          timestamp: Date.now(),
        };
        room.messages.push(leaveMsg);
        if (room.messages.length > 100) room.messages.shift();
        io.to(roomId).emit('new-message', leaveMsg);

        // If room is empty, pause timer to preserve state
        if (room.participants.size === 0) {
          room.timer.running = false;
        }

        io.emit('rooms-list-update', getRoomsList());
      }
    };

    // EVENT: join-room
    socket.on('join-room', ({ roomId, user: clientUser }) => {
      if (!roomId) return;

      // Allow client to override display name if desired
      if (clientUser?.name && socket.user.isGuest) {
        socket.user.name = clientUser.name;
        socket.user.avatar = (clientUser.name[0] || 'G').toUpperCase();
      }

      // Leave any existing room
      if (socket.currentRoom && socket.currentRoom !== roomId) {
        leaveCurrentRoom(socket.currentRoom);
      }

      // Auto-create room if it doesn't exist yet
      if (!rooms.has(roomId)) {
        createRoomData({ id: roomId, name: roomId }, socket.user);
      }

      const room = rooms.get(roomId);
      socket.currentRoom = roomId;
      socket.join(roomId);

      const participantInfo = {
        id: socket.user.id,
        name: socket.user.name,
        avatar: socket.user.avatar,
        socketId: socket.id,
      };

      room.participants.set(socket.id, participantInfo);

      // Send initial full room state to the newly joined client
      socket.emit('room-state', {
        roomId: room.id,
        room: {
          id: room.id,
          name: room.name,
          topic: room.topic,
          host: room.host,
        },
        participants: Array.from(room.participants.values()),
        messages: room.messages,
        timerState: { ...room.timer },
      });

      // Notify others in the room
      const allParticipants = Array.from(room.participants.values());
      io.to(roomId).emit('participants-update', allParticipants);

      const joinMsg = {
        id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'system',
        text: `${socket.user.name} joined the room 👋`,
        timestamp: Date.now(),
      };
      room.messages.push(joinMsg);
      if (room.messages.length > 100) room.messages.shift();
      io.to(roomId).emit('new-message', joinMsg);

      io.emit('rooms-list-update', getRoomsList());
    });

    // EVENT: leave-room
    socket.on('leave-room', ({ roomId }) => {
      const targetRoom = roomId || socket.currentRoom;
      if (targetRoom) {
        leaveCurrentRoom(targetRoom);
        socket.currentRoom = null;
      }
    });

    // EVENT: send-message
    socket.on('send-message', ({ roomId, text }) => {
      const targetRoomId = roomId || socket.currentRoom;
      const room = rooms.get(targetRoomId);
      if (!room || !text || !text.trim()) return;

      const message = {
        id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'user',
        userId: socket.user.id,
        name: socket.user.name,
        text: text.trim().slice(0, 500),
        timestamp: Date.now(),
      };

      room.messages.push(message);
      if (room.messages.length > 100) room.messages.shift();

      io.to(targetRoomId).emit('new-message', message);
    });

    // EVENT: timer-start
    socket.on('timer-start', ({ roomId }) => {
      const targetRoomId = roomId || socket.currentRoom;
      const room = rooms.get(targetRoomId);
      if (!room) return;

      room.timer.running = true;
      io.to(targetRoomId).emit('timer-state', { ...room.timer });
    });

    // EVENT: timer-pause
    socket.on('timer-pause', ({ roomId }) => {
      const targetRoomId = roomId || socket.currentRoom;
      const room = rooms.get(targetRoomId);
      if (!room) return;

      room.timer.running = false;
      io.to(targetRoomId).emit('timer-state', { ...room.timer });
    });

    // EVENT: timer-reset
    socket.on('timer-reset', ({ roomId }) => {
      const targetRoomId = roomId || socket.currentRoom;
      const room = rooms.get(targetRoomId);
      if (!room) return;

      room.timer.running = false;
      room.timer.secondsLeft = room.timer.mode === 'focus' ? 25 * 60 : 5 * 60;
      io.to(targetRoomId).emit('timer-state', { ...room.timer });
    });

    // EVENT: timer-switch-mode
    socket.on('timer-switch-mode', ({ roomId, mode }) => {
      const targetRoomId = roomId || socket.currentRoom;
      const room = rooms.get(targetRoomId);
      if (!room) return;

      const validMode = mode === 'break' ? 'break' : 'focus';
      room.timer.mode = validMode;
      room.timer.running = false;
      room.timer.secondsLeft = validMode === 'focus' ? 25 * 60 : 5 * 60;
      io.to(targetRoomId).emit('timer-state', { ...room.timer });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      if (socket.currentRoom) {
        leaveCurrentRoom(socket.currentRoom);
      }
    });
  });

  return io;
};

module.exports = {
  initSocket,
  getRoomsList,
  createRoomData,
  getIO: () => ioInstance,
};
