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
  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
  }

  return payload;
}

export const authApi = {
  register: (data) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  profile: () => apiFetch('/auth/profile'),
};

export const learningApi = {
  tasks: () => apiFetch('/learning/tasks'),
  createTask: (data) => apiFetch('/learning/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTask: (id, data) => apiFetch(`/learning/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  logSession: (data) => apiFetch('/learning/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  topics: () => apiFetch('/learning/topics'),
  tests: () => apiFetch('/learning/tests'),
};
