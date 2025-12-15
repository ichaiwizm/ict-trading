'use client';

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
  // Fetch real market data from OANDA
  useMarketData();

  // Initialize ICT Analysis
  useICTAnalysis();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
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
      </main>

      <MobileNav />
    </div>
  );
}
