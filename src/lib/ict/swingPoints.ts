import type { Candle, SwingPoint } from '@/lib/ict/types';

/**
 * Detects swing high and swing low points in price data
 * A swing high: current high > N candles before AND after
 * A swing low: current low < N candles before AND after
 */
export function detectSwingPoints(
  candles: Candle[],
  swingLength = 5
): SwingPoint[] {
  const swingPoints: SwingPoint[] = [];

  if (candles.length < swingLength * 2 + 1) {
    return swingPoints;
  }

  for (let i = swingLength; i < candles.length - swingLength; i++) {
    const current = candles[i];

    // Check for swing high
    let isSwingHigh = true;
    for (let j = 1; j <= swingLength; j++) {
      if (
        current.high <= candles[i - j].high ||
        current.high <= candles[i + j].high
      ) {
        isSwingHigh = false;
        break;
      }
    }

    if (isSwingHigh) {
      swingPoints.push({
        index: i,
        time: current.time,
        price: current.high,
        type: 'high',
        strength: calculateSwingStrength(candles, i, 'high', swingLength),
      });
    }

    // Check for swing low
    let isSwingLow = true;
    for (let j = 1; j <= swingLength; j++) {
      if (
        current.low >= candles[i - j].low ||
        current.low >= candles[i + j].low
      ) {
        isSwingLow = false;
        break;
      }
    }

    if (isSwingLow) {
      swingPoints.push({
        index: i,
        time: current.time,
        price: current.low,
        type: 'low',
        strength: calculateSwingStrength(candles, i, 'low', swingLength),
      });
    }
  }

  return swingPoints;
}

function calculateSwingStrength(
  candles: Candle[],
  index: number,
  type: 'high' | 'low',
  swingLength: number
): number {
  const current = candles[index];
  let totalDiff = 0;
  let count = 0;

  for (let j = 1; j <= swingLength; j++) {
    if (type === 'high') {
      totalDiff += current.high - Math.max(candles[index - j].high, candles[index + j].high);
    } else {
      totalDiff += Math.min(candles[index - j].low, candles[index + j].low) - current.low;
    }
    count += 2;
  }

  const avgDiff = totalDiff / count;
  const price = type === 'high' ? current.high : current.low;
  const strengthPercent = (avgDiff / price) * 100;

  return Math.min(Math.max(strengthPercent * 10, 1), 100);
}
