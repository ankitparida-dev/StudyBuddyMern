import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { documentApi } from '../../utils/api';

const QUICK_PROMPTS = [
  'Summarize all the key formulas in these notes',
  'What are the core definitions I need to memorize?',
  'Generate 3 practice exam questions from this document',
  'Explain the most challenging concept step-by-step',
];

export default function RagChat({ document }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your AI tutor for **"${document.title}"**. Ask me anything about these notes, and I'll answer citing the exact pages and excerpts!`,
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await documentApi.ask(document._id, query);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve answer');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error while searching your notes. Please make sure the backend is active and try again.',
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSources = (msgId) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat cleared! Ask me anything about **"${document.title}"**.`,
        sources: [],
      },
    ]);
  };

  return (
    <div className="bg-white dark:bg-sb-dark-card rounded-2xl border border-gray-100 dark:border-sb-dark-border shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-gray-100 dark:border-sb-dark-border flex items-center justify-between bg-gray-50/50 dark:bg-sb-dark-bg/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-sb-blue flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              Ask Notes AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                RAG Grounded
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Retrieves semantic chunks from "{document.title}"
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-sb-dark-border transition"
          title="Clear chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-sb-blue text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {msg.role === 'user' ? <User size={15} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sb-blue text-white rounded-tr-none'
                  : 'bg-gray-50 dark:bg-sb-dark-bg/80 border border-gray-100 dark:border-sb-dark-border text-gray-800 dark:text-gray-200 rounded-tl-none space-y-3'
              }`}
            >
              <div className="whitespace-pre-line font-normal">{msg.content}</div>

              {/* Cited Sources Accordion (RAG citations) */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-gray-200/60 dark:border-sb-dark-border/60">
                  <button
                    onClick={() => toggleSources(msg.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-sb-blue hover:text-blue-700 dark:hover:text-blue-400 transition"
                  >
                    <BookOpen size={13} />
                    <span>
                      {msg.sources.length} Verified Note Source{msg.sources.length > 1 ? 's' : ''} Cited
                    </span>
                    {expandedSources[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {expandedSources[msg.id] && (
                    <div className="mt-2.5 space-y-2">
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-xl bg-white dark:bg-sb-dark-card border border-gray-200 dark:border-sb-dark-border text-xs text-gray-600 dark:text-gray-300 shadow-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                            <span className="text-sb-blue">
                              Page {src.pageNumber || 1}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {(src.similarity * 100).toFixed(0)}% Match
                            </span>
                          </div>
                          <p className="line-clamp-3 italic font-serif text-[11px] text-gray-700 dark:text-gray-300">
                            "{src.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="rounded-2xl rounded-tl-none p-4 bg-gray-50 dark:bg-sb-dark-bg/80 border border-gray-100 dark:border-sb-dark-border text-xs text-gray-500 flex items-center gap-2">
              <Loader2 size={15} className="animate-spin text-sb-blue" />
              Searching vector embeddings & generating grounded response...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-sb-dark-border bg-gray-50/30 dark:bg-sb-dark-bg/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 flex-shrink-0">
          <Sparkles size={12} className="text-amber-500" />
          Ask:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSend(prompt)}
            className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-sb-dark-card border border-gray-200 dark:border-sb-dark-border text-gray-600 dark:text-gray-300 hover:border-sb-blue hover:text-sb-blue whitespace-nowrap transition flex-shrink-0 shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-100 dark:border-sb-dark-border bg-white dark:bg-sb-dark-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask any question about "${document.title}"...`}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-sb-dark-border bg-gray-50 dark:bg-sb-dark-bg text-gray-900 dark:text-sb-dark-text focus:outline-none focus:ring-2 focus:ring-sb-blue/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-2.5 rounded-xl text-white transition ${
              !input.trim() || loading
                ? 'bg-blue-300 dark:bg-blue-900/40 cursor-not-allowed'
                : 'bg-sb-blue hover:bg-blue-600 shadow-md shadow-blue-500/20 active:scale-95'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

