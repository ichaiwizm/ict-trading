import type { Candle, OrderBlock } from '@/lib/ict/types';

interface OrderBlockOptions {
  minDisplacement?: number;
  lookback?: number;
}

/**
 * Detects Order Blocks (OB) - institutional supply/demand zones
 * Bullish OB: Small bearish candle followed by large bullish displacement
 * Bearish OB: Small bullish candle followed by large bearish displacement
 */
export function detectOrderBlocks(
  candles: Candle[],
  trend: 'bullish' | 'bearish',
  options: OrderBlockOptions = {}
): OrderBlock[] {
  const { minDisplacement = 0.002, lookback = 50 } = options;
  const orderBlocks: OrderBlock[] = [];

  const startIndex = Math.max(0, candles.length - lookback);

  for (let i = startIndex; i < candles.length - 1; i++) {
    const current = candles[i];
    const next = candles[i + 1];

    // Calculate candle body sizes
    const currentBody = Math.abs(current.close - current.open);
    const nextBody = Math.abs(next.close - next.open);
    const currentRange = current.high - current.low;

    // Check for bullish order block
    if (
      current.close < current.open && // Bearish candle
      next.close > next.open && // Bullish displacement
      nextBody > currentBody * 2 && // Strong displacement
      nextBody / next.open > minDisplacement
    ) {
      orderBlocks.push({
        id: `ob-${i}-bullish`,
        type: 'bullish',
        top: current.high,
        bottom: current.low,
        startTime: current.time,
        status: 'valid',
        retestCount: 0,
        strength: calculateOrderBlockStrength(current, next, currentRange),
      });
    }

    // Check for bearish order block
    if (
      current.close > current.open && // Bullish candle
      next.close < next.open && // Bearish displacement
      nextBody > currentBody * 2 && // Strong displacement
      nextBody / next.open > minDisplacement
    ) {
      orderBlocks.push({
        id: `ob-${i}-bearish`,
        type: 'bearish',
        top: current.high,
        bottom: current.low,
        startTime: current.time,
        status: 'valid',
        retestCount: 0,
        strength: calculateOrderBlockStrength(current, next, currentRange),
      });
    }
  }

  // Filter to keep most relevant OBs
  return filterOrderBlocks(orderBlocks, trend);
}

/**
 * Updates order block status based on price interaction
 */
export function updateOrderBlockStatus(
  ob: OrderBlock,
  currentCandle: Candle
): OrderBlock {
  const updated = { ...ob };

  if (ob.type === 'bullish') {
    // Check if price has retested the OB
    if (currentCandle.low <= ob.top && currentCandle.low >= ob.bottom) {
      updated.retestCount++;
      updated.status = 'mitigated';
    }

    // Check if price has broken through
    if (currentCandle.close < ob.bottom) {
      updated.status = 'invalidated';
    }
  } else {
    // Bearish OB
    if (currentCandle.high >= ob.bottom && currentCandle.high <= ob.top) {
      updated.retestCount++;
      updated.status = 'mitigated';
    }

    if (currentCandle.close > ob.top) {
      updated.status = 'invalidated';
    }
  }

  return updated;
}

function calculateOrderBlockStrength(
  setupCandle: Candle,
  displacementCandle: Candle,
  setupRange: number
): number {
  const displacementSize = Math.abs(displacementCandle.close - displacementCandle.open);
  const displacementPercent = (displacementSize / displacementCandle.open) * 100;

  // Smaller setup candle = stronger OB
  const setupBody = Math.abs(setupCandle.close - setupCandle.open);
  const setupRatio = setupBody / setupRange;

  // Combine factors for strength score
  const strength = (displacementPercent * 20) * (1 - setupRatio * 0.5);

  return Math.min(Math.max(strength, 1), 100);
}

function filterOrderBlocks(
  orderBlocks: OrderBlock[],
  trend: 'bullish' | 'bearish'
): OrderBlock[] {
  const activeOBs = orderBlocks.filter(ob => ob.status === 'valid');

  if (trend === 'bullish') {
    // In uptrend, keep lowest bullish OBs (support)
    const bullishOBs = activeOBs.filter(ob => ob.type === 'bullish');
    return bullishOBs
      .sort((a, b) => a.bottom - b.bottom)
      .slice(0, 3);
  } else {
    // In downtrend, keep highest bearish OBs (resistance)
    const bearishOBs = activeOBs.filter(ob => ob.type === 'bearish');
    return bearishOBs
      .sort((a, b) => b.top - a.top)
      .slice(0, 3);
  }
}
