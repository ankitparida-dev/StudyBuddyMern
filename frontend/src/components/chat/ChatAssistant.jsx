import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/ChatAssistant.css';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);
  const { showNotification } = useNotifications();
  
  const {
    sessions,
    currentSession,
    messages,
    sending,
    error,
    contextData,
    createNewSession,
    loadSession,
    sendMessage,
    deleteSession,
    clearAllChats
  } = useChat();

  // Debug logs for input value changes
  useEffect(() => {
    console.log('📝 Input value changed:', inputValue);
    console.log('🔘 Send button should be:', !inputValue.trim() || sending ? 'disabled' : 'enabled');
  }, [inputValue, sending]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    console.log('Toggling chat:', !isOpen);
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowSessions(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;
    
    const message = inputValue;
    console.log('📤 Sending message:', message);
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleNewChat = async () => {
    await createNewSession();
    setShowSessions(false);
  };

  const handleQuickQuestion = async (question) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage({ preventDefault: () => {} }), 100);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSuggestionQuestions = () => {
    const weakTopics = contextData?.weakTopics || [];
    
    const suggestions = [
      'How can I improve my study efficiency?',
      'What are the best revision techniques?',
      'Create a study plan for me',
      'How to stay motivated while studying?'
    ];

    if (weakTopics.length > 0) {
      suggestions.unshift(`How can I improve in ${weakTopics[0].topic}?`);
    }

    return suggestions.slice(0, 4);
  };

  // Function to format mathematical expressions
  const formatMathematicalContent = (content) => {
    // Handle integration formulas
    let formatted = content
      .replace(/∫/g, '∫') // Integral symbol
      .replace(/∑/g, '∑') // Summation symbol
      .replace(/∏/g, '∏') // Product symbol
      .replace(/√/g, '√') // Square root symbol
      .replace(/π/g, 'π') // Pi symbol
      .replace(/θ/g, 'θ') // Theta symbol
      .replace(/α/g, 'α') // Alpha symbol
      .replace(/β/g, 'β') // Beta symbol
      .replace(/γ/g, 'γ') // Gamma symbol
      .replace(/Δ/g, 'Δ') // Delta symbol
      .replace(/∞/g, '∞'); // Infinity symbol

    return formatted;
  };

  // Function to render formatted message content
  const renderFormattedContent = (content) => {
    if (!content) return null;
    
    // First, format mathematical symbols
    const formattedContent = formatMathematicalContent(content);
    
    // Split by lines and process each line
    return formattedContent.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines but add spacing
      if (!trimmedLine) {
        return <br key={i} />;
      }
      
      // Check if line contains a formula (has =, ∫, ∑, etc.)
      if (trimmedLine.includes('=') || 
          trimmedLine.includes('∫') || 
          trimmedLine.includes('∑') ||
          trimmedLine.includes('lim') ||
          trimmedLine.includes('→') ||
          trimmedLine.includes('dx') ||
          trimmedLine.includes('dt')) {
        return (
          <div key={i} className="formula-block">
            {trimmedLine}
          </div>
        );
      }
      
      // Check for bullet points
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        return (
          <li key={i} className="bullet-item">
            {trimmedLine.substring(1).trim()}
          </li>
        );
      }
      
      // Check for numbered lists
      if (/^\d+\./.test(trimmedLine)) {
        return (
          <li key={i} className="numbered-item">
            {trimmedLine}
          </li>
        );
      }
      
      // Check for bold text (surrounded by **)
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="text-line">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
      
      // Check for italic text (surrounded by *)
      if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*.*?\*)/g);
        return (
          <p key={i} className="text-line">
            {parts.map((part, j) => {
              if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={j}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </p>
        );
      }
      
      // Regular text
      return <p key={i} className="text-line">{trimmedLine}</p>;
    });
  };

  return (
    <div className="ai-assistant">
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle-btn btn-animated ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label="Open chat assistant"
      >
        <i className="fas fa-robot"></i>
        <span className="btn-text">Study Assistant</span>
        {!isOpen && messages.length > 1 && <span className="notification-dot"></span>}
      </button>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'active' : ''} ${showSessions ? 'sessions-open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <i className="fas fa-robot"></i>
            <div className="chat-info">
              <h4 className="chat-name">StudyBuddy AI</h4>
              <span className="status">
                {sending ? 'Typing...' : 'Online • Ready to help'}
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button 
              className={`icon-btn ${showSessions ? 'active' : ''}`}
              onClick={() => setShowSessions(!showSessions)}
              title="Chat history"
            >
              <i className="fas fa-history"></i>
            </button>
            <button 
              className="close-chat" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Split View: Sessions Sidebar + Messages */}
        <div className="chat-split-view">
          {/* Sessions Sidebar */}
          {showSessions && (
            <div className="chat-sessions-sidebar">
              <div className="sessions-header">
                <h4>Chat History</h4>
                <button className="btn-icon" onClick={handleNewChat} title="New chat">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <div className="sessions-list">
                {sessions.length === 0 ? (
                  <div className="no-sessions">
                    <i className="fas fa-comment-slash"></i>
                    <p>No chats yet</p>
                  </div>
                ) : (
                  sessions.map(session => (
                    <div
                      key={session._id}
                      className={`session-item ${currentSession?._id === session._id ? 'active' : ''}`}
                      onClick={() => {
                        loadSession(session._id);
                        setShowSessions(false);
                      }}
                    >
                      <i className="fas fa-comment"></i>
                      <div className="session-info">
                        <div className="session-title">{session.title}</div>
                        <div className="session-date">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button 
                        className="delete-session"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session._id);
                        }}
                        title="Delete chat"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
              {sessions.length > 0 && (
                <button className="clear-all-btn" onClick={clearAllChats}>
                  <i className="fas fa-trash-alt"></i> Clear All
                </button>
              )}
            </div>
          )}

          {/* Messages Area */}
          <div className="chat-main-area">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <i className="fas fa-robot"></i>
                  <h3>Hi! I'm your AI study assistant</h3>
                  <p>I can help you with:</p>
                  <ul>
                    <li>📚 Explaining difficult concepts</li>
                    <li>🎯 Solving practice problems</li>
                    <li>📊 Study plan suggestions</li>
                    <li>⏰ Time management tips</li>
                  </ul>
                  {contextData?.weakTopics?.length > 0 && (
                    <div className="context-hint">
                      <p>Based on your recent practice, you might want help with:</p>
                      <div className="weak-topics">
                        {contextData.weakTopics.map((t, i) => (
                          <span key={i} className="topic-tag">{t.topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}-message`}>
                    <div className="message-avatar">
                      <i className={`fas fa-${msg.role === 'user' ? 'user' : 'robot'}`}></i>
                    </div>
                    <div className="message-content">
                      {msg.role === 'assistant' ? (
                        <div className="formatted-response">
                          {renderFormattedContent(msg.content)}
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
              
              {sending && (
                <div className="message ai-message">
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 0 && (
              <div className="quick-questions">
                {getSuggestionQuestions().map((q, i) => (
                  <button
                    key={i}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(q)}
                    disabled={sending}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area - FIXED with better event handling */}
            <form className="chat-input-container" onSubmit={handleSendMessage}>
              <div className="chat-input">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setInputValue(newValue);
                    console.log('✏️ Input changed to:', newValue);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  disabled={sending}
                  maxLength="500"
                />
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!inputValue.trim() || sending}
                  style={{
                    opacity: (!inputValue.trim() || sending) ? 0.5 : 1,
                    cursor: (!inputValue.trim() || sending) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-paper-plane"></i>
                  )}
                </button>
              </div>
              <div className="input-hint">
                <span>Press Enter to send</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;