'use client';

import { useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { MobileNav } from '@/components/layout/MobileNav';
import { ChartWrapper } from '@/components/chart/ChartWrapper';
import { TrendPanel } from '@/components/panels/TrendPanel';
import { KillZonePanel } from '@/components/panels/KillZonePanel';
import { ZonesPanel } from '@/components/panels/ZonesPanel';
import { LotCalculator } from '@/components/panels/LotCalculator';
import { TradePanel } from '@/components/panels/TradePanel';
import { AccountPanel } from '@/components/panels/AccountPanel';
import { AlertsPanel } from '@/components/panels/AlertsPanel';
import { PositionsPanel } from '@/components/panels/PositionsPanel';
import { useMarketStore, useAlertStore, useMT5Store } from '@/stores';
import { generateDemoCandles } from '@/lib/market-data/demoData';
import { useICTAnalysis } from '@/hooks/useICTAnalysis';

// Demo data initialization
const initializeDemoData = () => {
  const marketStore = useMarketStore.getState();
  const alertStore = useAlertStore.getState();
  const mt5Store = useMT5Store.getState();

  // Set initial symbol
  marketStore.setSymbol('EURUSD');

  // Generate demo candles for multiple timeframes
  // Map store timeframe names to generator format
  const timeframeMap: Record<string, string> = {
    'M15': '15m',
    'H1': '1h',
    'H4': '4h',
  };

  Object.entries(timeframeMap).forEach(([storeTf, genTf]) => {
    const candles = generateDemoCandles('EURUSD', genTf, 200);
    marketStore.setCandles(storeTf, candles);
  });

  // Set initial timeframe
  marketStore.setTimeframe('M15');

  // Initialize live price from last candle
  const m15Candles = marketStore.candles['M15'];
  const lastCandle = m15Candles?.[m15Candles.length - 1];
  const basePrice = lastCandle?.close || 1.08456;
  marketStore.updatePrice(basePrice, basePrice + 0.00002);

  // Set demo account info (simulating MT5 connection)
  mt5Store.setConnected(true);
  mt5Store.setAccountInfo({
    balance: 10000,
    equity: 10250,
    margin: 450,
    freeMargin: 9800,
    marginLevel: 2277.78,
    profit: 250,
    leverage: 100,
    currency: 'USD',
    name: 'Demo Account',
    server: 'Demo-Server',
    accountId: 'DEMO-12345',
  });

  // Add demo alerts
  alertStore.addAlert({
    type: 'setup',
    title: 'Confluence Zone',
    message: 'Price approaching FVG zone at 1.08500',
    priority: 'high',
  });

  alertStore.addAlert({
    type: 'killzone',
    title: 'NY Kill Zone',
    message: 'NY Kill Zone opening in 15 minutes',
    priority: 'medium',
  });
};

// Simulate live price updates
const startPriceSimulation = () => {
  const interval = setInterval(() => {
    const marketStore = useMarketStore.getState();
    const mt5Store = useMT5Store.getState();
    const currentBid = marketStore.bid || 1.08456;

    // Random price movement (+/- 0.00010)
    const change = (Math.random() - 0.5) * 0.0002;
    const newBid = currentBid + change;
    const spread = 0.00002;

    marketStore.updatePrice(
      parseFloat(newBid.toFixed(5)),
      parseFloat((newBid + spread).toFixed(5))
    );

    // Update positions with current price and P/L
    const positions = mt5Store.positions;
    if (positions.length > 0) {
      let totalProfit = 0;
      const updatedPositions = positions.map((pos) => {
        // Calculate profit based on position type
        const pipSize = pos.symbol === 'XAUUSD' ? 0.1 : 0.0001;
        const pipValue = pos.symbol === 'XAUUSD' ? 1 : 10; // Per standard lot
        const priceDiff = pos.type === 'buy' ? newBid - pos.openPrice : pos.openPrice - newBid;
        const pips = priceDiff / pipSize;
        const profit = pips * pipValue * pos.volume + (pos.commission || 0);
        totalProfit += profit;

        return {
          ...pos,
          currentPrice: newBid,
          profit: parseFloat(profit.toFixed(2)),
        };
      });

      mt5Store.setPositions(updatedPositions);

      if (mt5Store.accountInfo) {
        mt5Store.setAccountInfo({
          ...mt5Store.accountInfo,
          profit: parseFloat(totalProfit.toFixed(2)),
          equity: parseFloat((mt5Store.accountInfo.balance + totalProfit).toFixed(2)),
        });
      }
    }
  }, 2000);

  return interval;
};

export default function DashboardPage() {
  // Initialize ICT Analysis hook - this will run analysis when candles change
  useICTAnalysis();

  useEffect(() => {
    initializeDemoData();
    const priceInterval = startPriceSimulation();

    return () => {
      clearInterval(priceInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Suspense fallback={<DashboardSkeleton />}>
          <PanelLayout
            chart={<ChartWrapper />}
            trend={<TrendPanel />}
            killZones={<KillZonePanel />}
            zones={<ZonesPanel />}
            calculator={<LotCalculator />}
            trade={<TradePanel />}
            account={<AccountPanel />}
            alerts={<AlertsPanel />}
            positions={<PositionsPanel />}
          />
        </Suspense>
      </main>

      <MobileNav />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-4 md:p-6">
      <div className="mx-auto max-w-[2000px] space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-[500px] lg:h-[600px] animate-pulse rounded-xl bg-muted/50" />
          </div>
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
            <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
            <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
          <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
          <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
          <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}
