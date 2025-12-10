// Demo candlestick data generator for testing without API
// Generates realistic OHLC data with patterns suitable for ICT analysis

export interface DemoCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const SYMBOL_CONFIG = {
  EURUSD: { basePrice: 1.0850, volatility: 0.0015, decimals: 5 },
  XAUUSD: { basePrice: 2650, volatility: 8, decimals: 2 },
};

function generateCandle(
  prevClose: number,
  volatility: number,
  trend: number
): Omit<DemoCandle, 'time'> {
  const change = (Math.random() - 0.5 + trend * 0.3) * volatility;
  const open = prevClose;
  const close = open + change;

  const wickUp = Math.random() * volatility * 0.5;
  const wickDown = Math.random() * volatility * 0.5;

  const high = Math.max(open, close) + wickUp;
  const low = Math.min(open, close) - wickDown;

  const volume = Math.floor(1000 + Math.random() * 5000);

  return { open, high, low, close, volume };
}

export function generateDemoCandles(
  symbol: 'EURUSD' | 'XAUUSD',
  timeframe: string,
  count: number = 200
): DemoCandle[] {
  const config = SYMBOL_CONFIG[symbol];
  const candles: DemoCandle[] = [];

  // Timeframe to milliseconds
  const tfMs: Record<string, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000,
  };

  const interval = tfMs[timeframe] || tfMs['15m'];
  const now = Date.now();
  const startTime = now - count * interval;

  let currentPrice = config.basePrice;
  let trend = Math.random() > 0.5 ? 1 : -1;

  for (let i = 0; i < count; i++) {
    // Occasionally reverse trend to create swing points
    if (Math.random() < 0.05) {
      trend *= -1;
    }

    const candle = generateCandle(currentPrice, config.volatility, trend);
    const time = startTime + i * interval;

    candles.push({
      time: Math.floor(time / 1000), // Unix timestamp in seconds
      ...candle,
    });

    currentPrice = candle.close;
  }

  // Add some specific patterns for ICT analysis
  addICTPatterns(candles, config.volatility);

  return candles;
}

function addICTPatterns(candles: DemoCandle[], volatility: number): void {
  const len = candles.length;

  // Add a clear Order Block pattern around 70% of the data
  const obIndex = Math.floor(len * 0.7);
  if (obIndex + 2 < len) {
    // Small bearish candle followed by large bullish (Bullish OB)
    const base = candles[obIndex];
    base.close = base.open - volatility * 0.2;
    base.low = Math.min(base.open, base.close) - volatility * 0.1;
    base.high = Math.max(base.open, base.close) + volatility * 0.1;

    const displacement = candles[obIndex + 1];
    displacement.open = base.close;
    displacement.close = displacement.open + volatility * 2;
    displacement.high = displacement.close + volatility * 0.3;
    displacement.low = displacement.open - volatility * 0.1;
  }

  // Add a FVG pattern around 75% of the data
  const fvgIndex = Math.floor(len * 0.75);
  if (fvgIndex + 3 < len) {
    const c1 = candles[fvgIndex];
    const c2 = candles[fvgIndex + 1];
    const c3 = candles[fvgIndex + 2];

    // Create gap: c1.high < c3.low
    c2.close = c2.open + volatility * 1.5;
    c2.high = c2.close + volatility * 0.2;
    c2.low = c2.open - volatility * 0.1;

    c3.open = c2.close + volatility * 0.5;
    c3.low = c3.open - volatility * 0.2;
    c3.close = c3.open + volatility * 0.3;
    c3.high = c3.close + volatility * 0.2;
  }
}

export function getCurrentPrice(symbol: 'EURUSD' | 'XAUUSD'): {
  bid: number;
  ask: number;
  spread: number;
} {
  const config = SYMBOL_CONFIG[symbol];
  const fluctuation = (Math.random() - 0.5) * config.volatility * 0.1;
  const mid = config.basePrice + fluctuation;

  const spreadPips = symbol === 'EURUSD' ? 0.00012 : 0.3;

  return {
    bid: mid - spreadPips / 2,
    ask: mid + spreadPips / 2,
    spread: spreadPips,
  };
}
