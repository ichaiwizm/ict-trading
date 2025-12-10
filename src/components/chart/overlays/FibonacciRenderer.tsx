'use client';

import { IChartApi, ISeriesApi, LineWidth, LineStyle } from 'lightweight-charts';
import { FibonacciZone } from '@/lib/ict/types';

interface FibLevel {
  level: number;
  label: string;
  color: string;
  lineWidth: LineWidth;
  lineStyle: LineStyle;
}

const FIB_LEVELS: FibLevel[] = [
  { level: 0, label: '0.0 (Low)', color: '#6b7280', lineWidth: 2, lineStyle: LineStyle.Solid },
  { level: 0.236, label: '0.236', color: '#9ca3af', lineWidth: 1, lineStyle: LineStyle.Dashed },
  { level: 0.382, label: '0.382', color: '#9ca3af', lineWidth: 1, lineStyle: LineStyle.Dashed },
  { level: 0.5, label: '0.5 (Equilibrium)', color: '#f59e0b', lineWidth: 2, lineStyle: LineStyle.Solid },
  { level: 0.618, label: '0.618', color: '#9ca3af', lineWidth: 1, lineStyle: LineStyle.Dashed },
  { level: 0.786, label: '0.786', color: '#9ca3af', lineWidth: 1, lineStyle: LineStyle.Dashed },
  { level: 1, label: '1.0 (High)', color: '#6b7280', lineWidth: 2, lineStyle: LineStyle.Solid },
];

export class FibonacciRenderer {
  private chart: IChartApi;
  private series: ISeriesApi<'Candlestick'>;
  private priceLines: Map<number, any> = new Map();
  private fibZone: FibonacciZone | null = null;

  constructor(chart: IChartApi, series: ISeriesApi<'Candlestick'>) {
    this.chart = chart;
    this.series = series;
  }

  drawFibonacci(fibZone: FibonacciZone) {
    // Clear existing lines
    this.clearFibonacci();

    this.fibZone = fibZone;
    const swingHigh = fibZone.swingHigh.price;
    const swingLow = fibZone.swingLow.price;
    const range = swingHigh - swingLow;

    // Draw each Fibonacci level
    FIB_LEVELS.forEach((fib) => {
      const price = swingLow + range * fib.level;

      // Create price line
      const priceLine = this.series.createPriceLine({
        price,
        color: fib.color,
        lineWidth: fib.lineWidth,
        lineStyle: fib.lineStyle,
        axisLabelVisible: true,
        title: fib.label,
      });

      this.priceLines.set(fib.level, priceLine);
    });

    return this.priceLines;
  }

  clearFibonacci() {
    this.priceLines.forEach((line) => {
      this.series.removePriceLine(line);
    });
    this.priceLines.clear();
    this.fibZone = null;
  }

  getFibZone() {
    return this.fibZone;
  }

  // Get premium/discount zones for visual rendering
  getZones() {
    if (!this.fibZone) return null;

    return {
      premium: {
        top: this.fibZone.premiumZone.top,
        bottom: this.fibZone.premiumZone.bottom,
        color: '#ef4444',
        opacity: 0.05,
      },
      discount: {
        top: this.fibZone.discountZone.top,
        bottom: this.fibZone.discountZone.bottom,
        color: '#10b981',
        opacity: 0.05,
      },
    };
  }

  // Check if a price is in premium or discount zone
  isPremium(price: number): boolean {
    if (!this.fibZone) return false;
    return (
      price >= this.fibZone.premiumZone.bottom && price <= this.fibZone.premiumZone.top
    );
  }

  isDiscount(price: number): boolean {
    if (!this.fibZone) return false;
    return (
      price >= this.fibZone.discountZone.bottom && price <= this.fibZone.discountZone.top
    );
  }
}

// Helper function to create a Fibonacci renderer instance
export function createFibonacciRenderer(
  chart: IChartApi,
  series: ISeriesApi<'Candlestick'>
) {
  return new FibonacciRenderer(chart, series);
}

export default FibonacciRenderer;
