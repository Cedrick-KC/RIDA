import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

// Define the theme hook return type
interface ThemeReturnType {
  theme: 'light' | 'dark';
  isLoading: boolean;
  toggleTheme: () => void;
  forceTheme: (newTheme: 'light' | 'dark') => void;
  isDark: boolean;
  isLight: boolean;
}

// Custom hook for theme management
const useTheme = (): ThemeReturnType => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      setIsLoading(true);

      // Try to get theme from localStorage
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }

      setIsLoading(false);
    };

    initializeTheme();
  }, [setTheme]);

  // Update localStorage and HTML attribute when theme changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);

      // Optional: Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
      }
    }
  }, [theme, isLoading]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Force specific theme
  const forceTheme = (newTheme: 'light' | 'dark') => {
    if (['light', 'dark'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return {
    theme,
    isLoading,
    toggleTheme,
    forceTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};

export default useTheme;