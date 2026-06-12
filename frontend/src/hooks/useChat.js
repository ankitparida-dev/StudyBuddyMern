import { useState, useEffect, useCallback } from 'react';
import { chatAPI, practiceAPI } from '../services/api';

export const useChat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [contextData, setContextData] = useState(null);

  // Load chat history and context on mount
  useEffect(() => {
    loadHistory();
    loadContextData();
  }, []);

  // Load user context for smarter responses
  const loadContextData = async () => {
    try {
      const [practice, topics] = await Promise.all([
        practiceAPI.getStats(30).catch(() => null),
        practiceAPI.getTopics().catch(() => [])
      ]);
      
      setContextData({
        practice: practice?.overview || {},
        weakTopics: (topics || []).filter(t => t?.accuracy < 60).slice(0, 5),
        subjectPerformance: practice?.subjectWise || {}
      });
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };

  // Load all chat sessions
  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getHistory();
      // Safely access sessions array
      const sessionsList = data?.sessions || [];
      setSessions(sessionsList);
      
      // Load first session if exists
      if (sessionsList.length > 0 && !currentSession) {
        await loadSession(sessionsList[0]._id);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError(error?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Load a specific chat session
  const loadSession = async (sessionId) => {
    if (!sessionId) {
      console.error('No session ID provided');
      return;
    }
    
    try {
      setLoading(true);
      const session = await chatAPI.getSession(sessionId);
      
      // Safely set session and messages
      setCurrentSession(session || null);
      setMessages(session?.messages || []);
    } catch (error) {
      console.error('Failed to load session:', error);
      setError(error?.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  // Create new chat session
  const createNewSession = async (title = 'New Chat') => {
    try {
      setLoading(true);
      const newSession = await chatAPI.createSession(title);
      
      if (newSession) {
        setSessions(prev => [newSession, ...(prev || [])]);
        setCurrentSession(newSession);
        setMessages([]);
        return newSession;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      setError(error?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content) => {
    if (!content?.trim() || sending) return;

    // Create temporary user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...(prev || []), userMessage]);
    setSending(true);
    setError(null);

    try {
      // Create new session if none exists
      let sessionId = currentSession?._id;
      if (!sessionId) {
        const newSession = await createNewSession();
        sessionId = newSession?._id;
      }

      if (!sessionId) {
        throw new Error('Failed to create session');
      }

      // Send to backend
      const response = await chatAPI.sendMessage(content, sessionId);
      
      // Add AI response if it exists
      if (response?.message) {
        setMessages(prev => [...(prev || []), response.message]);
      }
      
      // Update sessions list
      await loadHistory();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error?.message || 'Failed to send message');
      
      // Remove user message on error
      setMessages(prev => (prev || []).filter(m => m !== userMessage));
    } finally {
      setSending(false);
    }
  };

  // Delete a session
  const deleteSession = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(prev => (prev || []).filter(s => s?._id !== sessionId));
      
      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      setError(error?.message || 'Failed to delete session');
    }
  };

  // Clear all chats
  const clearAllChats = async () => {
    if (!window.confirm('Delete all chat history?')) return;
    
    try {
      await chatAPI.clearAll();
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chats:', error);
      setError(error?.message || 'Failed to clear chats');
    }
  };

  return {
    sessions: sessions || [],
    currentSession,
    messages: messages || [],
    loading,
    sending,
    error,
    contextData,
    loadHistory,
    loadSession,
    createNewSession,
    sendMessage,
    deleteSession,
    clearAllChats
  };
};