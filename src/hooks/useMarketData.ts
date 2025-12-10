'use client';

import { useEffect, useCallback, useState } from 'react';
import { useMarketStore } from '@/stores';
import { marketDataProvider } from '@/lib/market-data';
import type { Candle } from '@/lib/ict/types';

export function useMarketData() {
  const [mounted, setMounted] = useState(false);

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

  // Ensure we only run on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCandles = useCallback(async () => {
    if (!mounted) return;

    console.log(`[useMarketData] Fetching candles for ${symbol} ${timeframe}...`);
    setLoading(true);
    setError(null);

    try {
      const data = await marketDataProvider.getCandles(symbol, timeframe, 200);
      console.log(`[useMarketData] Received ${data.length} candles`);
      setCandles(timeframe, data as Candle[]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch candles';
      console.error('[useMarketData] Error fetching candles:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [mounted, symbol, timeframe, setCandles, setLoading, setError]);

  const refreshPrice = useCallback(async () => {
    if (!mounted) return;

    try {
      console.log(`[useMarketData] Refreshing price for ${symbol}...`);
      const quote = await marketDataProvider.getQuote(symbol);
      console.log(`[useMarketData] Quote: bid=${quote.bid}, ask=${quote.ask}`);
      updatePrice(quote.bid, quote.ask);
    } catch (err) {
      console.error('[useMarketData] Failed to refresh price:', err);
    }
  }, [mounted, symbol, updatePrice]);

  // Fetch candles on symbol/timeframe change (only after mount)
  useEffect(() => {
    if (mounted) {
      fetchCandles();
    }
  }, [mounted, fetchCandles]);

  // Update price periodically (every 30 seconds to avoid rate limits)
  useEffect(() => {
    if (!mounted) return;

    refreshPrice();
    const interval = setInterval(refreshPrice, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [mounted, refreshPrice]);

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
