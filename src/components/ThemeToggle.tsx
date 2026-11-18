import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeMode } from '../types/video';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  compact = false,
}) => {
  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        aria-pressed={isDark}
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 cursor-pointer"
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 text-zinc-700" aria-hidden="true" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={isDark}
      className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300 whitespace-nowrap shrink-0 cursor-pointer"
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          <span className="hidden sm:inline">Modo claro</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-zinc-700" aria-hidden="true" />
          <span className="hidden sm:inline">Modo oscuro</span>
        </>
      )}
    </button>
  );
};
