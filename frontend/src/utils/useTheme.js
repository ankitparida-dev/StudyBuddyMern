import { useEffect, useState } from 'react';
import { storage } from './storage';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => storage.get('sb_theme', 'light'));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    storage.set('sb_theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
};