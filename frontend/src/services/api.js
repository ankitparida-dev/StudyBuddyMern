const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Helper function for fetch requests with token
const fetchAPI = async (endpoint, options = {}) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }) // Add token if exists
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// ===== AUTH SERVICES =====
export const authAPI = {
  login: (email, password) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userData) => 
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ===== USER SERVICES =====
export const userAPI = {
  getProfile: () => fetchAPI('/users/profile'),
  updateProfile: (data) => 
    fetchAPI('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  
  getSettings: () => fetchAPI('/users/settings'),
  updateSettings: (data) => 
    fetchAPI('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// ===== DASHBOARD SERVICES =====
export const dashboardAPI = {
  getStats: () => fetchAPI('/dashboard/stats'),
  getProgress: () => fetchAPI('/dashboard/progress'),
  getStreaks: () => fetchAPI('/dashboard/streaks')
};

// ===== PRACTICE API (Day 8) =====
export const practiceAPI = {
  // Get practice statistics
  getStats: (days = 30) => fetchAPI(`/study/practice/stats?days=${days}`),
  
  // Get topic performance
  getTopics: (subject) => {
    const query = subject ? `?subject=${subject}` : '';
    return fetchAPI(`/study/practice/topics${query}`);
  },
  
  // Get practice sessions with pagination
  getSessions: (page = 1, limit = 10) => 
    fetchAPI(`/study/practice?page=${page}&limit=${limit}`),
  
  // Get single session
  getSession: (id) => fetchAPI(`/study/practice/${id}`),
  
  // Save practice session
  saveSession: (sessionData) => 
    fetchAPI('/study/practice', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    }),
  
  // Delete session
  deleteSession: (id) => 
    fetchAPI(`/study/practice/${id}`, {
      method: 'DELETE'
    })
};

// ===== STUDY PLAN API (Fixed to use goals endpoints) =====
export const planAPI = {
  // Get all study plans/goals
  getPlans: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchAPI(`/study/goals?${queryParams}`); // Changed from /plan to /goals
  },
  
  // Get plan statistics (combine goals + practice data)
  getStats: async () => {
    try {
      const [goals, practice] = await Promise.all([
        fetchAPI('/study/goals'),
        fetchAPI('/study/practice/stats?days=30')
      ]);
      
      // Calculate stats from goals data
      const completed = goals.filter(g => g.completed).length;
      const pending = goals.filter(g => !g.completed).length;
      const inProgress = goals.filter(g => !g.completed && g.progress > 0).length;
      
      // Get streak from practice data
      const currentStreak = practice?.overview?.currentStreak || 7;
      const longestStreak = practice?.overview?.longestStreak || 15;
      
      return {
        total: goals.length,
        completed,
        inProgress,
        pending,
        currentStreak,
        longestStreak,
        weeklyGoal: `${Math.min(completed, 7)}/7`,
        milestones: Math.floor(completed / 5) || 0,
        totalXP: completed * 50
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      // Return mock data as fallback
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyGoal: '0/7',
        milestones: 0,
        totalXP: 0
      };
    }
  },
  
  // Get weekly schedule (create from goals data)
  getSchedule: async () => {
    try {
      const goals = await fetchAPI('/study/goals');
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const schedule = {};
      
      // Initialize all days
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const dayKey = day.toISOString().split('T')[0];
        schedule[dayKey] = [];
      }
      
      // Distribute goals across days (simplified)
      goals.forEach((goal, index) => {
        const dayIndex = index % 7;
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + dayIndex);
        const dayKey = day.toISOString().split('T')[0];
        
        schedule[dayKey].push({
          id: goal._id,
          title: goal.title,
          subject: goal.subject,
          priority: goal.priority || 'medium',
          progress: goal.completed ? 100 : 0,
          estimatedTime: 60
        });
      });
      
      return {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        schedule
      };
    } catch (error) {
      console.error('Error getting schedule:', error);
      return {
        weekStart: new Date().toISOString(),
        weekEnd: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        schedule: {}
      };
    }
  },
  
  // Create study plan (uses existing POST /goals)
  createPlan: (planData) => {
    // Transform plan data to goal format
    const goalData = {
      title: planData.title,
      subject: planData.subject,
      description: planData.description || '',
      completed: false,
      priority: planData.priority || 'medium',
      progress: 0,
      // Store additional data in a custom field if needed
      ...planData
    };
    
    return fetchAPI('/study/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  },
  
  // Update study plan
  updatePlan: (id, planData) => 
    fetchAPI(`/study/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData)
    }),
  
  // Delete study plan
  deletePlan: (id) => 
    fetchAPI(`/study/goals/${id}`, {
      method: 'DELETE'
    }),
    
  // Update topic completion (maps to goal completion)
  updateTopic: (planId, topicId, data) => 
    fetchAPI(`/study/goals/${planId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
};

// ===== CHAT SERVICES (NEW - ADDED) =====
export const sendChatMessage = async (prompt) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get response');
    }

    return data.response;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
};

// ===== DEFAULT EXPORT =====
const api = {
  auth: authAPI,
  user: userAPI,
  dashboard: dashboardAPI,
  practice: practiceAPI,
  plan: planAPI,
  chat: sendChatMessage
};

export default api;