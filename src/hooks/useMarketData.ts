'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
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
    connectionStatus,
    setCandles,
    updatePrice,
    updateLastCandle,
    setLoading,
    setError,
    setConnectionStatus,
  } = useMarketStore();

  // Ref to track current timeframe without recreating callbacks
  const timeframeRef = useRef(timeframe);
  useEffect(() => {
    timeframeRef.current = timeframe;
  }, [timeframe]);

  // Ensure we only run on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe to connection status changes
  useEffect(() => {
    const unsubscribe = marketDataProvider.onStatusChange((status) => {
      setConnectionStatus(status);
    });
    return unsubscribe;
  }, [setConnectionStatus]);

  const fetchCandles = useCallback(async () => {
    if (!mounted) return;

    console.log(`[useMarketData] Fetching candles for ${symbol} ${timeframe}...`);
    setLoading(true);
    setError(null);

    try {
      // Fetch candles for the selected timeframe
      const data = await marketDataProvider.getCandles(symbol, timeframe, 200);
      console.log(`[useMarketData] Received ${data.length} candles for ${timeframe}`);
      setCandles(timeframe, data as Candle[]);

      // Also fetch 1h and 4h candles for ICT analysis (if not already the selected timeframe)
      const analysisTimeframes = ['1h', '4h'];
      for (const tf of analysisTimeframes) {
        if (tf !== timeframe) {
          try {
            const analysisData = await marketDataProvider.getCandles(symbol, tf, 200);
            console.log(`[useMarketData] Received ${analysisData.length} candles for ${tf} (ICT analysis)`);
            setCandles(tf, analysisData as Candle[]);
          } catch (err) {
            console.warn(`[useMarketData] Failed to fetch ${tf} candles for ICT analysis:`, err);
          }
        }
      }
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

      // Update the last candle with the new price (uses ref to avoid recreating callback)
      updateLastCandle(timeframeRef.current, quote.ask);
    } catch (err) {
      console.error('[useMarketData] Failed to refresh price:', err);
    }
  }, [mounted, symbol, updatePrice, updateLastCandle]); // timeframe removed - using ref

  // Fetch candles on symbol/timeframe change (only after mount)
  useEffect(() => {
    if (mounted) {
      fetchCandles();
    }
  }, [mounted, fetchCandles]);

  // Update price every 5 seconds (OANDA allows frequent calls)
  useEffect(() => {
    if (!mounted) return;

    refreshPrice();
    const interval = setInterval(refreshPrice, 5000); // 5 seconds
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
    connectionStatus,
    refetch: fetchCandles,
    refreshPrice,
  };
}
