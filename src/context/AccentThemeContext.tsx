import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentTheme = 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';

export interface AccentThemeConfig {
  id: AccentTheme;
  name: string;
  description: string;
  primaryColor: string;
  badgeClass: string;
  borderClass: string;
  glowClass: string;
  dotColor: string;
}

export const accentThemes: Record<AccentTheme, AccentThemeConfig> = {
  indigo: {
    id: 'indigo',
    name: 'Classic Indigo (Default)',
    description: 'Professional, deep blue-violet aesthetic with high contrast clarity.',
    primaryColor: 'bg-indigo-600 text-white',
    badgeClass: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
    borderClass: 'border-indigo-500',
    glowClass: 'shadow-indigo-500/20',
    dotColor: 'bg-indigo-400',
  },
  cyan: {
    id: 'cyan',
    name: 'Electric Cyan',
    description: 'Vibrant futuristic digital glow with high-tech cyan accents.',
    primaryColor: 'bg-cyan-600 text-white',
    badgeClass: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    borderClass: 'border-cyan-500',
    glowClass: 'shadow-cyan-500/20',
    dotColor: 'bg-cyan-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    description: 'Calm, secure financial green aura symbolizing trusted transactions.',
    primaryColor: 'bg-emerald-600 text-white',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    borderClass: 'border-emerald-500',
    glowClass: 'shadow-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  amber: {
    id: 'amber',
    name: 'Royal Amber',
    description: 'Warm, luxurious gold-amber tone for a premium boutique feel.',
    primaryColor: 'bg-amber-600 text-white',
    badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    borderClass: 'border-amber-500',
    glowClass: 'shadow-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  rose: {
    id: 'rose',
    name: 'Neon Rose',
    description: 'Bold magenta-rose highlight for high-energy modern branding.',
    primaryColor: 'bg-rose-600 text-white',
    badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    borderClass: 'border-rose-500',
    glowClass: 'shadow-rose-500/20',
    dotColor: 'bg-rose-400',
  },
  violet: {
    id: 'violet',
    name: 'Cyberpunk Violet',
    description: 'Deep midnight purple and neon violet digital atmosphere.',
    primaryColor: 'bg-violet-600 text-white',
    badgeClass: 'bg-violet-500/15 border-violet-500/30 text-violet-400',
    borderClass: 'border-violet-500',
    glowClass: 'shadow-violet-500/20',
    dotColor: 'bg-violet-400',
  },
};

interface AccentThemeContextType {
  currentAccent: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  config: AccentThemeConfig;
}

const AccentThemeContext = createContext<AccentThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'allcardstation-accent-theme';

export const AccentThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAccent, setCurrentAccent] = useState<AccentTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AccentTheme;
      if (saved && accentThemes[saved]) {
        return saved;
      }
    } catch {}
    return 'indigo';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', currentAccent);
  }, [currentAccent]);

  const setAccentTheme = (theme: AccentTheme) => {
    setCurrentAccent(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  };

  const config = accentThemes[currentAccent] || accentThemes.indigo;

  return (
    <AccentThemeContext.Provider value={{ currentAccent, setAccentTheme, config }}>
      {children}
    </AccentThemeContext.Provider>
  );
};

export const useAccentTheme = () => {
  const context = useContext(AccentThemeContext);
  if (!context) {
    throw new Error('useAccentTheme must be used within an AccentThemeProvider');
  }
  return context;
};
