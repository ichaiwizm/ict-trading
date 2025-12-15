import { create } from 'zustand';
import type { Candle } from '@/lib/ict/types';
import type { ConnectionStatus } from '@/lib/market-data/dataProvider';

interface MarketState {
  symbol: 'XAUUSD' | 'EURUSD';
  timeframe: string;
  candles: Record<string, Candle[]>;
  currentPrice: number;
  bid: number;
  ask: number;
  spread: number;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;

  // Connection status for live indicator
  connectionStatus: ConnectionStatus;

  setSymbol: (symbol: 'XAUUSD' | 'EURUSD') => void;
  setTimeframe: (tf: string) => void;
  setCandles: (tf: string, candles: Candle[]) => void;
  updatePrice: (bid: number, ask: number) => void;
  updateLastCandle: (tf: string, price: number) => void;
  appendCandle: (tf: string, candle: Candle) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  symbol: 'XAUUSD',
  timeframe: '1h',
  candles: {},
  currentPrice: 0,
  bid: 0,
  ask: 0,
  spread: 0,
  isLoading: false,
  error: null,
  lastUpdate: Date.now(),

  // Default connection status
  connectionStatus: {
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
  },

  setSymbol: (symbol) =>
    set({
      symbol,
      candles: {},
      error: null,
      lastUpdate: Date.now(),
    }),

  setTimeframe: (tf) =>
    set({
      timeframe: tf,
      lastUpdate: Date.now(),
    }),

  setCandles: (tf, candles) =>
    set((state) => ({
      candles: {
        ...state.candles,
        [tf]: candles,
      },
      lastUpdate: Date.now(),
    })),

  updatePrice: (bid, ask) => {
    const currentPrice = (bid + ask) / 2;
    const spread = Number((ask - bid).toFixed(5));

    set({
      bid,
      ask,
      currentPrice,
      spread,
      lastUpdate: Date.now(),
    });
  },

  updateLastCandle: (tf, price) => {
    const candles = get().candles[tf];
    if (!candles || candles.length === 0) return;

    const lastCandle = candles[candles.length - 1];
    const updatedCandle: Candle = {
      ...lastCandle,
      close: price,
      high: Math.max(lastCandle.high, price),
      low: Math.min(lastCandle.low, price),
    };

    set((state) => ({
      candles: {
        ...state.candles,
        [tf]: [...candles.slice(0, -1), updatedCandle],
      },
      lastUpdate: Date.now(),
    }));
  },

  appendCandle: (tf, candle) =>
    set((state) => {
      const existing = state.candles[tf] || [];
      const lastCandle = existing[existing.length - 1];

      if (lastCandle && lastCandle.time === candle.time) {
        return {
          candles: {
            ...state.candles,
            [tf]: [...existing.slice(0, -1), candle],
          },
          lastUpdate: Date.now(),
        };
      }

      return {
        candles: {
          ...state.candles,
          [tf]: [...existing, candle],
        },
        lastUpdate: Date.now(),
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),
}));
