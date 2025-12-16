import type { Candle, ICTAnalysis } from '@/lib/ict/types';
import { detectSwingPoints } from './swingPoints';
import { analyzeTrend } from './trend';
import { calculateFibonacci } from './fibonacci';
import { detectOrderBlocks, updateOrderBlockStatus } from './orderBlocks';
import { detectFairValueGaps, updateFVGStatus } from './fvg';
import { findConfluenceZones } from './confluence';
import { getKillZoneStatus } from './killZones';
import { detectSweepAndShift, generateEntrySignal } from './entrySignals';

/**
 * Main ICT Analysis orchestrator
 * Runs complete analysis on multi-timeframe candle data
 */
export function runICTAnalysis(
  candles: Record<string, Candle[]>,
  symbol: string
): ICTAnalysis {
  const timestamp = Date.now();

  // Use 1h candles for main analysis, 4h for higher timeframe trend
  const candles1h = candles['1h'] || [];
  const candles4h = candles['4h'] || [];

  if (candles1h.length === 0) {
    return createEmptyAnalysis(symbol, timestamp);
  }

  // Step 1: Analyze trend from higher timeframe
  const swingPoints4h = detectSwingPoints(candles4h, 5);
  const trend4h = analyzeTrend(candles4h, swingPoints4h);

  // Step 2: Detect swing points on 1h
  const swingPoints = detectSwingPoints(candles1h, 5);

  // Step 3: Analyze trend on 1h
  const trend1h = analyzeTrend(candles1h, swingPoints);

  // Combine trend analysis
  const trend = {
    direction: trend1h.direction,
    strength: trend1h.strength,
    higherTimeframe: trend4h.direction,
    lowerTimeframe: trend1h.direction,
    structureBreaks: trend1h.structureBreaks,
  };

  // Step 4: Calculate Fibonacci from swing points (only if not ranging)
  const effectiveDirection = trend.direction === 'ranging' ? 'bullish' : trend.direction;
  const fibonacci = calculateFibonacci(swingPoints, effectiveDirection);

  // Step 5: Detect Order Blocks
  let orderBlocks = detectOrderBlocks(candles1h, effectiveDirection);

  // Update OB status based on recent price action
  const currentCandle = candles1h[candles1h.length - 1];
  orderBlocks = orderBlocks.map(ob => updateOrderBlockStatus(ob, currentCandle));

  // Filter to keep only valid order blocks
  orderBlocks = orderBlocks.filter(ob => ob.status === 'valid');

  // Step 6: Detect Fair Value Gaps
  let fairValueGaps = detectFairValueGaps(candles1h, fibonacci || undefined);

  // Update FVG status
  fairValueGaps = fairValueGaps.map(fvg => updateFVGStatus(fvg, currentCandle));

  // Filter to keep only unfilled or partially filled FVGs
  fairValueGaps = fairValueGaps.filter(
    fvg => fvg.status === 'unfilled' || fvg.status === 'partially_filled'
  );

  // Step 7: Find confluence zones
  const confluenceZones = findConfluenceZones(
    orderBlocks,
    fairValueGaps,
    fibonacci || undefined
  );

  // Step 8: Get kill zone status
  const killZones = getKillZoneStatus(symbol);

  // Step 9: Look for entry signals (sweep and shift pattern)
  const sweepShiftPattern = detectSweepAndShift(
    candles1h,
    swingPoints,
    effectiveDirection
  );

  let entrySignals: ICTAnalysis['entrySignals'] = [];

  if (sweepShiftPattern) {
    // Find best confluence zone for entry
    const bestConfluence = confluenceZones.find(
      cz => cz.type === sweepShiftPattern.direction
    );

    const signal = generateEntrySignal(
      sweepShiftPattern,
      bestConfluence,
      currentCandle.close,
      swingPoints,    // For TP calculation based on swing points
      orderBlocks,    // For SL calculation based on zone invalidation
      symbol,         // For pip calculations
      5               // Buffer pips (TODO: make configurable from settings)
    );

    entrySignals = [signal];
  }

  return {
    symbol,
    timestamp,
    trend,
    swingPoints,
    fibonacci,
    orderBlocks,
    fairValueGaps,
    confluenceZones,
    killZones,
    entrySignals,
  };
}

function createEmptyAnalysis(symbol: string, timestamp: number): ICTAnalysis {
  return {
    symbol,
    timestamp,
    trend: {
      direction: 'ranging',
      strength: 0,
      higherTimeframe: 'ranging',
      lowerTimeframe: 'ranging',
      structureBreaks: [],
    },
    swingPoints: [],
    fibonacci: null,
    orderBlocks: [],
    fairValueGaps: [],
    confluenceZones: [],
    killZones: getKillZoneStatus(symbol),
    entrySignals: [],
  };
}
