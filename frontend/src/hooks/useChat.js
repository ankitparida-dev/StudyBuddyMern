import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { chatAPI, practiceAPI } from '../services/api';

export const useChat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [contextData, setContextData] = useState(null);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const abortControllerRef = useRef(null);
  const messageCache = useRef(new Map());

  // Load chat history and context on mount
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      return undefined;
    }

    loadHistory();
    loadContextData();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load user context for smarter responses
  const loadContextData = useCallback(async () => {
    try {
      const [practice, topicsResponse] = await Promise.all([
        practiceAPI.getStats(30).catch(() => null),
        practiceAPI.getTopics().catch(() => [])
      ]);
      const topics = Array.isArray(topicsResponse)
        ? topicsResponse
        : Object.entries(topicsResponse?.topics || {}).map(([topic, stats]) => ({ topic, ...stats }));
      
      setContextData({
        practice: practice?.overview || {},
        weakTopics: (topics || []).filter(t => t?.accuracy < 60).slice(0, 5),
        subjectPerformance: practice?.subjectWise || {},
        recentActivity: practice?.recent || [],
        totalStudyTime: practice?.overview?.totalTime || 0
      });
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  }, []);

  // Load all chat sessions
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await chatAPI.getHistory();
      const sessionsList = data?.sessions || [];
      setSessions(sessionsList);
      
      // Load most recent session if exists and no current session
      if (sessionsList.length > 0 && !currentSession) {
        const mostRecent = sessionsList.reduce((a, b) => 
          new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
        );
        await loadSession(mostRecent._id);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError(error?.message || 'Failed to load history');
      
      // Try to load from localStorage as fallback
      const cachedSessions = localStorage.getItem('chatSessions');
      if (cachedSessions) {
        try {
          const parsed = JSON.parse(cachedSessions);
          setSessions(parsed);
        } catch (e) {
          console.error('Failed to parse cached sessions:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Load a specific chat session
  const loadSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      console.error('No session ID provided');
      return;
    }
    
    // Check cache first
    if (messageCache.current.has(sessionId)) {
      const cached = messageCache.current.get(sessionId);
      setCurrentSession(cached.session);
      setMessages(cached.messages);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const session = await chatAPI.getSession(sessionId);
      
      if (session) {
        setCurrentSession(session);
        setMessages(session.messages || []);
        
        // Cache the session
        messageCache.current.set(sessionId, {
          session,
          messages: session.messages || []
        });
        
        // Update unread count
        const unread = (session.messages || []).filter(m => !m.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setError(error?.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new chat session
  const createNewSession = useCallback(async (title = 'New Chat') => {
    try {
      setLoading(true);
      setError(null);
      
      const newSession = await chatAPI.createSession(title);
      
      if (newSession) {
        setSessions(prev => [newSession, ...(prev || [])]);
        setCurrentSession(newSession);
        setMessages([]);
        setUnreadCount(0);
        
        // Save to localStorage
        localStorage.setItem('chatSessions', JSON.stringify([newSession, ...sessions]));
        
        return newSession;
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      setError(error?.message || 'Failed to create session');
      
      // Fallback: create local session
      const fallbackSession = {
        _id: `local_${Date.now()}`,
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLocal: true
      };
      
      setSessions(prev => [fallbackSession, ...(prev || [])]);
      setCurrentSession(fallbackSession);
      setMessages([]);
      
      return fallbackSession;
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  // Send a message
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim() || sending) return null;

    // Create temporary user message
    const userMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prev => [...(prev || []), userMessage]);
    setSending(true);
    setError(null);
    setTyping(true);

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

      // Abort previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Send to backend with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const sendPromise = chatAPI.sendMessage(content.trim(), sessionId);
      const response = await Promise.race([sendPromise, timeoutPromise]);
      
      // Update user message status
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, status: 'sent' } : m
      ));
      
      // Add AI response
      if (response?.message) {
        const aiMessage = {
          ...response.message,
          id: response.message.id || `ai_${Date.now()}`,
          status: 'received'
        };
        setMessages(prev => [...(prev || []), aiMessage]);
        
        // Cache the updated messages
        if (sessionId) {
          const cached = messageCache.current.get(sessionId);
          if (cached) {
            messageCache.current.set(sessionId, {
              ...cached,
              messages: [...cached.messages, userMessage, aiMessage]
            });
          }
        }
      }
      
      // Update sessions list
      await loadHistory();
      
      return response;
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error?.message || 'Failed to send message');
      
      // Update user message status to error
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, status: 'error' } : m
      ));
      
      throw error;
    } finally {
      setSending(false);
      setTyping(false);
      abortControllerRef.current = null;
    }
  }, [currentSession, sending, createNewSession, loadHistory]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    
    if (!window.confirm('Delete this chat session?')) return;
    
    try {
      await chatAPI.deleteSession(sessionId);
      
      // Remove from cache
      messageCache.current.delete(sessionId);
      
      // Update sessions list
      setSessions(prev => (prev || []).filter(s => s?._id !== sessionId));
      
      // Clear current session if deleted
      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
        setUnreadCount(0);
      }
      
      // Update localStorage
      const updatedSessions = sessions.filter(s => s?._id !== sessionId);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
      
    } catch (error) {
      console.error('Failed to delete session:', error);
      setError(error?.message || 'Failed to delete session');
    }
  }, [currentSession, sessions]);

  // Clear all chats
  const clearAllChats = useCallback(async () => {
    if (!window.confirm('Delete all chat history? This cannot be undone.')) return;
    
    try {
      await chatAPI.clearAll();
      
      // Clear cache
      messageCache.current.clear();
      
      setSessions([]);
      setCurrentSession(null);
      setMessages([]);
      setUnreadCount(0);
      
      // Clear localStorage
      localStorage.removeItem('chatSessions');
      
    } catch (error) {
      console.error('Failed to clear chats:', error);
      setError(error?.message || 'Failed to clear chats');
    }
  }, []);

  // Rename session
  const renameSession = useCallback(async (sessionId, newTitle) => {
    if (!sessionId || !newTitle?.trim()) return;
    
    try {
      await chatAPI.renameSession(sessionId, newTitle.trim());
      
      setSessions(prev => (prev || []).map(s => 
        s?._id === sessionId ? { ...s, title: newTitle.trim() } : s
      ));
      
      if (currentSession?._id === sessionId) {
        setCurrentSession(prev => ({ ...prev, title: newTitle.trim() }));
      }
      
    } catch (error) {
      console.error('Failed to rename session:', error);
      setError(error?.message || 'Failed to rename session');
    }
  }, [currentSession]);

  // Get session title suggestions
  const getTitleSuggestions = useCallback((message) => {
    if (!message) return [];
    
    const words = message.split(' ');
    const suggestions = [];
    
    if (words.length > 5) {
      suggestions.push(words.slice(0, 5).join(' ') + '...');
    }
    
    if (message.includes('?')) {
      suggestions.push('Question about ' + message.split('?')[0].slice(0, 30));
    }
    
    if (message.toLowerCase().includes('help')) {
      suggestions.push('Help request');
    }
    
    return suggestions;
  }, []);

  // Memoized computed values
  const totalMessages = useMemo(() => messages.length, [messages]);
  const hasMessages = useMemo(() => messages.length > 0, [messages]);
  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);
  const isTyping = useMemo(() => typing, [typing]);

  return {
    sessions: sessions || [],
    currentSession,
    messages: messages || [],
    loading,
    sending,
    error,
    contextData,
    unreadCount,
    totalMessages,
    hasMessages,
    lastMessage,
    isTyping,
    loadHistory,
    loadSession,
    createNewSession,
    sendMessage,
    deleteSession,
    clearAllChats,
    renameSession,
    getTitleSuggestions
  };
};