import React, { createContext, useContext, useState, useEffect } from 'react';

export type AccentTheme = 'blue' | 'sage' | 'slate' | 'navy' | 'indigo';

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
  blue: {
    id: 'blue',
    name: 'Muted Blue (Default)',
    description: 'Crisp, high-clarity royal blue for simple, intuitive navigation.',
    primaryColor: 'bg-[#2563EB] text-white',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-[#2563EB] dark:text-blue-400',
    borderClass: 'border-[#2563EB]',
    glowClass: 'shadow-blue-500/20',
    dotColor: 'bg-[#2563EB]',
  },
  sage: {
    id: 'sage',
    name: 'Sage Green',
    description: 'Calm, peaceful soft green tone (#86A98D) representing verified status.',
    primaryColor: 'bg-[#86A98D] text-white',
    badgeClass: 'bg-[#86A98D]/15 border-[#86A98D]/30 text-[#86A98D]',
    borderClass: 'border-[#86A98D]',
    glowClass: 'shadow-[#86A98D]/20',
    dotColor: 'bg-[#86A98D]',
  },
  slate: {
    id: 'slate',
    name: 'Dark Slate',
    description: 'Clean, minimalist slate tone (#1E293B) for understated modesty.',
    primaryColor: 'bg-[#1E293B] text-white',
    badgeClass: 'bg-slate-500/15 border-slate-500/30 text-slate-700 dark:text-slate-300',
    borderClass: 'border-[#1E293B]',
    glowClass: 'shadow-slate-500/20',
    dotColor: 'bg-[#1E293B]',
  },
  navy: {
    id: 'navy',
    name: 'Deep Navy',
    description: 'Focused dark blue (#1D4ED8) for high contrast and strong callouts.',
    primaryColor: 'bg-[#1D4ED8] text-white',
    badgeClass: 'bg-blue-900/15 border-blue-900/30 text-[#1D4ED8] dark:text-blue-300',
    borderClass: 'border-[#1D4ED8]',
    glowClass: 'shadow-blue-900/20',
    dotColor: 'bg-[#1D4ED8]',
  },
  indigo: {
    id: 'indigo',
    name: 'Muted Blue Accent',
    description: 'Standard deep blue aesthetic with high contrast clarity.',
    primaryColor: 'bg-[#2563EB] text-white',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-[#2563EB] dark:text-blue-400',
    borderClass: 'border-[#2563EB]',
    glowClass: 'shadow-blue-500/20',
    dotColor: 'bg-[#2563EB]',
  },
};

interface AccentThemeContextType {
  currentAccent: AccentTheme;
  setAccentTheme: (theme: AccentTheme) => void;
  config: AccentThemeConfig;
}

const AccentThemeContext = createContext<AccentThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'allcardstatus-accent-theme';

export const AccentThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAccent, setCurrentAccent] = useState<AccentTheme>(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem('allcardvault-accent-theme') || localStorage.getItem('allcardstation-accent-theme')) as AccentTheme;
      if (saved && accentThemes[saved]) {
        return saved;
      }
    } catch {}
    return 'blue';
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

  const config = accentThemes[currentAccent] || accentThemes.blue;

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
