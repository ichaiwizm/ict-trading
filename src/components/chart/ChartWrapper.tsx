'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useMarketStore, useICTStore } from '@/stores';
import { ChartContainer, ChartContainerRef } from './ChartContainer';
import ChartToolbar from './ChartToolbar';
import { LineStyle } from 'lightweight-charts';

export function ChartWrapper() {
  const { symbol, timeframe, candles, bid, ask, currentPrice, setSymbol, setTimeframe } = useMarketStore();
  const { orderBlocks, fairValueGaps, fibonacci, confluenceZones } = useICTStore();
  const currentCandles = candles[timeframe] || [];

  const chartRef = useRef<ChartContainerRef>(null);
  const priceLinesRef = useRef<Map<string, any>>(new Map());

  // Clear all price lines
  const clearOverlays = useCallback(() => {
    if (!chartRef.current?.candleSeries) return;

    priceLinesRef.current.forEach((line) => {
      try {
        chartRef.current?.candleSeries?.removePriceLine(line);
      } catch (e) {
        // Line may already be removed
      }
    });
    priceLinesRef.current.clear();
  }, []);

  // Draw Fibonacci levels
  const drawFibonacci = useCallback(() => {
    if (!chartRef.current?.candleSeries || !fibonacci) return;

    const series = chartRef.current.candleSeries;
    const { swingHigh, swingLow } = fibonacci;
    const range = swingHigh.price - swingLow.price;

    const fibLevels = [
      { level: 0, label: '0.0', color: '#6b7280' },
      { level: 0.236, label: '0.236', color: '#9ca3af' },
      { level: 0.382, label: '0.382', color: '#9ca3af' },
      { level: 0.5, label: '0.5 EQ', color: '#f59e0b' },
      { level: 0.618, label: '0.618', color: '#9ca3af' },
      { level: 0.786, label: '0.786', color: '#9ca3af' },
      { level: 1, label: '1.0', color: '#6b7280' },
    ];

    fibLevels.forEach((fib) => {
      const price = swingLow.price + range * fib.level;
      const id = `fib-${fib.level}`;

      try {
        const line = series.createPriceLine({
          price,
          color: fib.color,
          lineWidth: fib.level === 0.5 ? 2 : 1,
          lineStyle: fib.level === 0 || fib.level === 1 || fib.level === 0.5
            ? LineStyle.Solid
            : LineStyle.Dashed,
          axisLabelVisible: true,
          title: fib.label,
        });
        priceLinesRef.current.set(id, line);
      } catch (e) {
        // Handle error silently
      }
    });
  }, [fibonacci]);

  // Draw Order Blocks as price lines
  const drawOrderBlocks = useCallback(() => {
    if (!chartRef.current?.candleSeries || orderBlocks.length === 0) return;

    const series = chartRef.current.candleSeries;

    // Only show valid (non-mitigated) order blocks
    const validOBs = orderBlocks.filter(ob => ob.status === 'valid').slice(0, 5);

    validOBs.forEach((ob, index) => {
      const isBullish = ob.type === 'bullish';
      const color = isBullish ? '#10b981' : '#ef4444';

      // Draw top line
      try {
        const topLine = series.createPriceLine({
          price: ob.top,
          color,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: false,
          title: '',
        });
        priceLinesRef.current.set(`ob-top-${ob.id}`, topLine);
      } catch (e) {}

      // Draw bottom line
      try {
        const bottomLine = series.createPriceLine({
          price: ob.bottom,
          color,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: index === 0,
          title: index === 0 ? (isBullish ? 'OB+' : 'OB-') : '',
        });
        priceLinesRef.current.set(`ob-bottom-${ob.id}`, bottomLine);
      } catch (e) {}
    });
  }, [orderBlocks]);

  // Draw Fair Value Gaps as price lines
  const drawFVGs = useCallback(() => {
    if (!chartRef.current?.candleSeries || fairValueGaps.length === 0) return;

    const series = chartRef.current.candleSeries;

    // Only show unfilled FVGs
    const validFVGs = fairValueGaps.filter(fvg => fvg.status === 'unfilled').slice(0, 5);

    validFVGs.forEach((fvg, index) => {
      const isBullish = fvg.type === 'bullish';
      const color = '#f59e0b';

      // Draw top line
      try {
        const topLine = series.createPriceLine({
          price: fvg.top,
          color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: false,
          title: '',
        });
        priceLinesRef.current.set(`fvg-top-${fvg.id}`, topLine);
      } catch (e) {}

      // Draw bottom line
      try {
        const bottomLine = series.createPriceLine({
          price: fvg.bottom,
          color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: index === 0,
          title: index === 0 ? (isBullish ? 'FVG+' : 'FVG-') : '',
        });
        priceLinesRef.current.set(`fvg-bottom-${fvg.id}`, bottomLine);
      } catch (e) {}
    });
  }, [fairValueGaps]);

  // Draw Confluence Zones
  const drawConfluence = useCallback(() => {
    if (!chartRef.current?.candleSeries || confluenceZones.length === 0) return;

    const series = chartRef.current.candleSeries;

    // Show confluence zones with golden color
    confluenceZones.slice(0, 3).forEach((zone, index) => {
      const color = '#fbbf24';

      // Draw top line
      try {
        const topLine = series.createPriceLine({
          price: zone.overlapTop,
          color,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: false,
          title: '',
        });
        priceLinesRef.current.set(`conf-top-${zone.id}`, topLine);
      } catch (e) {}

      // Draw bottom line
      try {
        const bottomLine = series.createPriceLine({
          price: zone.overlapBottom,
          color,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: index === 0,
          title: index === 0 ? 'CONF' : '',
        });
        priceLinesRef.current.set(`conf-bottom-${zone.id}`, bottomLine);
      } catch (e) {}
    });
  }, [confluenceZones]);

  // Update overlays when ICT data changes
  useEffect(() => {
    // Small delay to ensure chart is ready
    const timer = setTimeout(() => {
      clearOverlays();
      drawFibonacci();
      drawOrderBlocks();
      drawFVGs();
      drawConfluence();
    }, 100);

    return () => clearTimeout(timer);
  }, [fibonacci, orderBlocks, fairValueGaps, confluenceZones, clearOverlays, drawFibonacci, drawOrderBlocks, drawFVGs, drawConfluence]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearOverlays();
    };
  }, [clearOverlays]);

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl overflow-hidden">
      <ChartToolbar
        symbol={symbol}
        timeframe={timeframe}
        currentPrice={currentPrice}
        bid={bid}
        ask={ask}
        priceChange={0}
        onSymbolChange={(s) => setSymbol(s as 'EURUSD' | 'XAUUSD')}
        onTimeframeChange={setTimeframe}
      />
      <div className="flex-1 min-h-[400px]">
        <ChartContainer
          ref={chartRef}
          symbol={symbol}
          timeframe={timeframe}
          candles={currentCandles}
        />
      </div>
    </div>
  );
}
