// Market data provider - OANDA fxTrade API
// Documentation: https://developer.oanda.com/rest-live-v20/instrument-ep/

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

export interface ConnectionStatus {
  isConnected: boolean;
  isLive: boolean;
  latencyMs: number;
  lastSuccessfulFetch: number;
  consecutiveErrors: number;
  environment: 'practice' | 'live';
  error?: string;
  // API call tracking
  apiCallCount: number;
  quoteFetchCount: number;
  candleFetchCount: number;
  lastQuoteCallTime: number;
  lastCandleCallTime: number;
}

export type DataSource = 'oanda';

interface DataProviderConfig {
  source: DataSource;
  apiKey?: string;
  accountId?: string;
  environment: 'practice' | 'live';
}

// OANDA timeframe mapping
const OANDA_GRANULARITY: Record<string, string> = {
  '5S': 'S5',
  '10S': 'S10',
  '15S': 'S15',
  '30S': 'S30',
  '1m': 'M1',
  '2m': 'M2',
  '5m': 'M5',
  '10m': 'M10',
  '15m': 'M15',
  '30m': 'M30',
  '1h': 'H1',
  '1H': 'H1',
  '2h': 'H2',
  '3h': 'H3',
  '4h': 'H4',
  '4H': 'H4',
  '6h': 'H6',
  '8h': 'H8',
  '12h': 'H12',
  '1D': 'D',
  '1d': 'D',
  'D': 'D',
  '1W': 'W',
  '1w': 'W',
  'W': 'W',
  '1M': 'M',
};

// Symbol mapping to OANDA format
const OANDA_INSTRUMENTS: Record<string, string> = {
  'EURUSD': 'EUR_USD',
  'XAUUSD': 'XAU_USD',
  'GBPUSD': 'GBP_USD',
  'USDJPY': 'USD_JPY',
  'AUDUSD': 'AUD_USD',
  'USDCAD': 'USD_CAD',
  'USDCHF': 'USD_CHF',
  'NZDUSD': 'NZD_USD',
};

// Reverse mapping for display
const INSTRUMENT_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(OANDA_INSTRUMENTS).map(([k, v]) => [v, k])
);

class MarketDataProvider {
  private config: DataProviderConfig;
  private cache: Map<string, { data: Candle[]; timestamp: number }> = new Map();
  private quoteCache: Map<string, { quote: Quote; timestamp: number }> = new Map();
  private cacheTimeout = 30000; // 30 seconds for real-time data
  private quoteCacheTimeout = 5000; // 5 seconds for quotes

  // Connection status tracking
  private _connectionStatus: ConnectionStatus = {
    isConnected: false,
    isLive: false,
    latencyMs: 0,
    lastSuccessfulFetch: 0,
    consecutiveErrors: 0,
    environment: 'practice',
    apiCallCount: 0,
    quoteFetchCount: 0,
    candleFetchCount: 0,
    lastQuoteCallTime: 0,
    lastCandleCallTime: 0,
  };

  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OANDA_API_KEY;
    const accountId = process.env.NEXT_PUBLIC_OANDA_ACCOUNT_ID;
    const env = (process.env.NEXT_PUBLIC_OANDA_ENVIRONMENT || 'practice') as 'practice' | 'live';

    console.log('[OANDA] Initializing...');
    console.log('[OANDA] API Key present:', !!apiKey);
    console.log('[OANDA] Account ID present:', !!accountId);
    console.log('[OANDA] Environment:', env);

    this.config = {
      source: 'oanda',
      apiKey,
      accountId,
      environment: env,
    };

