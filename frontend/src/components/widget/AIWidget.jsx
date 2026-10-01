import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, X, Send, Sparkles, Trash2, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '../../utils/api';
import { storage } from '../../utils/storage';

const QUICK_PROMPTS = [
  { label: "📐 Newton's laws", prompt: "Explain Newton's laws of motion with examples" },
  { label: '🧪 Chemistry formulas', prompt: 'List the most important chemistry formulas for JEE' },
  { label: '📚 7-day study plan', prompt: 'Create a 7-day study plan for JEE preparation' },
  { label: '💡 Weak topics', prompt: 'How do I improve in my weak topics?' },
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm your StudyBuddy AI assistant. Ask me anything about Physics, Chemistry, Math, or Biology. I can also help you plan your studies!",
  timestamp: new Date().toISOString(),
};

export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(() =>
    storage.get('sb_chat_session_id', null)
  );

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = storage.get('sb_chat_messages', null);
    if (Array.isArray(saved) && saved.length > 0) setMessages(saved);
  }, []);

  useEffect(() => {
    if (messages.length > 0) storage.set('sb_chat_messages', messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;

    const userMsg = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await chatApi.send(message, sessionId);
      if (res.sessionId && res.sessionId !== sessionId) {
        setSessionId(res.sessionId);
        storage.set('sb_chat_session_id', res.sessionId);
      }
      const aiMsg = res.message || {
        role: 'assistant',
        content: "I couldn't generate a response. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please check your internet and try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.error(err.message || 'Failed to get AI response');
    } finally {
      setSending(false);
    }
  };

  const clearChat = async () => {
    const ok = window.confirm(
      'Start a new chat? Current conversation will be cleared.'
    );
    if (!ok) return;

    if (sessionId) {
      try {
        await chatApi.deleteSession(sessionId);
      } catch {
        // ignore
      }
    }

    setMessages([WELCOME_MESSAGE]);
    setSessionId(null);
    storage.remove('sb_chat_session_id');
    storage.remove('sb_chat_messages');
    toast.success('Chat cleared');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 bg-sb-yellow w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition z-40 ${
          isOpen ? 'hidden sm:flex' : 'flex'
        }`}
        title="AI Study Buddy"
      >
        <MessageCircle size={22} />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className={`
            fixed z-50 bg-white dark:bg-sb-dark-card flex flex-col overflow-hidden
            border border-gray-100 dark:border-sb-dark-border
            inset-0 sm:inset-auto
            sm:bottom-24 sm:right-6 sm:w-96 sm:h-[32rem] sm:max-h-[calc(100vh-8rem)]
            sm:rounded-2xl sm:shadow-2xl
          `}
        >
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-sb-blue to-sb-teal text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">
                  AI Study Buddy
                </p>
                <p className="text-xs text-white/70 leading-tight">
                  Powered by Gemini
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-white/80 hover:text-white transition p-1"
                title="New chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition p-1"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 p-3 overflow-y-auto space-y-3 bg-sb-bg/30 dark:bg-sb-dark-bg/50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? 'bg-sb-blue text-white rounded-br-md'
                      : 'bg-white text-sb-teal rounded-bl-md shadow-sm dark:bg-sb-dark-bg dark:text-sb-dark-text'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-sb-dark-bg px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && !sending && (
            <div className="px-3 py-2 flex flex-wrap gap-2 border-t border-gray-100 dark:border-sb-dark-border bg-white dark:bg-sb-dark-card shrink-0">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => sendMessage(q.prompt)}
                  className="text-xs px-3 py-1 rounded-full bg-sb-bg hover:bg-sb-blue/10 transition dark:bg-sb-dark-bg dark:text-sb-dark-text"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-2 border-t border-gray-100 dark:border-sb-dark-border flex items-end gap-2 bg-white dark:bg-sb-dark-card shrink-0 pb-safe">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-2 border rounded-xl text-sm outline-none focus:border-sb-blue resize-none max-h-24 dark:bg-sb-dark-bg dark:border-sb-dark-border dark:text-sb-dark-text"
              rows={1}
              disabled={sending}
            />
            <button
              onClick={() => sendMessage()}
              disabled={sending || !input.trim()}
              className="bg-sb-blue text-white p-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-40 shrink-0"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}