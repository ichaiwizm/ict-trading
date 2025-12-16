import type {
  Candle,
  SwingPoint,
  EntrySignal,
  ConfluenceZone,
  EntryZone,
  OrderBlock,
  SLSource,
  TPSource,
} from '@/lib/ict/types';
import { calculatePips, pipsToPrice } from '@/lib/calculations/lotSize';

interface SweepShiftPattern {
  sweepIndex: number;
  sweepPrice: number;
  sweepTime: number;
  swingPoint: SwingPoint;
  shiftIndex: number;
  shiftCandle: Candle;
  direction: 'bullish' | 'bearish';
  strength: number;
}

/**
 * Detects sweep and shift pattern (liquidity grab followed by reversal)
 */
export function detectSweepAndShift(
  candles: Candle[],
  swingPoints: SwingPoint[],
  trend: 'bullish' | 'bearish'
): SweepShiftPattern | null {
  if (candles.length < 10 || swingPoints.length === 0) {
    return null;
  }

  // Look for recent sweep
  const recentCandles = candles.slice(-20);
  let sweepPattern: SweepShiftPattern | null = null;

  for (let i = recentCandles.length - 5; i < recentCandles.length - 1; i++) {
    const candle = recentCandles[i];
    const actualIndex = candles.length - recentCandles.length + i;

    // Find nearby swing points
    const nearbySwings = swingPoints.filter(
      sp => Math.abs(sp.index - actualIndex) < 20
    );

    for (const swing of nearbySwings) {
      // Bullish sweep: price goes below swing low then reverses
      if (
        swing.type === 'low' &&
        candle.low < swing.price &&
        candle.close > swing.price
      ) {
        // Look for shift (strong bullish candle)
        const shiftCandle = findShiftCandle(recentCandles, i + 1, 'bullish');
        if (shiftCandle) {
          const shiftIndex = candles.length - recentCandles.length + shiftCandle.index;
          sweepPattern = {
            sweepIndex: actualIndex,
            sweepPrice: candle.low,
            sweepTime: candle.time,
            swingPoint: swing,
            shiftIndex,
            shiftCandle: shiftCandle.candle,
            direction: 'bullish',
            strength: calculatePatternStrength(candle, shiftCandle.candle, 'bullish'),
          };
          break;
        }
      }

      // Bearish sweep: price goes above swing high then reverses
      if (
        swing.type === 'high' &&
        candle.high > swing.price &&
        candle.close < swing.price
      ) {
        const shiftCandle = findShiftCandle(recentCandles, i + 1, 'bearish');
        if (shiftCandle) {
          const shiftIndex = candles.length - recentCandles.length + shiftCandle.index;
          sweepPattern = {
            sweepIndex: actualIndex,
            sweepPrice: candle.high,
            sweepTime: candle.time,
            swingPoint: swing,
            shiftIndex,
            shiftCandle: shiftCandle.candle,
            direction: 'bearish',
            strength: calculatePatternStrength(candle, shiftCandle.candle, 'bearish'),
          };
          break;
        }
      }
    }

    if (sweepPattern) break;
  }

  return sweepPattern;
}

/**
 * Finds the previous swing point before a given index
 */
function findPreviousSwingPoint(
  swingPoints: SwingPoint[],
  beforeIndex: number,
  type: 'high' | 'low'
): SwingPoint | null {
  const candidates = swingPoints
    .filter(sp => sp.index < beforeIndex && sp.type === type)
    .sort((a, b) => b.index - a.index); // Most recent first

  return candidates[0] || null;
}

/**
 * Gets the relevant order block bottom for bullish SL placement
 */
function getRelevantOrderBlockBottom(
  orderBlocks: OrderBlock[],
  currentPrice: number
): number | null {
  const validOBs = orderBlocks
    .filter(ob => ob.type === 'bullish' && ob.status === 'valid')
    .filter(ob => ob.top < currentPrice)
    .sort((a, b) => b.bottom - a.bottom); // Closest to price first

  return validOBs[0]?.bottom ?? null;
}

/**
 * Gets the relevant order block top for bearish SL placement
 */
function getRelevantOrderBlockTop(
  orderBlocks: OrderBlock[],
  currentPrice: number
): number | null {
  const validOBs = orderBlocks
    .filter(ob => ob.type === 'bearish' && ob.status === 'valid')
    .filter(ob => ob.bottom > currentPrice)
    .sort((a, b) => a.top - b.top); // Closest to price first

  return validOBs[0]?.top ?? null;
}

/**
 * Generates entry signal from sweep/shift pattern and confluence zone
 * Now with dynamic SL/TP based on zones and swing points
 */
