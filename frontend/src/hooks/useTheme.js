import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme configuration
const THEME_CONFIG = {
  light: {
    name: 'light',
    label: 'Light Mode',
    icon: 'fa-sun',
    primary: '#2563eb',
    background: '#f8fafc',
    text: '#1e293b',
    card: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  },
  dark: {
    name: 'dark',
    label: 'Dark Mode',
    icon: 'fa-moon',
    primary: '#3b82f6',
    background: '#0f172a',
    text: '#f8fafc',
    card: 'rgba(30, 41, 59, 0.9)',
    shadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    border: '#334155',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171'
  }
};

const THEME_OPTIONS = ['light', 'dark', 'system'];

export const ThemeProvider = ({ 
  children, 
  defaultTheme = 'system',
  persistKey = 'theme',
  transitionDuration = 300,
  enableSystemTheme = true
}) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage
    const saved = localStorage.getItem(persistKey);
    if (saved && THEME_OPTIONS.includes(saved)) {
      return saved;
    }
    return defaultTheme;
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersDark, setPrefersDark] = useState(false);
  const transitionTimeoutRef = useRef(null);

  // Detect system preference
  useEffect(() => {
    if (!enableSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setPrefersDark(e.matches);
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    };

    setPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystemTheme]);

  // Apply theme changes
  const applyTheme = useCallback((themeMode, shouldPersist = true) => {
    const isDark = themeMode === 'dark';
    
    // Start transition
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Apply theme classes
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(`${themeMode}-mode`);
    document.body.classList.remove('dark-mode');
    
    if (isDark) {
      document.body.classList.add('dark-mode');
    }

    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = isDark ? '#0f172a' : '#f8fafc';
    }

    // Update state
    setIsDarkMode(isDark);

    // Persist preference
    if (shouldPersist && themeMode !== 'system') {
      localStorage.setItem(persistKey, themeMode);
    }

    // End transition after delay
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: themeMode, isDark }
    }));
  }, [persistKey, transitionDuration]);

  // Handle theme changes
  useEffect(() => {
    let effectiveTheme = theme;
    
    if (theme === 'system' && enableSystemTheme) {
      effectiveTheme = prefersDark ? 'dark' : 'light';
    } else if (theme === 'system' && !enableSystemTheme) {
      effectiveTheme = defaultTheme;
    }

    applyTheme(effectiveTheme, theme !== 'system');
  }, [theme, prefersDark, applyTheme, defaultTheme, enableSystemTheme]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const currentEffective = theme === 'system' 
      ? (prefersDark ? 'dark' : 'light')
      : theme;
    
    const newTheme = currentEffective === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, prefersDark]);

  // Set specific theme
  const setThemeMode = useCallback((newTheme) => {
    if (!THEME_OPTIONS.includes(newTheme)) {
      console.warn(`Theme "${newTheme}" is not available. Available themes: ${THEME_OPTIONS.join(', ')}`);
      return;
    }
    setTheme(newTheme);
  }, []);

  // Get current theme config
  const currentThemeConfig = useMemo(() => {
    const effectiveTheme = theme === 'system' 
      ? (prefersDark ? 'dark' : 'light')
      : theme;
    return THEME_CONFIG[effectiveTheme] || THEME_CONFIG.light;
  }, [theme, prefersDark]);

  // Check if dark mode is active
  const isDark = useMemo(() => {
    if (theme === 'system') {
      return prefersDark;
    }
    return theme === 'dark';
  }, [theme, prefersDark]);

  // Get available themes
  const availableThemes = useMemo(() => {
    return THEME_OPTIONS.map(themeName => {
      const config = themeName === 'system' ? THEME_CONFIG.light : THEME_CONFIG[themeName];
      return {
        ...config,
        name: themeName,
        isActive: theme === themeName,
        label: themeName === 'system' ? 'System Default' : config?.label || themeName,
        icon: themeName === 'system' ? 'fa-desktop' : config?.icon
      };
    });
  }, [theme]);

  // Create CSS variables
  const cssVariables = useMemo(() => {
    const config = currentThemeConfig;
    return {
      '--primary': config.primary,
      '--background': config.background,
      '--text': config.text,
      '--card-bg': config.card,
      '--shadow': config.shadow,
      '--border': config.border,
      '--success': config.success,
      '--warning': config.warning,
      '--danger': config.danger
    };
  }, [currentThemeConfig]);

  // Helper to get theme-aware color
  const getThemeColor = useCallback((colorKey) => {
    return currentThemeConfig[colorKey] || currentThemeConfig.primary;
  }, [currentThemeConfig]);

  // Helper to check if theme is dark
  const isThemeDark = useCallback(() => isDark, [isDark]);

  const value = {
    // State
    theme,
    isDarkMode: isDark,
    isTransitioning,
    currentTheme: currentThemeConfig,
    availableThemes,
    cssVariables,
    prefersDark,
    isSystemTheme: theme === 'system',
    
    // Methods
    toggleTheme,
    setTheme: setThemeMode,
    getThemeColor,
    isThemeDark,
    
    // Config
    config: THEME_CONFIG,
    options: THEME_OPTIONS
  };

  return React.createElement(
    ThemeContext.Provider,
    { value },
    children
  );
};

// ===== CUSTOM HOOKS =====

// Hook to get theme-aware styles
export const useThemeStyles = () => {
  const { currentTheme, isDarkMode } = useTheme();
  
  return useMemo(() => ({
    backgroundColor: currentTheme.background,
    color: currentTheme.text,
    primaryColor: currentTheme.primary,
    isDark: isDarkMode,
    cardBg: currentTheme.card,
    shadow: currentTheme.shadow,
    border: currentTheme.border,
    success: currentTheme.success,
    warning: currentTheme.warning,
    danger: currentTheme.danger
  }), [currentTheme, isDarkMode]);
};

// Hook to get theme-aware class names
export const useThemeClass = (baseClass) => {
  const { isDarkMode } = useTheme();
  return useMemo(() => {
    return `${baseClass} ${isDarkMode ? `${baseClass}-dark` : `${baseClass}-light`}`;
  }, [baseClass, isDarkMode]);
};

// Hook to get theme-aware inline styles
export const useThemeStyle = (styles) => {
  const { isDarkMode, currentTheme } = useTheme();
  
  return useMemo(() => {
    if (typeof styles === 'function') {
      return styles({ isDarkMode, theme: currentTheme });
    }
    return styles;
  }, [styles, isDarkMode, currentTheme]);
};

// ===== UTILITY FUNCTIONS =====

// Get theme color
export const getThemeColor = (themeName, colorKey) => {
  const config = THEME_CONFIG[themeName] || THEME_CONFIG.light;
  return config[colorKey] || config.primary;
};

// Check if theme is valid
export const isValidTheme = (theme) => {
  return THEME_OPTIONS.includes(theme);
};

// Get theme label
export const getThemeLabel = (theme) => {
  if (theme === 'system') return 'System Default';
  const config = THEME_CONFIG[theme];
  return config?.label || theme;
};

// Get theme icon
export const getThemeIcon = (theme) => {
  if (theme === 'system') return 'fa-desktop';
  const config = THEME_CONFIG[theme];
  return config?.icon || 'fa-sun';
};

// ===== DEFAULT EXPORT =====
export default ThemeProvider;