import { config } from '../config';
import { storage } from './storage';

export const getToken = () => storage.get('sb_token', null);

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${config.API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    // Token expired / invalid → clear and bounce to login
    storage.remove('sb_token');
    storage.remove('sb_user');
    storage.remove('sb_authed');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Request failed');
  }

  return payload;
}

// ============================================
// AUTH
// ============================================
export const authApi = {
  register: (data) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  profile: () => apiFetch('/auth/profile'),
};

// ============================================
// LEARNING (Tasks, Sessions, Topics, Tests)
// ============================================
export const learningApi = {
  // Tasks
  tasks: () => apiFetch('/learning/tasks'),
  createTask: (data) =>
    apiFetch('/learning/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) =>
    apiFetch(`/learning/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id) =>
    apiFetch(`/learning/tasks/${id}`, { method: 'DELETE' }),

  // Sessions
  logSession: (data) =>
    apiFetch('/learning/sessions', { method: 'POST', body: JSON.stringify(data) }),
  sessions: (limit) =>
    apiFetch(`/learning/sessions${limit ? `?limit=${limit}` : ''}`),

  // Topics
  topics: (filters = {}) => {
    const q = new URLSearchParams(filters).toString();
    return apiFetch(`/learning/topics${q ? `?${q}` : ''}`);
  },
  createTopic: (data) =>
    apiFetch('/learning/topics', { method: 'POST', body: JSON.stringify(data) }),
  updateTopic: (id, data) =>
    apiFetch(`/learning/topics/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTopic: (id) =>
    apiFetch(`/learning/topics/${id}`, { method: 'DELETE' }),

  // Tests
  tests: (limit) =>
    apiFetch(`/learning/tests${limit ? `?limit=${limit}` : ''}`),
  recordTest: (data) =>
    apiFetch('/learning/tests', { method: 'POST', body: JSON.stringify(data) }),
  testSummary: () => apiFetch('/learning/tests/summary'),
};

// ============================================
// DASHBOARD (Stats, Progress, Streaks)
// ============================================
export const dashboardApi = {
  stats: () => apiFetch('/dashboard/stats'),
  progress: (days = 30) => apiFetch(`/dashboard/progress?days=${days}`),
  streaks: () => apiFetch('/dashboard/streaks'),
  overview: () => apiFetch('/dashboard/overview'),
  recentActivity: () => apiFetch('/dashboard/recent-activity'),
  subjectPerformance: () => apiFetch('/dashboard/subject-performance'),
  weekly: () => apiFetch('/dashboard/weekly'),
  monthly: () => apiFetch('/dashboard/monthly'),
  addTestSession: (data) =>
    apiFetch('/dashboard/test-session', { method: 'POST', body: JSON.stringify(data) }),
};

// ============================================
// CHAT (AI Assistant)
// ============================================
export const chatApi = {
  send: (message, sessionId) =>
    apiFetch('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    }),
  history: () => apiFetch('/chat/history'),
  session: (id) => apiFetch(`/chat/session/${id}`),
  createSession: (title) =>
    apiFetch('/chat/session', { method: 'POST', body: JSON.stringify({ title }) }),
  renameSession: (id, title) =>
    apiFetch(`/chat/session/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
  deleteSession: (id) =>
    apiFetch(`/chat/session/${id}`, { method: 'DELETE' }),
  clearAll: () => apiFetch('/chat/clear', { method: 'DELETE' }),
  stats: () => apiFetch('/chat/stats'),
};