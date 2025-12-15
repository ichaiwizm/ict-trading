// OANDA Data Provider
// Converts OANDA API data to the app's Candle/Quote format

import { oandaClient } from './client';
import {
  timeframeToGranularity,
  symbolToInstrument,
  OandaGranularity,
} from './types';
import type { Candle, Quote } from '../market-data/dataProvider';

class OandaDataProvider {
  private cache: Map<string, { data: Candle[]; timestamp: number }> = new Map();
  private quoteCache: Map<string, { quote: Quote; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute for candles
  private quoteCacheTimeout = 5000; // 5 seconds for quotes (OANDA allows more frequent calls)

  async getCandles(
    symbol: 'EURUSD' | 'XAUUSD',
    timeframe: string,
    limit: number = 200
  ): Promise<Candle[]> {
    const cacheKey = `${symbol}_${timeframe}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[OandaProvider] Using cached candles for ${symbol} ${timeframe}`);
      return cached.data;
    }

    if (!oandaClient.isConfigured()) {
      throw new Error('OANDA not configured. Please set OANDA_API_KEY in .env.local');
    }

    // Convert symbol and timeframe to OANDA format
    const instrument = symbolToInstrument[symbol] || symbol.replace(/(.{3})(.{3})/, '$1_$2');
    const granularity = timeframeToGranularity[timeframe] || 'H1';

    console.log(`[OandaProvider] Fetching ${timeframe} candles for ${symbol} (${instrument}, ${granularity})...`);

    try {
      const response = await oandaClient.getCandles(instrument, granularity as OandaGranularity, limit);

      const candles: Candle[] = response.candles
        .filter(c => c.complete && c.mid) // Only complete candles with mid prices
        .map(c => ({
          time: new Date(c.time).getTime() / 1000,
          open: parseFloat(c.mid!.o),
          high: parseFloat(c.mid!.h),
          low: parseFloat(c.mid!.l),
          close: parseFloat(c.mid!.c),
          volume: c.volume,
          source: `OANDA ${granularity}`,
        }));

      console.log(`[OandaProvider] Received ${candles.length} candles from OANDA`);

      this.cache.set(cacheKey, { data: candles, timestamp: Date.now() });
      return candles;
    } catch (error) {
      console.error('[OandaProvider] Failed to fetch candles:', error);
      throw error;
    }
  }

  async getQuote(symbol: 'EURUSD' | 'XAUUSD'): Promise<Quote> {
    const cached = this.quoteCache.get(symbol);

    if (cached && Date.now() - cached.timestamp < this.quoteCacheTimeout) {
      return cached.quote;
    }

    if (!oandaClient.isConfigured()) {
      throw new Error('OANDA not configured. Please set OANDA_API_KEY in .env.local');
    }

    const instrument = symbolToInstrument[symbol] || symbol.replace(/(.{3})(.{3})/, '$1_$2');

    console.log(`[OandaProvider] Fetching quote for ${symbol} (${instrument})...`);

    try {
      const response = await oandaClient.getPricing([instrument]);

      if (!response.prices || response.prices.length === 0) {
        throw new Error(`No pricing data for ${instrument}`);
      }

      const price = response.prices[0];
      const bid = parseFloat(price.bids[0]?.price || price.closeoutBid);
      const ask = parseFloat(price.asks[0]?.price || price.closeoutAsk);

      const quote: Quote = {
        symbol,
        bid,
        ask,
        spread: ask - bid,
        timestamp: new Date(price.time).getTime(),
        source: 'OANDA Pricing',
      };

      console.log(`[OandaProvider] Quote: bid=${bid}, ask=${ask}, spread=${quote.spread.toFixed(5)}`);

      this.quoteCache.set(symbol, { quote, timestamp: Date.now() });
      return quote;
    } catch (error) {
      console.error('[OandaProvider] Failed to fetch quote:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return oandaClient.isConfigured();
  }

  clearCache(): void {
    this.cache.clear();
    this.quoteCache.clear();
    console.log('[OandaProvider] Cache cleared');
  }
}

export const oandaDataProvider = new OandaDataProvider();
