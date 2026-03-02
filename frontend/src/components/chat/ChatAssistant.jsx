import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../services/api';
import { useNotifications } from '../../hooks/useNotifications';
import '../../styles/ChatAssistant.css';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { showNotification } = useNotifications();

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: (
            <>
              <p>Hello! I'm your AI study assistant. I can help you with:</p>
              <ul>
                <li>📚 Explaining difficult concepts</li>
                <li>🎯 Solving practice problems</li>
                <li>📊 Study plan suggestions</li>
                <li>⏰ Time management tips</li>
              </ul>
              <p>What would you like to know today?</p>
            </>
          ),
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      content: inputValue,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(inputValue);
      
      const aiMessage = {
        id: Date.now() + 1,
        content: response,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      showNotification('Failed to get response from AI assistant', 'error');
      
      const errorMessage = {
        id: Date.now() + 1,
        content: "I'm having trouble connecting. Please try again later.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = async (question) => {
    const userMessage = {
      id: Date.now(),
      content: question,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(question);
      
      const aiMessage = {
        id: Date.now() + 1,
        content: response,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      showNotification('Failed to get response from AI assistant', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    { text: 'Explain quantum physics basics', label: '🤔 Explain a concept' },
    { text: 'Solve this integration problem', label: '🧮 Solve a problem' },
    { text: 'Suggest study schedule for JEE', label: '📅 Study plan help' }
  ];

  return (
    <div className="ai-assistant">
      <button 
        className="chat-toggle-btn btn-animated" 
        onClick={toggleChat}
        aria-label="Open chat assistant"
      >
        <i className="fas fa-robot"></i>
        <span className="btn-text">Study Assistant</span>
        <span className="notification-dot"></span>
      </button>

      <div className={`chat-window ${isOpen ? 'active' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <i className="fas fa-robot"></i>
            <div className="chat-info">
              <h4 className="chat-name">StudyBuddy AI</h4>
              <span className="status">Online • Ready to help</span>
            </div>
          </div>
          <button className="close-chat" onClick={toggleChat} aria-label="Close chat">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender}-message`}>
              <div className="message-avatar">
                <i className={`fas ${message.sender === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
              </div>
              <div className="message-content">
                {typeof message.content === 'string' ? (
                  <p dangerouslySetInnerHTML={{ 
                    __html: message.content
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }} />
                ) : (
                  message.content
                )}
                <span className="message-time">{message.time}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai-message typing-indicator">
              <div className="message-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="message-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-actions">
          {quickQuestions.map((q, index) => (
            <button 
              key={index}
              className="quick-btn btn-animated" 
              onClick={() => handleQuickQuestion(q.text)}
            >
              {q.label}
            </button>
          ))}
        </div>

        <div className="chat-input-container">
          <div className="chat-input">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about JEE/NEET preparation..." 
              maxLength="500"
              aria-label="Type your message"
            />
            <button 
              className="send-btn btn-animated" 
              onClick={handleSendMessage}
              aria-label="Send message"
              disabled={!inputValue.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <div className="input-hint">
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;