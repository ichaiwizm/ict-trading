import type { Candle, FairValueGap, FibonacciZone } from '@/lib/ict/types';

/**
 * Detects Fair Value Gaps (FVG) in price action
 * Bullish FVG: Gap between candle[i-2].high and candle[i].low
 * Bearish FVG: Gap between candle[i-2].low and candle[i].high
 */
export function detectFairValueGaps(
  candles: Candle[],
  fibonacci?: FibonacciZone
): FairValueGap[] {
  const fvgs: FairValueGap[] = [];

  if (candles.length < 3) {
    return fvgs;
  }

  for (let i = 2; i < candles.length; i++) {
    const candle1 = candles[i - 2];
    const candle2 = candles[i - 1];
    const candle3 = candles[i];

    // Bullish FVG: Gap up
    if (candle1.high < candle3.low) {
      const fvg: FairValueGap = {
        id: `fvg-${i}-bullish`,
        type: 'bullish',
        top: candle3.low,
        bottom: candle1.high,
        startTime: candle3.time,
        status: 'unfilled',
        fillPercentage: 0,
        inPremium: false,
        inDiscount: false,
      };

      // Mark premium/discount zones if fibonacci available
      if (fibonacci) {
        const midpoint = (fvg.top + fvg.bottom) / 2;
        fvg.inDiscount = midpoint < fibonacci.discountZone.top;
        fvg.inPremium = midpoint > fibonacci.premiumZone.bottom;
      }

      fvgs.push(fvg);
    }

    // Bearish FVG: Gap down
    if (candle1.low > candle3.high) {
      const fvg: FairValueGap = {
        id: `fvg-${i}-bearish`,
        type: 'bearish',
        top: candle1.low,
        bottom: candle3.high,
        startTime: candle3.time,
        status: 'unfilled',
        fillPercentage: 0,
        inPremium: false,
        inDiscount: false,
      };

      if (fibonacci) {
        const midpoint = (fvg.top + fvg.bottom) / 2;
        fvg.inDiscount = midpoint < fibonacci.discountZone.top;
        fvg.inPremium = midpoint > fibonacci.premiumZone.bottom;
      }

      fvgs.push(fvg);
    }
  }

  return fvgs;
}

/**
 * Updates FVG status based on price interaction
 */
export function updateFVGStatus(
  fvg: FairValueGap,
  currentCandle: Candle
): FairValueGap {
  const updated = { ...fvg };
  const gapSize = fvg.top - fvg.bottom;

  if (fvg.type === 'bullish') {
    // Check if price has filled into the gap
    if (currentCandle.low <= fvg.top && currentCandle.low >= fvg.bottom) {
      const filled = fvg.top - currentCandle.low;
      updated.fillPercentage = (filled / gapSize) * 100;

      if (updated.fillPercentage >= 100) {
        updated.status = 'filled';
      } else if (updated.fillPercentage > 0) {
        updated.status = 'partially_filled';
      }
    }

    // Invalidated if price closes below the gap
    if (currentCandle.close < fvg.bottom) {
      updated.status = 'invalidated';
    }
  } else {
    // Bearish FVG
    if (currentCandle.high >= fvg.bottom && currentCandle.high <= fvg.top) {
      const filled = currentCandle.high - fvg.bottom;
      updated.fillPercentage = (filled / gapSize) * 100;

      if (updated.fillPercentage >= 100) {
        updated.status = 'filled';
      } else if (updated.fillPercentage > 0) {
        updated.status = 'partially_filled';
      }
    }

    // Invalidated if price closes above the gap
    if (currentCandle.close > fvg.top) {
      updated.status = 'invalidated';
    }
  }

  return updated;
}
