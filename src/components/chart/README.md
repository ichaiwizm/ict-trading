# Chart System Components

Professional ICT Trading chart components built with TradingView Lightweight Charts and the Terminal Trading Pro aesthetic.

## Components Overview

### 1. **ChartContainer** (84 lines)
Main chart wrapper component with TradingView Lightweight Charts integration.

**Features:**
- Dark theme optimized for trading
- Candlestick series rendering
- Automatic resize handling
- Loading state indicator
- Symbol & timeframe overlay display
- Crosshair event handling

**Usage:**
```tsx
import { ChartContainer } from '@/components/chart';

const candles = [
  { time: 1701388800, open: 1.0850, high: 1.0875, low: 1.0840, close: 1.0865 },
  // ... more candles
];

<ChartContainer
  symbol="EURUSD"
  timeframe="15m"
  candles={candles}
  onCrosshairMove={(price, time) => {
    console.log('Crosshair:', price, time);
  }}
/>
```

### 2. **ChartToolbar** (137 lines)
Professional toolbar for chart controls and price display.

**Features:**
- Symbol selector dropdown (EURUSD, GBPUSD, USDJPY, XAUUSD, BTCUSD)
- Timeframe buttons (1m, 5m, 15m, 1h, 4h, 1D)
- Real-time price display with Bid/Ask spread
- Price change indicator with trending icons
- Styled with shadcn/ui components

**Usage:**
```tsx
import { ChartToolbar } from '@/components/chart';

<ChartToolbar
  symbol="EURUSD"
  timeframe="15m"
  currentPrice={1.0865}
  bid={1.0863}
  ask={1.0867}
  priceChange={0.25}
  onSymbolChange={(symbol) => setSymbol(symbol)}
  onTimeframeChange={(tf) => setTimeframe(tf)}
/>
```

### 3. **useChartSetup** (159 lines)
Custom React hook for chart initialization and management.

**Features:**
- Chart creation with dark theme configuration
- Candlestick series setup
- Resize observer integration
- Crosshair event subscription
- Automatic cleanup on unmount

**Usage:**
```tsx
import { useChartSetup } from '@/components/chart';

const containerRef = useRef<HTMLDivElement>(null);
const { chart, candleSeries, updateCandles, clearChart } = useChartSetup(
  containerRef,
  {
    onCrosshairMove: (price, time) => {
      console.log('Crosshair:', price, time);
    }
  }
);

// Update candles
useEffect(() => {
  updateCandles(candles);
}, [candles]);
```

### 4. **ZoneRenderer** (125 lines)
Utility class for rendering ICT zones on the chart.

**Features:**
- Draw Order Blocks (purple semi-transparent)
- Draw Fair Value Gaps (amber semi-transparent)
- Draw Confluence Zones (gold with glow effect)
- Zone management (add, remove, clear)
- Type-safe styling based on bullish/bearish

**Usage:**
```tsx
import { createZoneRenderer } from '@/components/chart';

const zoneRenderer = createZoneRenderer(candleSeries);

// Draw Order Block
const obId = zoneRenderer.drawOrderBlock({
  id: 'ob-1',
  type: 'bullish',
  top: 1.0900,
  bottom: 1.0880,
  startTime: 1701388800,
  status: 'valid',
  strength: 0.8,
  retestCount: 0
});

// Draw Fair Value Gap
const fvgId = zoneRenderer.drawFairValueGap({
  id: 'fvg-1',
  type: 'bearish',
  top: 1.0870,
  bottom: 1.0850,
  startTime: 1701388800,
  status: 'unfilled',
  fillPercentage: 0,
  inPremium: true,
  inDiscount: false
});

// Remove zone
zoneRenderer.removeZone(obId);
```

### 5. **FibonacciRenderer** (122 lines)
Class for drawing Fibonacci retracement levels on the chart.

