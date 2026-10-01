import { useEffect } from 'react';

/**
 * Register global keyboard shortcuts.
 * @param {Object} handlers - e.g. { 'ctrl+k': fn, 'space': fn, 'escape': fn }
 */
export const useKeyboardShortcuts = (handlers = {}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping =
        tag === 'input' || tag === 'textarea' || tag === 'select';

      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      parts.push(e.key.toLowerCase());
      const combo = parts.join('+');

      const handler = handlers[combo];
      if (!handler) return;

      // Space only fires when NOT typing
      if (combo === 'space' && isTyping) return;
      // Regular keys skip if typing
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && isTyping) {
        return;
      }

      e.preventDefault();
      handler(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};