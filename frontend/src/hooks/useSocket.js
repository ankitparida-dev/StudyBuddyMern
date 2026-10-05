import { useEffect, useRef, useState } from 'react';

/**
 * Placeholder socket hook.
 * Later, this will connect to real Socket.IO backend.
 * For now, it exposes the same API as the real one.
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

  // ---- Simulate connection ----
  useEffect(() => {
    if (!roomId) return;

    // Simulate connecting
    setConnected(false);
    const t = setTimeout(() => setConnected(true), 500);

    // Fake participants
    setParticipants([
      { id: 'me', name: 'You', avatar: 'Y', isSelf: true },
      { id: 'u1', name: 'Ankit', avatar: 'A' },
      { id: 'u2', name: 'Priya', avatar: 'P' },
      { id: 'u3', name: 'Rahul', avatar: 'R' },
    ]);

    // Fake welcome message
    setMessages([
      {
        id: 'sys1',
        type: 'system',
        text: 'Welcome to the room! Study together, stay focused 💪',
      },
      {
        id: 'm1',
        userId: 'u1',
        name: 'Ankit',
        text: 'Hey! Starting with Physics today.',
        timestamp: Date.now() - 60000,
      },
      {
        id: 'm2',
        userId: 'u2',
        name: 'Priya',
        text: 'Good luck! I am revising Chemistry.',
        timestamp: Date.now() - 30000,
      },
    ]);

    return () => {
      clearTimeout(t);
      setConnected(false);
    };
  }, [roomId]);

  // ---- Simulate a ticking timer when "running" ----
  useEffect(() => {
    if (!timerState.running) return;
    const interval = setInterval(() => {
      setTimerState((prev) => {
        if (prev.secondsLeft <= 1) {
          return {
            ...prev,
            running: false,
            secondsLeft: prev.mode === 'focus' ? 5 * 60 : 25 * 60,
            mode: prev.mode === 'focus' ? 'break' : 'focus',
          };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerState.running]);

  // ---- API for the components ----
  const sendMessage = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        userId: 'me',
        name: 'You',
        text: text.trim(),
        timestamp: Date.now(),
      },
    ]);
  };

  const toggleTimer = () => {
    setTimerState((prev) => ({ ...prev, running: !prev.running }));
  };

  const resetTimer = () => {
    setTimerState({
      mode: 'focus',
      secondsLeft: 25 * 60,
      running: false,
    });
  };

  const switchMode = (mode) => {
    setTimerState({
      mode,
      secondsLeft: mode === 'focus' ? 25 * 60 : 5 * 60,
      running: false,
    });
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
  };
}