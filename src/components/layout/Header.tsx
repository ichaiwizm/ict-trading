'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketStore } from '@/stores';
import { useAuthStore } from '@/stores/authStore';
import { Activity, Wifi, WifiOff, Zap, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isKillZoneActive, setIsKillZoneActive] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState(0);
  const [timeSinceQuote, setTimeSinceQuote] = useState(0);

  // Access store only after mount to prevent hydration mismatch
  const storeData = useMarketStore();
  const { logout, user } = useAuthStore();
  const symbol = mounted ? storeData.symbol : 'EURUSD';
  const bid = mounted ? storeData.bid : 0;
  const ask = mounted ? storeData.ask : 0;
  const connectionStatus = mounted ? storeData.connectionStatus : null;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/login');
    } catch {
      // Even if API fails, clear local state and redirect
      logout();
      router.push('/login');
    }
  };

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Check if current time is within any kill zone (NY: 7-10 AM ET, London: 2-5 AM ET)
      const hour = new Date().getUTCHours();
      const isNYKillZone = hour >= 12 && hour < 15; // 7-10 AM ET in UTC
      const isLondonKillZone = hour >= 7 && hour < 10; // 2-5 AM ET in UTC
      setIsKillZoneActive(isNYKillZone || isLondonKillZone);

      // Update time since last successful fetch
      if (connectionStatus?.lastSuccessfulFetch) {
        setTimeSinceUpdate(Math.floor((Date.now() - connectionStatus.lastSuccessfulFetch) / 1000));
      }
      // Update time since last quote call
      if (connectionStatus?.lastQuoteCallTime) {
        setTimeSinceQuote(Math.floor((Date.now() - connectionStatus.lastQuoteCallTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [connectionStatus?.lastSuccessfulFetch, connectionStatus?.lastQuoteCallTime]);

  // Calculate spread in pips (EURUSD: 0.0001 = 1 pip, XAUUSD: 0.1 = 1 pip)
  const spread = ask - bid;
  const pipMultiplier = symbol === 'XAUUSD' ? 10 : 10000;
  const spreadPips = spread * pipMultiplier;

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
                  {mounted && bid > 0 ? bid.toFixed(symbol === 'XAUUSD' ? 2 : 5) : '-.-----'}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {mounted && spreadPips > 0 ? `${spreadPips.toFixed(1)} pips` : '-- pips'}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Bid: {mounted && bid > 0 ? bid.toFixed(symbol === 'XAUUSD' ? 2 : 5) : '-.-----'}</span>
                <span>Ask: {mounted && ask > 0 ? ask.toFixed(symbol === 'XAUUSD' ? 2 : 5) : '-.-----'}</span>
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

          {/* Connection Status Indicator */}
          {mounted && connectionStatus && (
            <div
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2',
                connectionStatus.isLive
                  ? 'border-green-500/30 bg-green-500/10'
                  : connectionStatus.isConnected
                  ? 'border-amber-500/30 bg-amber-500/10'
                  : 'border-red-500/30 bg-red-500/10'
              )}
            >
              {/* Status dot with pulse when live */}
              <div className="relative">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    connectionStatus.isLive
                      ? 'bg-green-500'
                      : connectionStatus.isConnected
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  )}
                />
                {connectionStatus.isLive && (
                  <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-green-500" />
                )}
              </div>

              {/* Status text */}
              <div className="hidden sm:flex items-center gap-2">
                {connectionStatus.isConnected ? (
                  <Wifi className="h-3 w-3 text-current" />
                ) : (
                  <WifiOff className="h-3 w-3 text-current" />
                )}
                <span
                  className={cn(
                    'font-mono text-xs',
                    connectionStatus.isLive
                      ? 'text-green-600 dark:text-green-400'
                      : connectionStatus.isConnected
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {connectionStatus.isLive
                    ? `LIVE ${connectionStatus.latencyMs}ms`
                    : connectionStatus.isConnected
                    ? `Reconnecting... (${timeSinceUpdate}s)`
                    : connectionStatus.error
                    ? 'Disconnected'
                    : 'Connecting...'}
                </span>
              </div>

              {/* Environment badge */}
              {connectionStatus.isLive && (
                <span
                  className={cn(
                    'hidden md:inline font-mono text-[10px] uppercase px-1.5 py-0.5 rounded',
                    connectionStatus.environment === 'live'
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  )}
                >
                  {connectionStatus.environment}
                </span>
              )}
            </div>
          )}

          {/* Fallback when not mounted */}
          {!mounted && (
            <div className="flex items-center gap-2 rounded-lg border border-muted px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="hidden sm:inline font-mono text-xs text-muted-foreground">
                Connecting...
              </span>
            </div>
          )}

          {/* API Call Frequency Indicator */}
          {mounted && connectionStatus && connectionStatus.apiCallCount > 0 && (
            <div className="hidden lg:flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
              <div className="relative">
                <Zap className={cn(
                  "h-3.5 w-3.5 transition-all duration-300",
                  timeSinceQuote < 2 ? "text-cyan-400 scale-110" : "text-cyan-500/60"
                )} />
                {timeSinceQuote < 2 && (
                  <div className="absolute inset-0 animate-ping">
                    <Zap className="h-3.5 w-3.5 text-cyan-400 opacity-50" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "font-mono text-[10px] uppercase tracking-wider transition-colors duration-300",
                  timeSinceQuote < 5 ? "text-cyan-400" : "text-cyan-500/60"
                )}>
                  {timeSinceQuote < 5 ? 'LIVE DATA' : `${timeSinceQuote}s ago`}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/60">
                  {connectionStatus.apiCallCount} calls | 5s refresh
                </span>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Logout Button */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              title={user ? `Déconnexion (${user})` : 'Déconnexion'}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}

          {/* UTC Time */}
          <div className="hidden xl:flex items-center rounded-lg border border-border bg-card/50 px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              {currentTime ? currentTime.toUTCString().slice(17, 25) : '--:--:--'} UTC
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
