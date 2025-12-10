// Market data provider - Alpha Vantage only

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
}

export type DataSource = 'alphavantage' | 'twelvedata';

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
    console.log('[DataProvider] API Key present:', !!apiKey);

    if (!apiKey) {
      console.warn('[DataProvider] NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY not set');
    }

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
      return cached.data;
    }

    let candles: Candle[];

    switch (this.config.source) {
      case 'alphavantage':
        candles = await this.fetchAlphaVantage(symbol, timeframe, limit);
        break;
      case 'twelvedata':
        candles = await this.fetchTwelveData(symbol, timeframe, limit);
        break;
      default:
        throw new Error(`Unknown data source: ${this.config.source}`);
    }

    this.cache.set(cacheKey, { data: candles, timestamp: Date.now() });
    return candles;
  }

  async getQuote(symbol: 'EURUSD' | 'XAUUSD'): Promise<Quote> {
    const cached = this.quoteCache.get(symbol);

    // Quote cache is shorter - 10 seconds
    if (cached && Date.now() - cached.timestamp < 10000) {
      return cached.quote;
    }

    // Try to get quote from forex exchange rate endpoint
    if (this.config.apiKey) {
      try {
        const fromSymbol = symbol.slice(0, 3);
        const toSymbol = symbol.slice(3);
        const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromSymbol}&to_currency=${toSymbol}&apikey=${this.config.apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        const rateData = data['Realtime Currency Exchange Rate'];
        if (rateData) {
          const rate = parseFloat(rateData['5. Exchange Rate']);
          const spread = symbol === 'XAUUSD' ? 0.5 : 0.00015;

          const quote: Quote = {
            symbol,
            bid: rate - spread / 2,
            ask: rate + spread / 2,
            spread,
            timestamp: Date.now(),
          };

          this.quoteCache.set(symbol, { quote, timestamp: Date.now() });
          return quote;
        }
      } catch (error) {
        console.error('Failed to fetch quote:', error);
      }
    }

    // Fallback to last candle price if quote fails
    const candles = this.cache.get(`${symbol}_15m`);
    if (candles && candles.data.length > 0) {
      const lastCandle = candles.data[candles.data.length - 1];
      const spread = symbol === 'XAUUSD' ? 0.5 : 0.00015;

      return {
        symbol,
        bid: lastCandle.close - spread / 2,
        ask: lastCandle.close + spread / 2,
        spread,
        timestamp: Date.now(),
      };
    }

    throw new Error(`No quote data available for ${symbol}`);
  }

  private async fetchAlphaVantage(
    symbol: string,
    timeframe: string,
    limit: number
  ): Promise<Candle[]> {
    if (!this.config.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const fromSymbol = symbol.slice(0, 3);
    const toSymbol = symbol.slice(3);
    const interval = this.mapTimeframeToAV(timeframe);

    // Use daily endpoint for 1D timeframe
    const func = timeframe === '1D' ? 'FX_DAILY' : 'FX_INTRADAY';
    let url = `https://www.alphavantage.co/query?function=${func}&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${this.config.apiKey}&outputsize=full`;

    if (func === 'FX_INTRADAY') {
      url += `&interval=${interval}`;
    }

    console.log(`[DataProvider] Fetching from Alpha Vantage: ${func} ${fromSymbol}/${toSymbol} ${interval}`);

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

    const timeSeriesKey = func === 'FX_DAILY'
      ? 'Time Series FX (Daily)'
      : `Time Series FX (${interval})`;

    const timeSeries = data[timeSeriesKey];

    if (!timeSeries) {
      console.error('[DataProvider] No time series found. Expected key:', timeSeriesKey);
      console.error('[DataProvider] Available keys:', Object.keys(data));
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
      }))
      .reverse();

    console.log(`[DataProvider] Parsed ${candles.length} candles`);
    return candles;
  }

  private async fetchTwelveData(
    symbol: string,
    timeframe: string,
    limit: number
  ): Promise<Candle[]> {
    if (!this.config.apiKey) {
      throw new Error('Twelve Data API key not configured');
    }

    const interval = this.mapTimeframeToTD(timeframe);
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${limit}&apikey=${this.config.apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(`Twelve Data error: ${data.message}`);
    }

    return (data.values || [])
      .map((v: any) => ({
        time: new Date(v.datetime).getTime() / 1000,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseInt(v.volume || '0'),
      }))
      .reverse();
  }

  private mapTimeframeToAV(tf: string): string {
    const map: Record<string, string> = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '1h': '60min',
      '4h': '60min', // Alpha Vantage doesn't support 4h, use 60min
      '1D': 'daily',
    };
    return map[tf] || '15min';
  }

  private mapTimeframeToTD(tf: string): string {
    const map: Record<string, string> = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '1h': '1h',
      '4h': '4h',
      '1D': '1day',
    };
    return map[tf] || '15min';
  }
}

export const marketDataProvider = new MarketDataProvider();
