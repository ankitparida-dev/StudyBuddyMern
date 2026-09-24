import { storage } from './storage';

const KEY = 'sb_sessions_log';

export const getSessions = () => storage.get(KEY, []);

export const addSession = (session) => {
  const all = getSessions();
  const newSession = {
    id: Date.now(),
    ...session,
    createdAt: new Date().toISOString(),
  };
  all.push(newSession);
  storage.set(KEY, all);
  return newSession;
};

export const deleteSession = (id) => {
  const all = getSessions().filter((s) => s.id !== id);
  storage.set(KEY, all);
};

export const getTodayHours = () => {
  const today = new Date().toISOString().split('T')[0];
  return getSessions()
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + s.hours, 0);
};

export const getTotalHours = () =>
  getSessions().reduce((sum, s) => sum + s.hours, 0);