import type { SwingPoint, FibonacciZone, FibonacciLevel } from '@/lib/ict/types';

/**
 * Calculates Fibonacci retracement levels from swing points
 */
export function calculateFibonacci(
  swingPoints: SwingPoint[],
  trend: 'bullish' | 'bearish'
): FibonacciZone | null {
  const highs = swingPoints.filter(sp => sp.type === 'high');
  const lows = swingPoints.filter(sp => sp.type === 'low');

  if (highs.length === 0 || lows.length === 0) {
    return null;
  }

  // Get most recent swing high and swing low
  const swingHigh = highs[highs.length - 1];
  const swingLow = lows[lows.length - 1];

  // Calculate Fibonacci levels
  const range = swingHigh.price - swingLow.price;
  const levels: FibonacciLevel[] = [
    { level: 0, price: swingLow.price, label: '0.0' },
    { level: 0.236, price: swingLow.price + range * 0.236, label: '0.236' },
    { level: 0.382, price: swingLow.price + range * 0.382, label: '0.382' },
    { level: 0.5, price: swingLow.price + range * 0.5, label: '0.5' },
    { level: 0.618, price: swingLow.price + range * 0.618, label: '0.618' },
    { level: 0.786, price: swingLow.price + range * 0.786, label: '0.786' },
    { level: 1, price: swingHigh.price, label: '1.0' },
  ];

  // Define premium and discount zones
  const level50 = swingLow.price + range * 0.5;
  const premiumZone = {
    top: swingHigh.price,
    bottom: level50,
  };
  const discountZone = {
    top: level50,
    bottom: swingLow.price,
  };

  return {
    swingLow,
    swingHigh,
    levels,
    premiumZone,
    discountZone,
  };
}

/**
 * Checks if price is in the optimal entry zone (0.618-0.786 for trend continuation)
 */
export function isPriceInOptimalZone(
  price: number,
  fib: FibonacciZone,
  direction: 'long' | 'short'
): boolean {
  const level618 = fib.levels.find(l => l.level === 0.618);
  const level786 = fib.levels.find(l => l.level === 0.786);

  if (!level618 || !level786) {
    return false;
  }

  if (direction === 'long') {
    // For long entries, we want price in discount zone (0.618-0.786 retracement)
    return price >= level618.price && price <= level786.price;
  } else {
    // For short entries, check if price is in premium zone
    return price >= level618.price && price <= level786.price;
  }
}

/**
 * Gets the zone type for a given price
 */
export function getPriceZone(
  price: number,
  fib: FibonacciZone
): 'premium' | 'discount' | 'equilibrium' {
  const level50 = fib.levels.find(l => l.level === 0.5);

  if (!level50) {
    return 'equilibrium';
  }

  if (price > level50.price) {
    return 'premium';
  } else if (price < level50.price) {
    return 'discount';
  } else {
    return 'equilibrium';
  }
}
