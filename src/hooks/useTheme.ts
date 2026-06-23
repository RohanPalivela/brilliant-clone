import { useCallback, useEffect, useState } from 'react';
import {
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  setTheme as persistTheme,
  type Theme,
} from '../lib/theme';

/**
 * Reads and controls the active color theme. State is initialised from the
 * already-applied document state (set pre-paint in index.html), so the toggle
 * never disagrees with what's on screen.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme());

  // If the user is following the system and it changes, follow along live.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (getStoredTheme() === null) setThemeState(getSystemTheme());
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      persistTheme(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggleTheme };
}
