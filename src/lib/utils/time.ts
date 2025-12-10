/**
 * Time Utilities
 * Utilities for time formatting, timezone handling, and kill zone calculations
 */

import type { KillZone } from '../ict/types';

export type TimeFormat = 'HH:mm' | 'HH:mm:ss' | 'DD/MM HH:mm' | 'full';

/**
 * Format a timestamp to a readable string
 */
export function formatTime(timestamp: number, format: TimeFormat = 'HH:mm'): string {
  const date = new Date(timestamp);

  const pad = (num: number): string => num.toString().padStart(2, '0');

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  switch (format) {
    case 'HH:mm':
      return `${hours}:${minutes}`;
    case 'HH:mm:ss':
      return `${hours}:${minutes}:${seconds}`;
    case 'DD/MM HH:mm':
      return `${day}/${month} ${hours}:${minutes}`;
    case 'full':
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    default:
      return `${hours}:${minutes}`;
  }
}

/**
 * Get the current timezone offset in hours
 */
export function getTimezoneOffset(): number {
  const offset = new Date().getTimezoneOffset();
  return -offset / 60;
}

/**
 * Parse time string in HH:mm format to hours and minutes
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Check if a given time is within a kill zone
 */
export function isWithinKillZone(time: number, killZone: KillZone): boolean {
  const date = new Date(time);
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  const currentTimeInMinutes = utcHours * 60 + utcMinutes;

  const start = parseTimeString(killZone.startUTC);
  const end = parseTimeString(killZone.endUTC);

  const startInMinutes = start.hours * 60 + start.minutes;
  const endInMinutes = end.hours * 60 + end.minutes;

  // Handle cases where kill zone crosses midnight
  if (endInMinutes < startInMinutes) {
    return currentTimeInMinutes >= startInMinutes || currentTimeInMinutes < endInMinutes;
  }

  return currentTimeInMinutes >= startInMinutes && currentTimeInMinutes < endInMinutes;
}

/**
 * Get the next active kill zone for a symbol
 */
export function getNextKillZone(killZones: KillZone[]): KillZone | null {
  const now = Date.now();

  // First check if any kill zone is currently active
  for (const kz of killZones) {
    if (isWithinKillZone(now, kz)) {
      return kz;
    }
  }

  // Find the next upcoming kill zone
  const date = new Date(now);
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  const currentTimeInMinutes = utcHours * 60 + utcMinutes;

  let nextKillZone: KillZone | null = null;
  let minTimeDiff = Infinity;

  for (const kz of killZones) {
    const start = parseTimeString(kz.startUTC);
    const startInMinutes = start.hours * 60 + start.minutes;

    let timeDiff = startInMinutes - currentTimeInMinutes;
    if (timeDiff < 0) {
      timeDiff += 24 * 60; // Add 24 hours if it's tomorrow
    }

    if (timeDiff < minTimeDiff) {
      minTimeDiff = timeDiff;
      nextKillZone = kz;
    }
  }

  return nextKillZone;
}

/**
 * Format duration in seconds to human-readable format (e.g., "2h 15m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 && hours === 0) {
    parts.push(`${secs}s`);
  }

  return parts.length > 0 ? parts.join(' ') : '0m';
}
