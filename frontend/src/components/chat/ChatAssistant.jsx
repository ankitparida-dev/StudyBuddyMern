import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/ChatAssistant.css';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close chat
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Toggle chat
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setShowSessions(false);
    }
  }, [isOpen]);

  // Handle send message
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    
    if (!trimmedInput || sending) return;
    
    const message = trimmedInput;
    setInputValue('');
    setIsTyping(true);
    
    try {
      await sendMessage(message);
    } catch (err) {
      showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, sending, sendMessage, showNotification]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

  // Handle new chat
  const handleNewChat = useCallback(async () => {
    await createNewSession();
    setShowSessions(false);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [createNewSession]);

  // Handle quick question
  const handleQuickQuestion = useCallback(async (question) => {
    setInputValue(question);
    setTimeout(() => {
      handleSendMessage({ preventDefault: () => {} });
    }, 100);
  }, [handleSendMessage]);

  // Format time
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Get suggestion questions
  const suggestionQuestions = useMemo(() => {
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
  }, [contextData]);

  // Format mathematical content
  const formatMathematicalContent = useCallback((content) => {
    if (!content) return '';
    
    const symbols = {
      '∫': '∫',
      '∑': '∑',
      '∏': '∏',
      '√': '√',
      'π': 'π',
      'θ': 'θ',
      'α': 'α',
      'β': 'β',
      'γ': 'γ',
      'Δ': 'Δ',
      '∞': '∞',
      '→': '→',
      '≈': '≈',
      '≠': '≠',
      '≤': '≤',
      '≥': '≥'
    };

    let formatted = content;
    Object.entries(symbols).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(key, 'g'), value);
    });

    return formatted;
  }, []);

  // Render formatted message content
  const renderFormattedContent = useCallback((content) => {
    if (!content) return null;
    
    const formattedContent = formatMathematicalContent(content);
    const lines = formattedContent.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return <p className="text-line">Empty message</p>;
    }

    const elements = [];
    let isList = false;
    let listItems = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Formula detection
      if (/[=∫∑lim→dxdt]/.test(trimmedLine) && !trimmedLine.startsWith('-')) {
        if (isList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="formatted-list">
              {listItems.map((item, i) => (
                <li key={i} className="bullet-item">{item}</li>
              ))}
            </ul>
          );
          listItems = [];
          isList = false;
        }
        elements.push(
          <div key={`formula-${index}`} className="formula-block">
            {trimmedLine}
          </div>
        );
        return;
      }

      // Bullet points
      if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        isList = true;
        listItems.push(trimmedLine.substring(1).trim());
        return;
      }

      // Numbered lists
      if (/^\d+\./.test(trimmedLine)) {
        isList = true;
        listItems.push(trimmedLine);
        return;
      }

      // Flush list if exists
      if (isList && listItems.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="formatted-list">
            {listItems.map((item, i) => (
              <li key={i} className={/^\d+\./.test(item) ? 'numbered-item' : 'bullet-item'}>
                {item}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        isList = false;
      }

      // Bold text
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={`text-${index}`} className="text-line">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
        return;
      }

      // Italic text
      if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*.*?\*)/g);
        elements.push(
          <p key={`text-${index}`} className="text-line">
            {parts.map((part, j) => {
              if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={j}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </p>
        );
        return;
      }

      // Regular text
      elements.push(
        <p key={`text-${index}`} className="text-line">{trimmedLine}</p>
      );
    });

    // Flush remaining list
    if (isList && listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="formatted-list">
          {listItems.map((item, i) => (
            <li key={i} className={/^\d+\./.test(item) ? 'numbered-item' : 'bullet-item'}>
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return <div className="formatted-response">{elements}</div>;
  }, [formatMathematicalContent]);

  return (
    <div className="ai-assistant">
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle-btn btn-animated ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
        title="Study Assistant"
      >
        <i className="fas fa-robot"></i>
        <span className="btn-text">Study Assistant</span>
        {!isOpen && messages.length > 1 && <span className="notification-dot" />}
      </button>

      {/* Chat Window */}
      <div 
        className={`chat-window ${isOpen ? 'active' : ''} ${showSessions ? 'sessions-open' : ''}`}
        role="dialog"
        aria-label="Chat assistant"
      >
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-title">
            <i className="fas fa-robot" />
            <div className="chat-info">
              <h4 className="chat-name">StudyBuddy AI</h4>
              <span className="status">
                {sending || isTyping ? 'Typing...' : 'Online • Ready to help'}
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button 
              className={`icon-btn ${showSessions ? 'active' : ''}`}
              onClick={() => setShowSessions(prev => !prev)}
              aria-label="Chat history"
              title="Chat history"
            >
              <i className="fas fa-history" />
            </button>
            <button 
              className="close-chat" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Split View */}
        <div className="chat-split-view">
          {/* Sessions Sidebar */}
          {showSessions && (
            <div className="chat-sessions-sidebar">
              <div className="sessions-header">
                <h4>Chat History</h4>
                <button 
                  className="btn-icon" 
                  onClick={handleNewChat} 
                  title="New chat"
                  aria-label="New chat"
                >
                  <i className="fas fa-plus" />
                </button>
              </div>
              <div className="sessions-list">
                {sessions.length === 0 ? (
                  <div className="no-sessions">
                    <i className="fas fa-comment-slash" />
                    <p>No chats yet</p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={handleNewChat}
                    >
                      Start a conversation
                    </button>
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
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          loadSession(session._id);
                          setShowSessions(false);
                        }
                      }}
                    >
                      <i className="fas fa-comment" />
                      <div className="session-info">
                        <div className="session-title">{session.title || 'Untitled'}</div>
                        <div className="session-date">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button 
                        className="delete-session"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this chat?')) {
                            deleteSession(session._id);
                          }
                        }}
                        aria-label="Delete chat"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {sessions.length > 0 && (
                <button 
                  className="clear-all-btn" 
                  onClick={() => {
                    if (window.confirm('Clear all chat history?')) {
                      clearAllChats();
                    }
                  }}
                >
                  <i className="fas fa-trash-alt" /> Clear All
                </button>
              )}
            </div>
          )}

          {/* Messages Area */}
          <div className="chat-main-area">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <i className="fas fa-robot" />
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
                        {contextData.weakTopics.slice(0, 4).map((t, i) => (
                          <span key={i} className="topic-tag">{t.topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`message ${msg.role}-message`}
                    role="article"
                  >
                    <div className="message-avatar">
                      <i className={`fas fa-${msg.role === 'user' ? 'user' : 'robot'}`} />
                    </div>
                    <div className="message-content">
                      {msg.role === 'assistant' ? (
                        renderFormattedContent(msg.content)
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
              
              {(sending || isTyping) && (
                <div className="message ai-message">
                  <div className="message-avatar">
                    <i className="fas fa-robot" />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="error-message" role="alert">
                  <i className="fas fa-exclamation-circle" />
                  <span>{error}</span>
                  <button 
                    className="retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 0 && (
              <div className="quick-questions">
                {suggestionQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(q)}
                    disabled={sending || isTyping}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form className="chat-input-container" onSubmit={handleSendMessage}>
              <div className="chat-input">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your studies..."
                  disabled={sending}
                  maxLength="500"
                  aria-label="Chat input"
                />
                <button 
                  type="submit" 
                  className="send-btn"
                  disabled={!inputValue.trim() || sending}
                  aria-label="Send message"
                >
                  {sending ? (
                    <i className="fas fa-spinner fa-spin" />
                  ) : (
                    <i className="fas fa-paper-plane" />
                  )}
                </button>
              </div>
              <div className="input-hint">
                <span>Press Enter to send</span>
                {inputValue.length > 0 && (
                  <span className="char-count">{inputValue.length}/500</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;