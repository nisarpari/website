'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  // Compatibility with old interface
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('bella_theme');
    if (saved) {
      setIsDark(saved === 'dark');
    } else {
      // Check system preference
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    localStorage.setItem('bella_theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);

    // Switch favicon based on theme
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    if (favicon) {
      favicon.href = isDark ? '/favicon-dark.ico' : '/favicon-light.ico';
    }
  }, [isDark, isClient]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDark(theme === 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      theme: isDark ? 'dark' : 'light',
      setTheme,
      resolvedTheme: isDark ? 'dark' : 'light'
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
