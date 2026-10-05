import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

export default function RoomChat({ messages, onSend, currentUserId = 'me' }) {
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl shadow flex flex-col h-[400px]">
      {/* Header */}
      <div className="p-3 border-b dark:border-sb-dark-border">
        <h3 className="font-semibold text-sm dark:text-sb-dark-text">
          Room Chat
        </h3>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">
            No messages yet. Say hi 👋
          </p>
        )}

        {messages.map((m) => {
          if (m.type === 'system') {
            return (
              <div key={m.id} className="text-center">
                <p className="text-xs text-gray-400 italic">{m.text}</p>
              </div>
            );
          }

          const isSelf = m.userId === currentUserId;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  isSelf
                    ? 'bg-sb-blue text-white rounded-br-md'
                    : 'bg-sb-bg dark:bg-sb-dark-bg dark:text-sb-dark-text rounded-bl-md'
                }`}
              >
                {!isSelf && (
                  <p className="text-xs font-semibold mb-0.5 opacity-80">
                    {m.name}
                  </p>
                )}
                <p className="break-words">{m.text}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                {formatTime(m.timestamp)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-t dark:border-sb-dark-border flex items-center gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:border-sb-blue dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-sb-blue text-white p-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}