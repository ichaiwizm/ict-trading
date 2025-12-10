'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';
import { Candle } from '@/lib/ict/types';
import { useChartSetup } from './useChartSetup';

export interface ChartContainerProps {
  symbol: string;
  timeframe: string;
  candles: Candle[];
  onCrosshairMove?: (price: number | null, time: number | null) => void;
  className?: string;
}

export interface ChartContainerRef {
  chart: IChartApi | null;
  candleSeries: ISeriesApi<'Candlestick'> | null;
  updateCandles: (candles: Candle[]) => void;
}

const ChartContainer = forwardRef<ChartContainerRef, ChartContainerProps>(
  ({ symbol, timeframe, candles, onCrosshairMove, className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { chart, candleSeries, updateCandles, clearChart } = useChartSetup(
      containerRef,
      { onCrosshairMove }
    );

    // Expose chart API to parent
    useImperativeHandle(ref, () => ({
      chart,
      candleSeries,
      updateCandles,
    }));

    // Update candles when they change
    useEffect(() => {
      if (candles.length > 0) {
        updateCandles(candles);
      } else {
        clearChart();
      }
    }, [candles]);

    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Chart Info Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-[#0a0a0f]/90 backdrop-blur-sm border border-[#1f2937] rounded-lg px-4 py-2 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-gray-100 font-mono">
                {symbol}
              </div>
              <div className="w-px h-4 bg-[#374151]" />
              <div className="text-sm text-gray-400 font-mono">{timeframe}</div>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div
          ref={containerRef}
          className="w-full h-full rounded-lg overflow-hidden border border-[#1f2937] shadow-2xl"
        />

        {/* Loading State */}
        {candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/50 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-[#374151] border-t-[#8b5cf6] rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400 font-mono">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ChartContainer.displayName = 'ChartContainer';

export { ChartContainer };
export default ChartContainer;
