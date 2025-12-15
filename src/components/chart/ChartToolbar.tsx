'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartToolbarProps {
  symbol: string;
  timeframe: string;
  currentPrice?: number;
  bid?: number;
  ask?: number;
  priceChange?: number;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}

const SYMBOLS = [
  { value: 'XAUUSD', label: 'XAU/USD (Gold)' },
  { value: 'EURUSD', label: 'EUR/USD' },
  { value: 'GBPUSD', label: 'GBP/USD' },
  { value: 'USDJPY', label: 'USD/JPY' },
];

// Grouped timeframes for better UX
const TIMEFRAME_GROUPS = [
  {
    label: 'SEC',
    timeframes: [
      { value: '5S', label: '5s' },
      { value: '15S', label: '15s' },
      { value: '30S', label: '30s' },
    ],
  },
  {
    label: 'MIN',
    timeframes: [
      { value: '1m', label: '1m' },
      { value: '5m', label: '5m' },
      { value: '15m', label: '15m' },
      { value: '30m', label: '30m' },
    ],
  },
  {
    label: 'H/D',
    timeframes: [
      { value: '1h', label: '1H' },
      { value: '4h', label: '4H' },
      { value: '1D', label: '1D' },
    ],
  },
];

// Format price with appropriate decimals (2 for gold, 5 for forex)
const formatPrice = (price: number, sym: string) => {
  return price.toFixed(sym === 'XAUUSD' ? 2 : 5);
};

export default function ChartToolbar({
  symbol,
  timeframe,
  currentPrice,
  bid,
  ask,
  priceChange = 0,
  onSymbolChange,
  onTimeframeChange,
}: ChartToolbarProps) {
  const isPositive = priceChange >= 0;

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-card/80 border-b border-border">
      {/* Left Section: Symbol & Timeframe */}
      <div className="flex items-center gap-3">
        <Select value={symbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {SYMBOLS.map((sym) => (
              <SelectItem key={sym.value} value={sym.value} className="text-foreground font-mono">
                {sym.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5 bg-secondary/80 border border-border rounded-lg p-1 backdrop-blur-sm">
          {TIMEFRAME_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className="flex items-center">
              {groupIndex > 0 && (
                <div className="w-px h-6 bg-border/60 mx-1" />
              )}
              <div className="flex items-center gap-0.5">
                {group.timeframes.map((tf) => (
                  <Button
                    key={tf.value}
                    onClick={() => onTimeframeChange(tf.value)}
                    variant={timeframe === tf.value ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'h-7 px-2 text-xs font-mono transition-all duration-200',
                      timeframe === tf.value
                        ? 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 border-0'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
                    )}
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Price Display */}
      {currentPrice && (
        <div className="flex items-center gap-6">
          {/* Bid/Ask Spread */}
          {bid && ask && (
            <div className="flex items-center gap-3 px-3 py-2 bg-secondary border border-border rounded-lg">
              <div className="text-center min-w-[72px]">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Bid</div>
                <div className="text-sm font-mono text-red-500 font-semibold">
                  {formatPrice(bid, symbol)}
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center min-w-[72px]">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Ask</div>
                <div className="text-sm font-mono text-emerald-500 font-semibold">
                  {formatPrice(ask, symbol)}
                </div>
              </div>
            </div>
          )}

          {/* Current Price & Change */}
          <div className="flex items-center gap-3 px-4 py-2 bg-secondary border border-border rounded-lg">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-foreground">
                {formatPrice(currentPrice, symbol)}
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-mono font-semibold',
                  isPositive 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isPositive ? '+' : ''}
                {priceChange.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
