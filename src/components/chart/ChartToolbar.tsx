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
  { value: 'GBPUSD', label: 'GBP/USD' },
  { value: 'USDJPY', label: 'USD/JPY' },
  { value: 'XAUUSD', label: 'XAU/USD (Gold)' },
  { value: 'BTCUSD', label: 'BTC/USD' },
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
    <div className="flex items-center justify-between gap-4 p-4 bg-[#0a0a0f] border-b border-[#1f2937]">
      {/* Left Section: Symbol & Timeframe */}
      <div className="flex items-center gap-3">
        <Select value={symbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="w-[180px] bg-[#1a1a24] border-[#374151] text-gray-100 font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a24] border-[#374151]">
            {SYMBOLS.map((sym) => (
              <SelectItem key={sym.value} value={sym.value} className="text-gray-100 font-mono">
                {sym.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 bg-[#1a1a24] border border-[#374151] rounded-md p-1">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              variant={timeframe === tf.value ? 'default' : 'ghost'}
              size="sm"
              className={`h-8 px-3 text-xs font-mono transition-all ${
                timeframe === tf.value
                  ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#374151]/50'
              }`}
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
            <div className="flex items-center gap-4 px-4 py-2 bg-[#1a1a24] border border-[#374151] rounded-lg">
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Bid</div>
                <div className="text-sm font-mono text-[#ef4444] font-semibold">
                  {bid.toFixed(5)}
                </div>
              </div>
              <div className="w-px h-8 bg-[#374151]" />
              <div className="text-center">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Ask</div>
                <div className="text-sm font-mono text-[#10b981] font-semibold">
                  {ask.toFixed(5)}
                </div>
              </div>
            </div>
          )}

          {/* Current Price & Change */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a24] border border-[#374151] rounded-lg">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-gray-100">
                {currentPrice.toFixed(5)}
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-mono font-semibold ${
                  isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'
                }`}
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
