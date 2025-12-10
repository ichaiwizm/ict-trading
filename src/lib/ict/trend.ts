import type { Candle, SwingPoint, TrendAnalysis, StructureBreak } from '@/lib/ict/types';

/**
 * Analyzes market trend based on swing points
 * Determines bullish/bearish/ranging and detects structure breaks
 */
export function analyzeTrend(
  candles: Candle[],
  swingPoints: SwingPoint[]
): Omit<TrendAnalysis, 'higherTimeframe' | 'lowerTimeframe'> {
  const highs = swingPoints.filter(sp => sp.type === 'high');
  const lows = swingPoints.filter(sp => sp.type === 'low');

  const higherHighs = countHigherHighs(highs);
  const lowerLows = countLowerLows(lows);
  const higherLows = countHigherLows(lows);
  const lowerHighs = countLowerHighs(highs);

  // Determine trend direction
  let direction: 'bullish' | 'bearish' | 'ranging' = 'ranging';
  if (higherHighs >= 2 && higherLows >= 2) {
    direction = 'bullish';
  } else if (lowerLows >= 2 && lowerHighs >= 2) {
    direction = 'bearish';
  }

  // Calculate trend strength (0-100)
  const strength = calculateTrendStrength(
    higherHighs,
    lowerLows,
    higherLows,
    lowerHighs,
    direction
  );

  // Detect structure breaks
  const structureBreaks = detectStructureBreaks(candles, swingPoints);

  return {
    direction,
    strength,
    structureBreaks,
  };
}

function countHigherHighs(highs: SwingPoint[]): number {
  let count = 0;
  for (let i = 1; i < highs.length; i++) {
    if (highs[i].price > highs[i - 1].price) {
      count++;
    }
  }
  return count;
}

function countLowerLows(lows: SwingPoint[]): number {
  let count = 0;
  for (let i = 1; i < lows.length; i++) {
    if (lows[i].price < lows[i - 1].price) {
      count++;
    }
  }
  return count;
}

function countHigherLows(lows: SwingPoint[]): number {
  let count = 0;
  for (let i = 1; i < lows.length; i++) {
    if (lows[i].price > lows[i - 1].price) {
      count++;
    }
  }
  return count;
}

function countLowerHighs(highs: SwingPoint[]): number {
  let count = 0;
  for (let i = 1; i < highs.length; i++) {
    if (highs[i].price < highs[i - 1].price) {
      count++;
    }
  }
  return count;
}

function calculateTrendStrength(
  higherHighs: number,
  lowerLows: number,
  higherLows: number,
  lowerHighs: number,
  direction: 'bullish' | 'bearish' | 'ranging'
): number {
  if (direction === 'ranging') return 0;

  if (direction === 'bullish') {
    const total = higherHighs + higherLows;
    const consistency = total / (total + lowerHighs + lowerLows + 0.01);
    return Math.min(consistency * 100, 100);
  } else {
    const total = lowerLows + lowerHighs;
    const consistency = total / (total + higherHighs + higherLows + 0.01);
    return Math.min(consistency * 100, 100);
  }
}

function detectStructureBreaks(
  candles: Candle[],
  swingPoints: SwingPoint[]
): StructureBreak[] {
  const breaks: StructureBreak[] = [];
  const highs = swingPoints.filter(sp => sp.type === 'high');
  const lows = swingPoints.filter(sp => sp.type === 'low');

  // Check for Break of Structure (BOS) - price breaks recent swing in trend direction
  // Check for Change of Character (CHoCH) - price breaks structure against trend

  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];

    // Check if price breaks above recent swing high (bullish BOS)
    const recentHigh = findRecentSwingPoint(highs, i);
    if (recentHigh && candle.close > recentHigh.price) {
      breaks.push({
        type: 'bos',
        direction: 'bullish',
        price: candle.close,
        time: candle.time,
      });
    }

    // Check if price breaks below recent swing low (bearish BOS)
    const recentLow = findRecentSwingPoint(lows, i);
    if (recentLow && candle.close < recentLow.price) {
      breaks.push({
        type: 'bos',
        direction: 'bearish',
        price: candle.close,
        time: candle.time,
      });
    }
  }

  return breaks;
}

function findRecentSwingPoint(
  swingPoints: SwingPoint[],
  currentIndex: number
): SwingPoint | undefined {
  const previous = swingPoints.filter(sp => sp.index < currentIndex);
  return previous[previous.length - 1];
}
