import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { ThemeMode, useTheme } from '../../lib/theme';

interface ThemeSelectorProps {
  variant?: 'compact' | 'full' | 'dropdown' | 'toggle';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const options: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  if (variant === 'toggle') {
    return (
      <button
        id="theme-mode-toggle-btn"
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        id="theme-selector-compact"
        className={`inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs ${className}`}
        role="group"
        aria-label="Appearance options"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              id={`theme-btn-${opt.id}`}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-750'
              }`}
              title={`${opt.label} Mode ${opt.id === 'system' ? `(${resolvedTheme} currently active)` : ''}`}
              aria-pressed={isSelected}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} id="theme-selector-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Appearance
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {theme === 'system' ? `Auto (${resolvedTheme})` : theme.charAt(0).toUpperCase() + theme.slice(1)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{opt.label}</span>
              {opt.id === 'system' && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                  Device auto
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        System automatically follows your device appearance.
      </p>
    </div>
  );
};
