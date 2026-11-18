import { useCallback, useEffect, useState } from 'react';
import { ThemeMode } from '../types/video';
import { loadStoredTheme, saveStoredTheme } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadStoredTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
