'use client';

import { useEffect, useState } from 'react';
import { useMarketStore } from '@/stores';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const { symbol, bid, ask } = useMarketStore();
  const [isKillZoneActive, setIsKillZoneActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Check if current time is within any kill zone (NY: 7-10 AM ET, London: 2-5 AM ET)
      const hour = new Date().getUTCHours();
      const isNYKillZone = hour >= 12 && hour < 15; // 7-10 AM ET in UTC
      const isLondonKillZone = hour >= 7 && hour < 10; // 2-5 AM ET in UTC
      setIsKillZoneActive(isNYKillZone || isLondonKillZone);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const priceChange = bid - ask;
  const priceChangePercent = ask > 0 ? ((priceChange / ask) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-xl" />
            <Activity className="relative h-8 w-8 text-cyan-500 dark:text-cyan-400" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-wider text-foreground">
              ICT TRADER
            </h1>
            <p className="text-xs text-muted-foreground">Smart Money Concepts</p>
          </div>
        </div>

        {/* Center - Symbol & Price */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono text-sm font-medium text-muted-foreground">
                {symbol}
              </div>
              <div className="text-xs text-muted-foreground/70">Forex Pair</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-foreground">
                  {bid.toFixed(5)}
                </span>
                <span
                  className={cn(
                    'font-mono text-sm',
                    isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  )}
                >
                  {isPositive ? '+' : ''}
                  {priceChangePercent}%
                </span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Bid: {bid.toFixed(5)}</span>
                <span>Ask: {ask.toFixed(5)}</span>
                <span>Spread: {(ask - bid).toFixed(5)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Kill Zone Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2">
            <div className="relative">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isKillZoneActive ? 'bg-green-500' : 'bg-muted-foreground/30'
                )}
              />
              {isKillZoneActive && (
                <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-green-500" />
              )}
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {isKillZoneActive ? 'Kill Zone Active' : 'Off Hours'}
            </span>
          </div>

          {/* Data Source */}
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="hidden sm:inline font-mono text-xs text-amber-600 dark:text-amber-400">
              Data: 15min delay
            </span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* UTC Time */}
          <div className="hidden xl:flex items-center rounded-lg border border-border bg-card/50 px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              {currentTime.toUTCString().slice(17, 25)} UTC
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
