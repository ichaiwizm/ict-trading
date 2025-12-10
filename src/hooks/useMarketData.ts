'use client';

import { useEffect, useCallback } from 'react';
import { useMarketStore } from '@/stores';
import { marketDataProvider } from '@/lib/market-data';
import type { Candle } from '@/lib/ict/types';

export function useMarketData() {
  const {
    symbol,
    timeframe,
    candles,
    currentPrice,
    bid,
    ask,
    spread,
    isLoading,
    error,
    setCandles,
    updatePrice,
    setLoading,
    setError,
  } = useMarketStore();

  const fetchCandles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await marketDataProvider.getCandles(symbol, timeframe, 200);
      setCandles(timeframe, data as Candle[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch candles');
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, setCandles, setLoading, setError]);

  const refreshPrice = useCallback(async () => {
    try {
      const quote = await marketDataProvider.getQuote(symbol);
      updatePrice(quote.bid, quote.ask);
    } catch (err) {
      console.error('Failed to refresh price:', err);
    }
  }, [symbol, updatePrice]);

  // Fetch candles on symbol/timeframe change
  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  // Update price periodically (every 2 seconds for demo)
  useEffect(() => {
    refreshPrice();
    const interval = setInterval(refreshPrice, 2000);
    return () => clearInterval(interval);
  }, [refreshPrice]);

  const currentCandles = candles[timeframe] || [];

  return {
    symbol,
    timeframe,
    candles: currentCandles,
    currentPrice,
    bid,
    ask,
    spread,
    isLoading,
    error,
    refetch: fetchCandles,
    refreshPrice,
  };
}
