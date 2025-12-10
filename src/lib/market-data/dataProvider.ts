// Market data provider - Multiple sources with clear attribution
// Sources:
// - Alpha Vantage CURRENCY_EXCHANGE_RATE: Real-time quotes (FREE)
// - Alpha Vantage FX_DAILY: Daily candles (FREE)
// - Alpha Vantage FX_INTRADAY: Intraday candles (PREMIUM - not available)

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  source: string; // Attribution: where this data comes from
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
  source: string; // Attribution: where this data comes from
}

export type DataSource = 'alphavantage';

interface DataProviderConfig {
  source: DataSource;
  apiKey?: string;
}

class MarketDataProvider {
  private config: DataProviderConfig;
  private cache: Map<string, { data: Candle[]; timestamp: number }> = new Map();
  private quoteCache: Map<string, { quote: Quote; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

    console.log('[DataProvider] Initializing...');
    console.log('[DataProvider] Alpha Vantage API Key present:', !!apiKey);

    this.config = { source: 'alphavantage', apiKey };
  }

  setConfig(config: DataProviderConfig) {
    this.config = config;
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

    console.log(`[DataProvider] Fetching candles for ${symbol} ${timeframe}...`);

    // Only daily timeframe is available for free on Alpha Vantage
    if (timeframe !== '1D') {
      console.warn(`[DataProvider] Timeframe ${timeframe} not available (Alpha Vantage FREE only supports daily)`);
      console.warn('[DataProvider] Falling back to daily candles');
    }

    const candles = await this.fetchAlphaVantageDaily(symbol, limit);

    this.cache.set(cacheKey, { data: candles, timestamp: Date.now() });
    return candles;
  }

  async getQuote(symbol: 'EURUSD' | 'XAUUSD'): Promise<Quote> {
    const cached = this.quoteCache.get(symbol);

    // Quote cache is shorter - 30 seconds (to respect rate limits)
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.quote;
    }

    if (!this.config.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const fromSymbol = symbol.slice(0, 3);
    const toSymbol = symbol.slice(3);

    // For XAUUSD (Gold), use XAU
    const from = symbol === 'XAUUSD' ? 'XAU' : fromSymbol;
    const to = symbol === 'XAUUSD' ? 'USD' : toSymbol;

    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.config.apiKey}`;

    console.log(`[DataProvider] Fetching quote from Alpha Vantage: ${from}/${to}`);

    try {
      const response = await fetch(url);
      const data = await response.json();

      const rateData = data['Realtime Currency Exchange Rate'];
      if (rateData) {
        const bid = parseFloat(rateData['8. Bid Price'] || rateData['5. Exchange Rate']);
        const ask = parseFloat(rateData['9. Ask Price'] || rateData['5. Exchange Rate']);

        const quote: Quote = {
          symbol,
          bid,
          ask,
          spread: ask - bid,
          timestamp: Date.now(),
          source: 'Alpha Vantage CURRENCY_EXCHANGE_RATE',
        };

        console.log(`[DataProvider] Quote from Alpha Vantage: bid=${bid}, ask=${ask}`);

        this.quoteCache.set(symbol, { quote, timestamp: Date.now() });
        return quote;
      }

      if (data['Note']) {
        throw new Error('Alpha Vantage rate limit exceeded. Please wait.');
      }

      throw new Error('Invalid response from Alpha Vantage');
    } catch (error) {
      console.error('[DataProvider] Failed to fetch quote:', error);
      throw error;
    }
  }

  private async fetchAlphaVantageDaily(
    symbol: string,
    limit: number
  ): Promise<Candle[]> {
    if (!this.config.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const fromSymbol = symbol.slice(0, 3);
    const toSymbol = symbol.slice(3);

    // For XAUUSD (Gold), use XAU
    const from = symbol === 'XAUUSD' ? 'XAU' : fromSymbol;
    const to = symbol === 'XAUUSD' ? 'USD' : toSymbol;

    const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&apikey=${this.config.apiKey}&outputsize=full`;

    console.log(`[DataProvider] Fetching daily candles from Alpha Vantage: ${from}/${to}`);

    const response = await fetch(url);
    const data = await response.json();

    console.log('[DataProvider] Alpha Vantage response keys:', Object.keys(data));

    if (data['Error Message']) {
      console.error('[DataProvider] Alpha Vantage error:', data['Error Message']);
      throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
    }

    if (data['Note']) {
      console.error('[DataProvider] Alpha Vantage rate limit:', data['Note']);
      throw new Error('Alpha Vantage rate limit exceeded. Please wait and try again.');
    }

    if (data['Information']) {
      console.error('[DataProvider] Alpha Vantage info:', data['Information']);
      throw new Error(`Alpha Vantage: ${data['Information']}`);
    }

    const timeSeries = data['Time Series FX (Daily)'];

    if (!timeSeries) {
      console.error('[DataProvider] No time series found');
      throw new Error('No data returned from Alpha Vantage');
    }

    const candles = Object.entries(timeSeries)
      .slice(0, limit)
      .map(([time, values]: [string, any]) => ({
        time: new Date(time).getTime() / 1000,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        source: 'Alpha Vantage FX_DAILY',
      }))
      .reverse();

    console.log(`[DataProvider] Received ${candles.length} daily candles from Alpha Vantage`);
    return candles;
  }
}

export const marketDataProvider = new MarketDataProvider();
