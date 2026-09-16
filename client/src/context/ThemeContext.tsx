import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

const THEME_KEY = 'ah_theme';
const THEME_VER = 'ah_theme_v2';

function readTheme(): Theme {
  // One-time migrate: previous default was dark; switch catalog to light
  if (localStorage.getItem(THEME_VER) !== '2') {
    localStorage.setItem(THEME_VER, '2');
    localStorage.setItem(THEME_KEY, 'light');
    return 'light';
  }
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  return saved === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return readTheme();
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(THEME_VER, '2');
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const value = useMemo(
    () => ({ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme');
  return ctx;
}
