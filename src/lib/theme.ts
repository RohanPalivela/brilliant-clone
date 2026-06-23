export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

/** The user's explicitly chosen theme, or null if they're following the system. */
export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): Theme {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** The theme that should actually be shown: stored preference, else system. */
export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

/** Reflect a theme onto the document without persisting it. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

/** Persist and apply a theme choice. */
export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage may be unavailable (private mode); apply anyway. */
  }
  applyTheme(theme);
}
