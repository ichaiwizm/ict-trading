// Abstract data provider with demo mode support
// Easily switch between demo, Alpha Vantage (free), and Twelve Data (paid)

import { generateDemoCandles, getCurrentPrice } from './demoData';

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

export type DataSource = 'demo' | 'alphavantage' | 'twelvedata';

interface DataProviderConfig {
  source: DataSource;
  apiKey?: string;
}

class MarketDataProvider {
  private config: DataProviderConfig;
  private cache: Map<string, { data: Candle[]; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute

  constructor() {
    // Use Alpha Vantage by default if API key is available
    const apiKey = typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
      : process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

    this.config = apiKey
      ? { source: 'alphavantage', apiKey }
      : { source: 'demo' };
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
        candles = generateDemoCandles(symbol, timeframe, limit);
    }

    this.cache.set(cacheKey, { data: candles, timestamp: Date.now() });
    return candles;
  }

  getQuote(symbol: 'EURUSD' | 'XAUUSD'): Quote {
    const price = getCurrentPrice(symbol);
    return {
      symbol,
      ...price,
      timestamp: Date.now(),
    };
  }

  private async fetchAlphaVantage(
    symbol: string,
    timeframe: string,
    limit: number
  ): Promise<Candle[]> {
    if (!this.config.apiKey) {
      console.warn('Alpha Vantage API key not set, using demo data');
      return generateDemoCandles(symbol as 'EURUSD' | 'XAUUSD', timeframe, limit);
    }

    // Alpha Vantage forex endpoint
    const interval = this.mapTimeframeToAV(timeframe);
    const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${symbol.slice(0, 3)}&to_symbol=${symbol.slice(3)}&interval=${interval}&apikey=${this.config.apiKey}&outputsize=full`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data['Error Message'] || data['Note']) {
        console.warn('Alpha Vantage error, using demo data');
        return generateDemoCandles(symbol as 'EURUSD' | 'XAUUSD', timeframe, limit);
      }

      const timeSeries = data[`Time Series FX (${interval})`] || {};
      return Object.entries(timeSeries)
        .slice(0, limit)
        .map(([time, values]: [string, any]) => ({
          time: new Date(time).getTime() / 1000,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
        }))
        .reverse();
    } catch {
      return generateDemoCandles(symbol as 'EURUSD' | 'XAUUSD', timeframe, limit);
    }
  }

  private async fetchTwelveData(
    symbol: string,
    timeframe: string,
    limit: number
  ): Promise<Candle[]> {
    if (!this.config.apiKey) {
      console.warn('Twelve Data API key not set, using demo data');
      return generateDemoCandles(symbol as 'EURUSD' | 'XAUUSD', timeframe, limit);
    }

    const interval = this.mapTimeframeToTD(timeframe);
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${limit}&apikey=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'error') {
        console.warn('Twelve Data error, using demo data');
        return generateDemoCandles(symbol as 'EURUSD' | 'XAUUSD', timeframe, limit);
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
    } catch {
      return generateDemoCandles(symbol as 'EURUSD' | 'XAUUSD', timeframe, limit);
    }
  }

  private mapTimeframeToAV(tf: string): string {
    const map: Record<string, string> = {
      '1m': '1min', '5m': '5min', '15m': '15min',
      '1h': '60min', '4h': '60min', '1D': 'daily',
    };
    return map[tf] || '15min';
  }

  private mapTimeframeToTD(tf: string): string {
    const map: Record<string, string> = {
      '1m': '1min', '5m': '5min', '15m': '15min',
      '1h': '1h', '4h': '4h', '1D': '1day',
    };
    return map[tf] || '15min';
  }
}

export const marketDataProvider = new MarketDataProvider();
