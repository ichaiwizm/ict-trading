'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg border border-border/50 bg-card/30 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'group relative h-9 w-9 rounded-lg',
        'border border-border/50 bg-card/50 backdrop-blur-sm',
        'hover:bg-card hover:border-border',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Glow effect on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg opacity-0 blur-md transition-opacity duration-300',
          'group-hover:opacity-100',
          isDark ? 'bg-amber-500/20' : 'bg-blue-500/20'
        )}
      />

      {/* Icon container with rotation animation */}
      <div className="relative flex h-full w-full items-center justify-center">
        {/* Sun icon */}
        <svg
          className={cn(
            'absolute h-4 w-4 transition-all duration-500 ease-out',
            isDark
              ? 'rotate-90 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            className={cn(
              'transition-all duration-300',
              !isDark && 'fill-amber-400 stroke-amber-500'
            )}
          />
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="12"
              y1="2"
              x2="12"
              y2="4"
              className={cn(
                'origin-center transition-all duration-300',
                !isDark && 'stroke-amber-500'
              )}
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: '12px 12px',
              }}
            />
          ))}
        </svg>

        {/* Moon icon */}
        <svg
          className={cn(
            'absolute h-4 w-4 transition-all duration-500 ease-out',
            isDark
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            className={cn(
              'transition-all duration-300',
              isDark && 'fill-blue-300/30 stroke-blue-300'
            )}
          />
          {/* Stars */}
          <circle
            cx="19"
            cy="5"
            r="0.5"
            className={cn(
              'transition-all duration-500 delay-200',
              isDark ? 'fill-blue-200 opacity-100' : 'opacity-0'
            )}
          />
          <circle
            cx="21"
            cy="8"
            r="0.3"
            className={cn(
              'transition-all duration-500 delay-300',
              isDark ? 'fill-blue-200 opacity-100' : 'opacity-0'
            )}
          />
        </svg>
      </div>
    </button>
  );
}
