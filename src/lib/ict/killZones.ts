import type { KillZone, KillZoneName } from '@/lib/ict/types';

interface KillZoneConfig {
  name: KillZoneName;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  volatilityExpected: 'high' | 'medium' | 'low';
}

// Kill zones in UTC
const KILL_ZONE_CONFIGS: KillZoneConfig[] = [
  {
    name: 'asian',
    startHour: 0,
    startMinute: 0,
    endHour: 3,
    endMinute: 0,
    volatilityExpected: 'low',
  },
  {
    name: 'london',
    startHour: 7,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    volatilityExpected: 'high',
  },
  {
    name: 'new_york_am',
    startHour: 12,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    volatilityExpected: 'high',
  },
  {
    name: 'new_york_pm',
    startHour: 18,
    startMinute: 30,
    endHour: 21,
    endMinute: 0,
    volatilityExpected: 'medium',
  },
];

/**
 * Gets the current kill zone status for a symbol
 */
export function getKillZoneStatus(
  symbol: string,
  currentTime: Date = new Date()
): KillZone[] {
  const currentHour = currentTime.getUTCHours();
  const currentMinute = currentTime.getUTCMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  return KILL_ZONE_CONFIGS.map(config => {
    const startTimeInMinutes = config.startHour * 60 + config.startMinute;
    let endTimeInMinutes = config.endHour * 60 + config.endMinute;

    // Handle overnight zones (like Asian session)
    if (endTimeInMinutes < startTimeInMinutes) {
      endTimeInMinutes += 24 * 60;
    }

    let isActive = false;
    let timeRemaining = 0;

    // Check if current time is within the kill zone
    if (startTimeInMinutes <= endTimeInMinutes) {
      isActive =
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes < endTimeInMinutes;

      if (isActive) {
        timeRemaining = (endTimeInMinutes - currentTimeInMinutes) * 60;
      }
    } else {
      // Handle overnight case
      isActive =
        currentTimeInMinutes >= startTimeInMinutes ||
        currentTimeInMinutes < endTimeInMinutes;

      if (isActive) {
        if (currentTimeInMinutes >= startTimeInMinutes) {
          timeRemaining = (24 * 60 + endTimeInMinutes - currentTimeInMinutes) * 60;
        } else {
          timeRemaining = (endTimeInMinutes - currentTimeInMinutes) * 60;
        }
      }
    }

    return {
      name: config.name,
      startUTC: formatKillZoneTime(config.startHour, config.startMinute),
      endUTC: formatKillZoneTime(config.endHour, config.endMinute),
      isActive,
      timeRemaining: isActive ? timeRemaining : undefined,
      volatilityExpected: config.volatilityExpected,
    };
  });
}

/**
 * Checks if trading should be done now based on kill zones
 */
export function shouldTradeNow(symbol: string): boolean {
  const killZones = getKillZoneStatus(symbol);
  return killZones.some(kz => kz.isActive && kz.volatilityExpected === 'high');
}

/**
 * Gets time until next high-priority kill zone
 */
export function getTimeUntilNextKillZone(
  symbol: string
): { name: string; seconds: number } | null {
  const currentTime = new Date();
  const currentTimeInMinutes = currentTime.getUTCHours() * 60 + currentTime.getUTCMinutes();

  let nextKillZone: { name: string; seconds: number } | null = null;
  let minTimeToNext = Infinity;

  for (const config of KILL_ZONE_CONFIGS) {
    if (config.volatilityExpected !== 'high') {
      continue;
    }

    const startTimeInMinutes = config.startHour * 60 + config.startMinute;
    let timeToNext = startTimeInMinutes - currentTimeInMinutes;

    // Handle next day
    if (timeToNext < 0) {
      timeToNext += 24 * 60;
    }

    if (timeToNext < minTimeToNext) {
      minTimeToNext = timeToNext;
      nextKillZone = {
        name: config.name,
        seconds: timeToNext * 60,
      };
    }
  }

  return nextKillZone;
}

function formatKillZoneTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}
