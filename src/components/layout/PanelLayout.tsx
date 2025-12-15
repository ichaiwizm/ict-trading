'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AccountAlertsPanel } from '@/components/panels/AccountAlertsPanel';

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

function Panel({ children, className, title, subtitle, action, noPadding }: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card/50 backdrop-blur-sm',
        'shadow-lg shadow-black/5 dark:shadow-black/20',
        'overflow-hidden',
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="font-mono text-sm font-semibold text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(title && !noPadding && 'p-4', noPadding && 'p-0')}>{children}</div>
    </div>
  );
}

interface PanelLayoutProps {
  chart: ReactNode;
  trend: ReactNode;
  killZones: ReactNode;
  zones: ReactNode;
  calculator: ReactNode;
  trade: ReactNode;
  positions: ReactNode;
}

export function PanelLayout({
  chart,
  trend,
  killZones,
  zones,
  calculator,
  trade,
  positions,
}: PanelLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-3 md:p-4">
      {/* Desktop Layout: 3-column grid */}
      <div className="mx-auto max-w-[2000px] space-y-3">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
          {/* Left Column - Chart (spans 2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <Panel noPadding className="min-h-[400px] h-[50vh] sm:h-[55vh] lg:h-[60vh]">
              {chart}
            </Panel>
            {/* Positions Panel - Below chart */}
            <Panel title="Open Positions" subtitle="Active trades">
              {positions}
            </Panel>
          </div>

          {/* Right Column - Analysis Panels */}
          <div className="space-y-3 lg:flex lg:flex-col">
            {/* Trend Panel */}
            <Panel title="Market Trend" subtitle="Multi-timeframe bias" className="lg:flex-1">
              {trend}
            </Panel>

            {/* Kill Zones Panel */}
            <Panel title="Kill Zones" subtitle="Optimal trading times" className="lg:flex-1">
              {killZones}
            </Panel>

            {/* Active Zones Panel */}
            <Panel title="Active Zones" subtitle="Key price levels" className="lg:flex-1">
              {zones}
            </Panel>
          </div>
        </div>

        {/* Bottom Row - Trading Tools */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Lot Calculator */}
          <Panel title="Lot Calculator" subtitle="Risk management">
            {calculator}
          </Panel>

          {/* Trade Panel */}
          <Panel title="Quick Trade" subtitle="Execute orders">
            {trade}
          </Panel>

          {/* Account & Alerts Panel (Combined with Tabs) */}
          <Panel title="Account & Alerts" subtitle="Status & notifications">
            <AccountAlertsPanel />
          </Panel>
        </div>
      </div>

      {/* Mobile-specific spacing for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

export { Panel };
