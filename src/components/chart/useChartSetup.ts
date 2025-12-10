'use client';

import { useEffect, useRef, useState } from 'react';
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

export function useChartSetup(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: ChartOptions = {}
): ChartSetup {
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chart = createChart(container, {
      width: options.width || container.clientWidth,
      height: options.height || container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0f' },
        textColor: '#d1d5db',
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: '#1a1a24', style: 1 },
        horzLines: { color: '#1a1a24', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: 3,
          labelBackgroundColor: '#374151',
        },
        horzLine: {
          color: '#6b7280',
          width: 1,
          style: 3,
          labelBackgroundColor: '#374151',
        },
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        textColor: '#9ca3af',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
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
  }, [containerRef, options.width, options.height]);

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
