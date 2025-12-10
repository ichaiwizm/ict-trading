'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  ColorType,
  CrosshairMode,
  CandlestickData,
} from 'lightweight-charts';
import { Candle } from '@/lib/ict/types';

interface ChartOptions {
  width?: number;
  height?: number;
  onCrosshairMove?: (price: number | null, time: number | null) => void;
}

interface ChartSetup {
  chart: IChartApi | null;
  candleSeries: ISeriesApi<'Candlestick'> | null;
  updateCandles: (candles: Candle[]) => void;
  clearChart: () => void;
}

// Theme-based chart colors
const chartThemes = {
  light: {
    background: '#fafafa',
    text: '#374151',
    grid: '#e5e7eb',
    crosshair: '#6366f1',
    crosshairLabel: '#4f46e5',
    border: '#d1d5db',
    upColor: '#16a34a',
    downColor: '#dc2626',
  },
  dark: {
    background: '#0f0f14',
    text: '#d1d5db',
    grid: '#1e1e2e',
    crosshair: '#8b5cf6',
    crosshairLabel: '#7c3aed',
    border: '#27272a',
    upColor: '#10b981',
    downColor: '#ef4444',
  },
};

export function useChartSetup(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: ChartOptions = {}
): ChartSetup {
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { resolvedTheme } = useTheme();

  // Get current theme colors
  const colors = chartThemes[resolvedTheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chart = createChart(container, {
      width: options.width || container.clientWidth,
      height: options.height || container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: colors.grid, style: 1 },
        horzLines: { color: colors.grid, style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: colors.crosshair,
          width: 1,
          style: 3,
          labelBackgroundColor: colors.crosshairLabel,
        },
        horzLine: {
          color: colors.crosshair,
          width: 1,
          style: 3,
          labelBackgroundColor: colors.crosshairLabel,
        },
      },
      rightPriceScale: {
        borderColor: colors.border,
        textColor: colors.text,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: colors.upColor,
      downColor: colors.downColor,
      borderVisible: false,
      wickUpColor: colors.upColor,
      wickDownColor: colors.downColor,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    setIsReady(true);

    // Handle crosshair move
    if (options.onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (param.time && param.seriesData.size > 0) {
          const data = param.seriesData.get(candleSeries) as CandlestickData | undefined;
          if (data) {
            options.onCrosshairMove?.(data.close, param.time as number);
          }
        } else {
          options.onCrosshairMove?.(null, null);
        }
      });
    }

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candleSeriesRef.current = null;
      setIsReady(false);
    };
  }, [containerRef, options.width, options.height, resolvedTheme, colors]);

  const updateCandles = (candles: Candle[]) => {
    if (!candleSeriesRef.current || !isReady) return;

    const chartData = candles.map((candle) => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candleSeriesRef.current.setData(chartData);
  };

  const clearChart = () => {
    if (!candleSeriesRef.current) return;
    candleSeriesRef.current.setData([]);
  };

  return {
    chart: chartRef.current,
    candleSeries: candleSeriesRef.current,
    updateCandles,
    clearChart,
  };
}
