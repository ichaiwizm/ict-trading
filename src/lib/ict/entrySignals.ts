import type {
  Candle,
  SwingPoint,
  EntrySignal,
  ConfluenceZone,
  EntryZone,
} from '@/lib/ict/types';

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
 * Generates entry signal from sweep/shift pattern and confluence zone
 */
export function generateEntrySignal(
  pattern: SweepShiftPattern,
  confluenceZone: ConfluenceZone | undefined,
  currentPrice: number
): EntrySignal {
  const direction = pattern.direction === 'bullish' ? 'long' : 'short';

  let entryZone: EntryZone;
  let suggestedEntry: number;
  let stopLoss: number;

  entryZone = confluenceZone
    ? { top: confluenceZone.overlapTop, bottom: confluenceZone.overlapBottom }
    : { top: pattern.shiftCandle.high, bottom: pattern.shiftCandle.low };

  if (direction === 'long') {
    suggestedEntry = confluenceZone ? confluenceZone.overlapBottom : pattern.shiftCandle.close;
    stopLoss = pattern.sweepPrice - (pattern.sweepPrice * 0.001);
  } else {
    suggestedEntry = confluenceZone ? confluenceZone.overlapTop : pattern.shiftCandle.close;
    stopLoss = pattern.sweepPrice + (pattern.sweepPrice * 0.001);
  }

  const risk = Math.abs(suggestedEntry - stopLoss);
  const multiplier = direction === 'long' ? 1 : -1;
  const takeProfit1 = suggestedEntry + (risk * 2 * multiplier);
  const takeProfit2 = suggestedEntry + (risk * 3 * multiplier);

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
    riskRewardRatio: 2,
    confidence,
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
