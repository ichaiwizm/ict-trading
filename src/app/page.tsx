'use client';

import { Suspense } from 'react';
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
import { useICTAnalysis } from '@/hooks/useICTAnalysis';
import { useMarketData } from '@/hooks/useMarketData';

export default function DashboardPage() {
  // Fetch real market data from Alpha Vantage
  useMarketData();

  // Initialize ICT Analysis
  useICTAnalysis();

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
