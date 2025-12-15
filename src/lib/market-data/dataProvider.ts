// Market data provider - OANDA as primary source
// Provides real-time forex data via OANDA API v20

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  source: string;
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
  source: string;
}

export type DataSource = 'oanda';

class MarketDataProvider {
  private cache: Map<string, { data: Candle[]; timestamp: number }> = new Map();
  private quoteCache: Map<string, { quote: Quote; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute for candles
  private quoteCacheTimeout = 5000; // 5 seconds for quotes

  constructor() {
    console.log('[DataProvider] Initialized with OANDA');
  }

  async getCandles(
    symbol: 'EURUSD' | 'XAUUSD',
    timeframe: string,
    limit: number = 200
  ): Promise<Candle[]> {
    const cacheKey = `${symbol}_${timeframe}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[DataProvider] Using cached candles for ${symbol} ${timeframe}`);
      return cached.data;
    }

    console.log(`[DataProvider] Fetching candles from OANDA: ${symbol} ${timeframe}...`);

    try {
      const response = await fetch(
        `/api/oanda/candles?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch candles');
      }

      const data = await response.json();

      if (!data.success || !data.candles) {
        throw new Error('Invalid response from OANDA API');
      }

      const candles: Candle[] = data.candles;
      console.log(`[DataProvider] Received ${candles.length} candles from OANDA`);

      this.cache.set(cacheKey, { data: candles, timestamp: Date.now() });
      return candles;
    } catch (error) {
      console.error('[DataProvider] Failed to fetch candles:', error);
      throw error;
    }
  }

  async getQuote(symbol: 'EURUSD' | 'XAUUSD'): Promise<Quote> {
    const cached = this.quoteCache.get(symbol);

    if (cached && Date.now() - cached.timestamp < this.quoteCacheTimeout) {
      return cached.quote;
    }

    console.log(`[DataProvider] Fetching quote from OANDA: ${symbol}...`);

    try {
      const response = await fetch(`/api/oanda/pricing?symbol=${symbol}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch quote');
      }

      const data = await response.json();

      if (!data.success || !data.quote) {
        throw new Error('Invalid response from OANDA API');
      }

      const quote: Quote = data.quote;
      console.log(`[DataProvider] Quote from OANDA: bid=${quote.bid}, ask=${quote.ask}`);

      this.quoteCache.set(symbol, { quote, timestamp: Date.now() });
      return quote;
    } catch (error) {
      console.error('[DataProvider] Failed to fetch quote:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.quoteCache.clear();
    console.log('[DataProvider] Cache cleared');
  }
}

export const marketDataProvider = new MarketDataProvider();
