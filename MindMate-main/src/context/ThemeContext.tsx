import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialDark(): boolean {
  try {
    const saved = localStorage.getItem('mindmate_pref_darkMode');
    if (saved !== null) return saved === 'true';
  } catch (e) {
    console.warn("localStorage is not accessible in ThemeContext:", e);
  }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {
    return false;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Hydrate from localStorage / OS preference on mount
  useEffect(() => {
    const isDark = getInitialDark();
    setDarkMode(isDark);
    try {
      document.documentElement.classList.toggle('dark', isDark);
    } catch (e) {}
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      try {
        document.documentElement.classList.toggle('dark', next);
      } catch (e) {}
      try {
        localStorage.setItem('mindmate_pref_darkMode', String(next));
      } catch (e) {
        console.warn("Failed to set dark mode in localStorage:", e);
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode, toggleDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
