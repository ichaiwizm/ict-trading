'use client';

import { useEffect, useCallback } from 'react';
import { useMarketStore, useICTStore } from '@/stores';
import { runICTAnalysis } from '@/lib/ict/analyzer';
import type { Candle } from '@/lib/ict/types';

export function useICTAnalysis() {
  const { symbol, candles } = useMarketStore();
  const {
    trend,
    swingPoints,
    orderBlocks,
    fairValueGaps,
    fibonacci,
    confluenceZones,
    killZones,
    entrySignals,
    isAnalyzing,
    lastAnalysis,
    settings,
    setAnalysis,
  } = useICTStore();

  const runAnalysis = useCallback(() => {
    const candleData: Record<string, Candle[]> = {};

    // Get candles from all timeframes available
    Object.entries(candles).forEach(([tf, data]) => {
      if (data && data.length > 0) {
        candleData[tf] = data;
      }
    });

    if (Object.keys(candleData).length === 0) {
      return;
    }

    try {
      const analysis = runICTAnalysis(candleData, symbol);

      setAnalysis({
        trend: analysis.trend,
        swingPoints: analysis.swingPoints,
        orderBlocks: analysis.orderBlocks,
        fairValueGaps: analysis.fairValueGaps,
        fibonacci: analysis.fibonacci,
        confluenceZones: analysis.confluenceZones,
        killZones: analysis.killZones,
        entrySignals: analysis.entrySignals,
        isAnalyzing: false,
        lastAnalysis: Date.now(),
      });
    } catch (error) {
      console.error('ICT Analysis error:', error);
      setAnalysis({ isAnalyzing: false });
    }
  }, [candles, symbol, setAnalysis]);

  // Run analysis when candles change
  useEffect(() => {
    const hasCandles = Object.values(candles).some(
      (arr) => arr && arr.length > 0
    );

    if (hasCandles) {
      setAnalysis({ isAnalyzing: true });
      // Small delay to not block UI
      const timer = setTimeout(runAnalysis, 100);
      return () => clearTimeout(timer);
    }
  }, [candles, runAnalysis, setAnalysis]);

  // Filter based on settings
  const filteredOrderBlocks = orderBlocks.filter((ob) => {
    if (!settings.showMitigated && ob.status === 'mitigated') return false;
    if (!settings.showInvalidated && ob.status === 'invalidated') return false;
    return true;
  });

  const filteredFVGs = fairValueGaps.filter((fvg) => {
    if (!settings.showInvalidated && fvg.status === 'invalidated') return false;
    if (!settings.showMitigated && fvg.status === 'filled') return false;
    return true;
  });

  return {
    trend,
    swingPoints,
    orderBlocks: filteredOrderBlocks,
    fairValueGaps: filteredFVGs,
    fibonacci,
    confluenceZones,
    killZones,
    entrySignals,
    isAnalyzing,
    lastAnalysis,
    settings,
    runAnalysis,
  };
}
