import React, { useState } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { accentThemes, AccentTheme, useAccentTheme } from '../../context/AccentThemeContext';
import { Button } from './Button';

export const ThemeSelectorModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentAccent, setAccentTheme } = useAccentTheme();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Customize App Theme & Colors"
        title="Customize App Theme & Colors"
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold cursor-pointer shadow-xs"
      >
        <Palette className="w-4 h-4 text-indigo-500 animate-pulse" />
        <span className="hidden sm:inline">Themes</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">App Atmosphere & Color Themes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred visual accent palette</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Theme Grid */}
            <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {(Object.keys(accentThemes) as AccentTheme[]).map((key) => {
                const theme = accentThemes[key];
                const isSelected = currentAccent === key;

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setAccentTheme(key);
                    }}
                    className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${theme.dotColor} ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-sm`} />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{theme.name}</span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {theme.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant live application update</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="px-5 font-bold text-xs"
              >
                Apply Theme
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
