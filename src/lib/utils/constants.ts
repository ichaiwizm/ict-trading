/**
 * Constants
 * Application-wide constants for symbols, timeframes, and trading parameters
 */

import type { KillZone } from '../ict/types';

/**
 * Supported trading symbols
 */
export const SYMBOLS = ['EURUSD', 'XAUUSD'] as const;
export type Symbol = typeof SYMBOLS[number];

/**
 * Supported timeframes
 */
export const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D'] as const;
export type Timeframe = typeof TIMEFRAMES[number];

/**
 * Pip values for different symbols
 */
export const PIP_VALUES: Record<string, number> = {
  EURUSD: 0.0001,
  GBPUSD: 0.0001,
  USDJPY: 0.01,
  XAUUSD: 0.01,
  XAGUSD: 0.001,
};

/**
 * Kill zone configurations (all times in UTC)
 */
export const KILL_ZONE_CONFIGS: KillZone[] = [
  {
    name: 'asian',
    startUTC: '00:00',
    endUTC: '08:00',
    isActive: false,
    volatilityExpected: 'low',
  },
  {
    name: 'london',
    startUTC: '08:00',
    endUTC: '12:00',
    isActive: false,
    volatilityExpected: 'high',
  },
  {
    name: 'new_york_am',
    startUTC: '12:00',
    endUTC: '16:00',
    isActive: false,
    volatilityExpected: 'high',
  },
  {
    name: 'new_york_pm',
    startUTC: '16:00',
    endUTC: '20:00',
    isActive: false,
    volatilityExpected: 'medium',
  },
];

/**
 * Default risk percentage per trade
 */
export const DEFAULT_RISK_PERCENTAGE = 1;

/**
 * Default timeframe for analysis
 */
export const DEFAULT_TIMEFRAME: Timeframe = '15m';

/**
 * Default symbol
 */
export const DEFAULT_SYMBOL: Symbol = 'EURUSD';
