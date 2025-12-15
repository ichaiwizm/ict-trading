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
  { value: 'EURUSD', label: 'EUR/USD' },
  { value: 'XAUUSD', label: 'XAU/USD (Gold)' },
];

const TIMEFRAMES = [
  { value: '1m', label: '1M' },
  { value: '5m', label: '5M' },
  { value: '15m', label: '15M' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1D', label: '1D' },
];

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

        <div className="flex items-center gap-1 bg-secondary border border-border rounded-md p-1">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              variant={timeframe === tf.value ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-8 px-3 text-xs font-mono transition-all',
                timeframe === tf.value
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Right Section: Price Display */}
      {currentPrice && (
        <div className="flex items-center gap-6">
          {/* Bid/Ask Spread */}
          {bid && ask && (
            <div className="flex items-center gap-4 px-4 py-2 bg-secondary border border-border rounded-lg">
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Bid</div>
                <div className="text-sm font-mono text-red-600 dark:text-red-400 font-semibold">
                  {bid.toFixed(5)}
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-mono">Ask</div>
                <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {ask.toFixed(5)}
                </div>
              </div>
            </div>
          )}

          {/* Current Price & Change */}
          <div className="flex items-center gap-3 px-4 py-2 bg-secondary border border-border rounded-lg">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-foreground">
                {currentPrice.toFixed(5)}
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