export function generateEntrySignal(
  pattern: SweepShiftPattern,
  confluenceZone: ConfluenceZone | undefined,
  currentPrice: number,
  swingPoints: SwingPoint[] = [],
  orderBlocks: OrderBlock[] = [],
  symbol: string = 'XAUUSD',
  bufferPips: number = 5
): EntrySignal {
  const direction = pattern.direction === 'bullish' ? 'long' : 'short';
  const buffer = pipsToPrice(bufferPips, symbol);

  let entryZone: EntryZone;
  let suggestedEntry: number;
  let stopLoss: number;
  let slSource: SLSource;
  let takeProfit1: number;
  let takeProfit2: number | null;
  let tpSource: TPSource;

  // Entry zone from confluence or shift candle
  entryZone = confluenceZone
    ? { top: confluenceZone.overlapTop, bottom: confluenceZone.overlapBottom }
    : { top: pattern.shiftCandle.high, bottom: pattern.shiftCandle.low };

  if (direction === 'long') {
    suggestedEntry = confluenceZone ? confluenceZone.overlapBottom : pattern.shiftCandle.close;

    // SL: Zone invalidation + buffer (below zone for longs)
    if (confluenceZone) {
      stopLoss = confluenceZone.overlapBottom - buffer;
      slSource = 'confluence_zone';
    } else {
      const obBottom = getRelevantOrderBlockBottom(orderBlocks, currentPrice);
      if (obBottom !== null) {
        stopLoss = obBottom - buffer;
        slSource = 'order_block';
      } else {
        stopLoss = pattern.sweepPrice - buffer;
        slSource = 'sweep_price';
      }
    }

    // TP: Previous swing high
    const previousSwingHigh = findPreviousSwingPoint(swingPoints, pattern.sweepIndex, 'high');
    if (previousSwingHigh) {
      takeProfit1 = previousSwingHigh.price;
      tpSource = 'swing_point';
    } else {
      // Fallback to 2:1 ratio
      const risk = Math.abs(suggestedEntry - stopLoss);
      takeProfit1 = suggestedEntry + (risk * 2);
      tpSource = 'fixed_ratio';
    }

    // TP2: Find next swing high after TP1
    const nextSwingHigh = swingPoints
      .filter(sp => sp.type === 'high' && sp.price > takeProfit1)
      .sort((a, b) => a.price - b.price)[0];
    takeProfit2 = nextSwingHigh?.price ?? null;

  } else {
    suggestedEntry = confluenceZone ? confluenceZone.overlapTop : pattern.shiftCandle.close;

    // SL: Zone invalidation + buffer (above zone for shorts)
    if (confluenceZone) {
      stopLoss = confluenceZone.overlapTop + buffer;
      slSource = 'confluence_zone';
    } else {
      const obTop = getRelevantOrderBlockTop(orderBlocks, currentPrice);
      if (obTop !== null) {
        stopLoss = obTop + buffer;
        slSource = 'order_block';
      } else {
        stopLoss = pattern.sweepPrice + buffer;
        slSource = 'sweep_price';
      }
    }

    // TP: Previous swing low
    const previousSwingLow = findPreviousSwingPoint(swingPoints, pattern.sweepIndex, 'low');
    if (previousSwingLow) {
      takeProfit1 = previousSwingLow.price;
      tpSource = 'swing_point';
    } else {
      // Fallback to 2:1 ratio
      const risk = Math.abs(suggestedEntry - stopLoss);
      takeProfit1 = suggestedEntry - (risk * 2);
      tpSource = 'fixed_ratio';
    }

    // TP2: Find next swing low after TP1
    const nextSwingLow = swingPoints
      .filter(sp => sp.type === 'low' && sp.price < takeProfit1)
      .sort((a, b) => b.price - a.price)[0];
    takeProfit2 = nextSwingLow?.price ?? null;
  }

  // Calculate SL distance in pips for lot sizing
  const slDistancePips = calculatePips(suggestedEntry, stopLoss, symbol);

  // Calculate actual risk-reward ratio
  const risk = Math.abs(suggestedEntry - stopLoss);
  const reward = Math.abs(takeProfit1 - suggestedEntry);
  const riskRewardRatio = risk > 0 ? Number((reward / risk).toFixed(2)) : 2;

  let confidence = pattern.strength + (confluenceZone ? confluenceZone.strength * 0.5 : 0);
  confidence = Math.min(confidence, 100);

  return {
    id: `signal-${pattern.sweepTime}`,
    type: 'sweep_and_shift',
    direction,
    sweepTime: pattern.sweepTime,
    shiftTime: pattern.shiftCandle.time,
    entryZone,
    suggestedEntry,
    suggestedSL: stopLoss,
    suggestedTP1: takeProfit1,
    suggestedTP2: takeProfit2,
    riskRewardRatio,
    confidence,
    slSource,
    tpSource,
    slDistancePips,
  };
}

function findShiftCandle(
  candles: Candle[],
  startIndex: number,
  direction: 'bullish' | 'bearish'
): { candle: Candle; index: number } | null {
  for (let i = startIndex; i < Math.min(startIndex + 5, candles.length); i++) {
    const candle = candles[i];
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;

    // Strong candle with good body-to-range ratio
    if (body / range > 0.6) {
      if (direction === 'bullish' && candle.close > candle.open) {
        return { candle, index: i };
      }
      if (direction === 'bearish' && candle.close < candle.open) {
        return { candle, index: i };
      }
    }
  }

  return null;
}

function calculatePatternStrength(
  sweepCandle: Candle,
  shiftCandle: Candle,
  direction: 'bullish' | 'bearish'
): number {
  const shiftBody = Math.abs(shiftCandle.close - shiftCandle.open);
  const shiftRange = shiftCandle.high - shiftCandle.low;
  const bodyRatio = shiftBody / shiftRange;

  const shiftSize = (shiftBody / shiftCandle.open) * 100;

  let strength = bodyRatio * 40 + shiftSize * 10;

  return Math.min(Math.max(strength, 20), 100);
}