**Features:**
- Draws all standard Fib levels (0, 0.236, 0.382, 0.5, 0.618, 0.786, 1)
- Highlights 0.5 level (equilibrium) in amber
- Premium zone (0.5-1.0) shaded red
- Discount zone (0-0.5) shaded green
- Helper methods to check if price is in premium/discount

**Usage:**
```tsx
import { createFibonacciRenderer } from '@/components/chart';

const fibRenderer = createFibonacciRenderer(chart, candleSeries);

// Draw Fibonacci levels
fibRenderer.drawFibonacci({
  swingLow: { time: 1701388800, price: 1.0800, type: 'low', index: 0, strength: 0.9 },
  swingHigh: { time: 1701475200, price: 1.0900, type: 'high', index: 100, strength: 0.9 },
  levels: [
    { level: 0, price: 1.0800, label: '0.0' },
    { level: 0.5, price: 1.0850, label: '0.5' },
    { level: 1, price: 1.0900, label: '1.0' }
  ],
  premiumZone: { top: 1.0900, bottom: 1.0850 },
  discountZone: { top: 1.0850, bottom: 1.0800 }
});

// Check price zones
const isInPremium = fibRenderer.isPremium(1.0875); // true
const isInDiscount = fibRenderer.isDiscount(1.0825); // true

// Clear Fibonacci
fibRenderer.clearFibonacci();
```

### 6. **index.ts** (10 lines)
Barrel export file for convenient imports.

## Design System

### Colors
- **Background**: `#0a0a0f` (Deep charcoal)
- **Borders**: `#1f2937` (Dark gray)
- **Cards**: `#1a1a24` (Slightly lighter)
- **Bullish**: `#10b981` (Emerald green)
- **Bearish**: `#ef4444` (Coral red)
- **Order Blocks**: `#8b5cf6` (Purple)
- **FVG**: `#f59e0b` (Amber)
- **Confluence**: `#fbbf24` (Gold)

### Typography
- **Data/Numbers**: JetBrains Mono (monospace)
- **Labels**: System sans-serif

### Effects
- Subtle glow on important elements (confluence zones)
- Smooth transitions on interactive elements
- Backdrop blur on overlays

## Complete Example

```tsx
'use client';

import { useState, useRef } from 'react';
import { ChartContainer, ChartToolbar, ChartContainerRef } from '@/components/chart';
import { createZoneRenderer, createFibonacciRenderer } from '@/components/chart';

export default function TradingChart() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('15m');
  const [candles, setCandles] = useState([]);
  const chartRef = useRef<ChartContainerRef>(null);

  // Setup zone renderers after chart is ready
  useEffect(() => {
    if (chartRef.current?.candleSeries) {
      const zoneRenderer = createZoneRenderer(chartRef.current.candleSeries);
      const fibRenderer = createFibonacciRenderer(
        chartRef.current.chart!,
        chartRef.current.candleSeries
      );

      // Draw zones and levels here
    }
  }, [chartRef.current]);

  return (
    <div className="h-screen flex flex-col">
      <ChartToolbar
        symbol={symbol}
        timeframe={timeframe}
        currentPrice={1.0865}
        bid={1.0863}
        ask={1.0867}
        priceChange={0.25}
        onSymbolChange={setSymbol}
        onTimeframeChange={setTimeframe}
      />
      <div className="flex-1">
        <ChartContainer
          ref={chartRef}
          symbol={symbol}
          timeframe={timeframe}
          candles={candles}
        />
      </div>
    </div>
  );
}
```

## Dependencies

- `lightweight-charts`: ^5.0.9
- `@radix-ui/react-select`: ^2.2.6
- `lucide-react`: ^0.556.0
- TailwindCSS with custom colors
- shadcn/ui components (Button, Select)

## Notes

- All components use the Terminal Trading Pro design system
- TypeScript types imported from `@/lib/ict/types`
- All files are under 200 lines as required
- Components are client-side rendered ('use client' directive)
- Proper cleanup and memory management included
