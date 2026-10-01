import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · StudyBuddy` : 'StudyBuddy';
  }, [title]);
};