    this._connectionStatus.environment = env;
  }

  // Get the base URL based on environment
  private getBaseUrl(): string {
    return this.config.environment === 'live'
      ? 'https://api-fxtrade.oanda.com'
      : 'https://api-fxpractice.oanda.com';
  }

  // Subscribe to connection status changes
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    // Immediately send current status
    callback(this._connectionStatus);
    return () => this.statusListeners.delete(callback);
  }

  // Get current connection status
  get connectionStatus(): ConnectionStatus {
    return { ...this._connectionStatus };
  }

  private updateStatus(updates: Partial<ConnectionStatus>) {
    this._connectionStatus = { ...this._connectionStatus, ...updates };
    this.statusListeners.forEach(cb => cb(this._connectionStatus));
  }

  private handleSuccess(latencyMs: number) {
    this.updateStatus({
      isConnected: true,
      isLive: true,
      latencyMs,
      lastSuccessfulFetch: Date.now(),
      consecutiveErrors: 0,
      error: undefined,
    });
  }

  private handleError(error: string) {
    const newErrorCount = this._connectionStatus.consecutiveErrors + 1;
    this.updateStatus({
      isConnected: newErrorCount < 3, // Consider disconnected after 3 consecutive errors
      isLive: false,
      consecutiveErrors: newErrorCount,
      error,
    });
  }

  async getCandles(
    symbol: 'EURUSD' | 'XAUUSD',
    timeframe: string,
    limit: number = 200
  ): Promise<Candle[]> {
    const cacheKey = `${symbol}_${timeframe}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[OANDA] Using cached candles for ${symbol} ${timeframe}`);
      return cached.data;
    }

    console.log(`[OANDA] Fetching candles for ${symbol} ${timeframe}...`);

    const candles = await this.fetchOandaCandles(symbol, timeframe, limit);
    this.cache.set(cacheKey, { data: candles, timestamp: Date.now() });
    return candles;
  }

  async getQuote(symbol: 'EURUSD' | 'XAUUSD'): Promise<Quote> {
    const cached = this.quoteCache.get(symbol);

    if (cached && Date.now() - cached.timestamp < this.quoteCacheTimeout) {
      return cached.quote;
    }

    if (!this.config.apiKey) {
      const error = 'OANDA API key not configured. Set NEXT_PUBLIC_OANDA_API_KEY in .env.local';
      this.handleError(error);
      throw new Error(error);
    }

    if (!this.config.accountId) {
      const error = 'OANDA Account ID not configured. Set NEXT_PUBLIC_OANDA_ACCOUNT_ID in .env.local';
      this.handleError(error);
      throw new Error(error);
    }

    const instrument = OANDA_INSTRUMENTS[symbol];
    if (!instrument) {
      throw new Error(`Unknown symbol: ${symbol}`);
    }

    const url = `${this.getBaseUrl()}/v3/accounts/${this.config.accountId}/pricing?instruments=${instrument}`;

    console.log(`[OANDA] Fetching quote for ${symbol} (${instrument})...`);

    // Track API call
    this._connectionStatus.apiCallCount++;
    this._connectionStatus.quoteFetchCount++;
    this._connectionStatus.lastQuoteCallTime = Date.now();

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.errorMessage || `HTTP ${response.status}`;
        this.handleError(errorMsg);
        throw new Error(`OANDA API error: ${errorMsg}`);
      }

      const data = await response.json();
      this.handleSuccess(latencyMs);

      const pricing = data.prices?.[0];
      if (!pricing) {
        throw new Error('No pricing data returned from OANDA');
      }

      // OANDA returns array of bids and asks
      const bid = parseFloat(pricing.bids?.[0]?.price || '0');
      const ask = parseFloat(pricing.asks?.[0]?.price || '0');

      const quote: Quote = {
        symbol,
        bid,
        ask,
        spread: ask - bid,
        timestamp: Date.now(),
        source: `OANDA ${this.config.environment === 'live' ? 'LIVE' : 'PRACTICE'}`,
      };

      console.log(`[OANDA] Quote: bid=${bid.toFixed(5)}, ask=${ask.toFixed(5)}, latency=${latencyMs}ms`);

      this.quoteCache.set(symbol, { quote, timestamp: Date.now() });
      return quote;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[OANDA] Failed to fetch quote:', errorMsg);
      this.handleError(errorMsg);
      throw error;
    }
  }

  private async fetchOandaCandles(
    symbol: string,
    timeframe: string,
    limit: number
  ): Promise<Candle[]> {
    if (!this.config.apiKey) {
      const error = 'OANDA API key not configured. Set NEXT_PUBLIC_OANDA_API_KEY in .env.local';
      this.handleError(error);
      throw new Error(error);
    }

    const instrument = OANDA_INSTRUMENTS[symbol];
    if (!instrument) {
      throw new Error(`Unknown symbol: ${symbol}`);
    }

    const granularity = OANDA_GRANULARITY[timeframe];
    if (!granularity) {
      console.warn(`[OANDA] Unknown timeframe ${timeframe}, defaulting to H1`);
    }

    const finalGranularity = granularity || 'H1';
    const count = Math.min(limit, 5000); // OANDA max is 5000

    const url = `${this.getBaseUrl()}/v3/instruments/${instrument}/candles?granularity=${finalGranularity}&count=${count}&price=M`;

    console.log(`[OANDA] Fetching ${count} ${finalGranularity} candles for ${instrument}...`);

    // Track API call
    this._connectionStatus.apiCallCount++;
    this._connectionStatus.candleFetchCount++;
    this._connectionStatus.lastCandleCallTime = Date.now();

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.errorMessage || `HTTP ${response.status}`;
        this.handleError(errorMsg);
        throw new Error(`OANDA API error: ${errorMsg}`);
      }

      const data = await response.json();
      this.handleSuccess(latencyMs);

      if (!data.candles || !Array.isArray(data.candles)) {
        throw new Error('Invalid candle data from OANDA');
      }

      const candles: Candle[] = data.candles
        .filter((c: any) => c.complete !== false) // Only complete candles
        .map((c: any) => ({
          time: new Date(c.time).getTime() / 1000,
          open: parseFloat(c.mid.o),
          high: parseFloat(c.mid.h),
          low: parseFloat(c.mid.l),
          close: parseFloat(c.mid.c),
          volume: c.volume,
          source: `OANDA ${finalGranularity}`,
        }));

      console.log(`[OANDA] Received ${candles.length} candles, latency=${latencyMs}ms`);
      return candles;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[OANDA] Failed to fetch candles:', errorMsg);
      this.handleError(errorMsg);
      throw error;
    }
  }

  // Get supported timeframes
  getSupportedTimeframes(): string[] {
    return Object.keys(OANDA_GRANULARITY);
  }

  // Get supported symbols
  getSupportedSymbols(): string[] {
    return Object.keys(OANDA_INSTRUMENTS);
  }

  // Check if configuration is valid
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.accountId);
  }

  // Clear all caches
  clearCache() {
    this.cache.clear();
    this.quoteCache.clear();
    console.log('[OANDA] Cache cleared');
  }
}

export const marketDataProvider = new MarketDataProvider();
