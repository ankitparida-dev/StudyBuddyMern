import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! Ask me for formulas or revision tips.' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: 'user', text: input }]);
    const userQuery = input;
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: 'ai', text: `Searching notes for "${userQuery}"...` },
      ]);
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-sb-yellow w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition z-50"
      >
        {isOpen ? <X /> : <MessageCircle />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50">
          <div className="p-3 bg-sb-blue text-white rounded-t-2xl font-semibold flex items-center gap-2">
  <img
    src="/logo.png"
    alt="AI"
    className="w-6 h-6 rounded-full"
  />
  AI Study Buddy
</div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] text-sm ${
                  m.from === 'user' ? 'bg-sb-yellow ml-auto' : 'bg-sb-bg'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-sb-blue text-white p-2 rounded-lg"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}