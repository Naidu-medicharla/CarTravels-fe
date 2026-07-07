import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${className}`}
      style={{
        background: isDark ? 'rgba(212,175,55,0.12)' : 'rgba(184,146,31,0.12)',
        border: `1px solid ${isDark ? 'rgba(212,175,55,0.25)' : 'rgba(184,146,31,0.30)'}`,
        color: 'var(--color-gold)',
      }}
    >
      {isDark ? (
        <Sun size={16} strokeWidth={2} />
      ) : (
        <Moon size={16} strokeWidth={2} />
      )}
    </button>
  );
};
