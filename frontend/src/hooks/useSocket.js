import { useEffect, useRef, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { config } from '../config';
import { storage } from '../utils/storage';
import { getToken } from '../utils/api';

/**
 * Real Socket.IO hook for Study Rooms.
 * Syncs timer across all participants, streams room messages, and provides live participant list.
 */
export default function useSocket(roomId) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [timerState, setTimerState] = useState({
    mode: 'focus',
    secondsLeft: 25 * 60,
    running: false,
  });

  const currentUser = useMemo(() => {
    return storage.get('sb_user', {});
  }, []);

  const currentUserId = useMemo(() => {
    return currentUser?._id || currentUser?.id || 'self';
  }, [currentUser]);

  useEffect(() => {
    if (!roomId) return;

    const token = getToken();
    const displayName =
      currentUser?.firstName
        ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
        : currentUser?.email?.split('@')[0] || 'You';

    const socketUrl = config.API_URL
      ? config.API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      auth: {
        token,
        userName: displayName,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', {
        roomId,
        user: {
          id: currentUserId,
          name: displayName,
        },
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Received initial full state when joining room
    socket.on('room-state', (data) => {
      if (data.participants) {
        const formatted = data.participants.map((p) => ({
          ...p,
          isSelf: p.id === currentUserId || p.socketId === socket.id,
        }));
        setParticipants(formatted);
      }

      if (data.messages) {
        setMessages(data.messages);
      }

      if (data.timerState) {
        setTimerState(data.timerState);
      }
    });

    // Active participants list updated
    socket.on('participants-update', (participantsList) => {
      const formatted = participantsList.map((p) => ({
        ...p,
        isSelf: p.id === currentUserId || p.socketId === socket.id,
      }));
      setParticipants(formatted);
    });

    // New message (chat or system announcement)
    socket.on('new-message', (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages if any
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    // Timer state updated (started, paused, reset, or mode switched)
    socket.on('timer-state', (newTimerState) => {
      setTimerState(newTimerState);
    });

    // Synchronized second-by-second tick from server
    socket.on('timer-tick', (tickData) => {
      setTimerState((prev) => ({
        ...prev,
        secondsLeft: tickData.secondsLeft,
        running: tickData.running,
        mode: tickData.mode || prev.mode,
      }));
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [roomId, currentUserId, currentUser]);

  // Actions
  const sendMessage = (text) => {
    if (!text || !text.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', {
      roomId,
      text: text.trim(),
    });
  };

  const toggleTimer = () => {
    if (!socketRef.current) return;
    if (timerState.running) {
      socketRef.current.emit('timer-pause', { roomId });
    } else {
      socketRef.current.emit('timer-start', { roomId });
    }
  };

  const resetTimer = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('timer-reset', { roomId });
  };

  const switchMode = (mode) => {
    if (!socketRef.current) return;
    socketRef.current.emit('timer-switch-mode', { roomId, mode });
  };

  return {
    connected,
    participants,
    messages,
    timerState,
    sendMessage,
    toggleTimer,
    resetTimer,
    switchMode,
    currentUserId,
  };
}