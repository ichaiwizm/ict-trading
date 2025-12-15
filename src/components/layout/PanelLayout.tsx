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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-2 md:p-3">
      <div className="mx-auto max-w-[1920px]">

        {/* Chart - always full width at top */}
        <Panel noPadding className="h-[45vh] sm:h-[50vh] lg:h-[60vh] xl:h-[65vh] mb-2 md:mb-3">
          {chart}
        </Panel>

        {/* Ultra-responsive grid - panels ordered by priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">

          {/* Priority 1: Quick Trade - most used action */}
          <Panel title="Quick Trade" subtitle="Execute orders" className="order-1">
            {trade}
          </Panel>

          {/* Priority 2: Market Trend - key decision info */}
          <Panel title="Market Trend" subtitle="Multi-timeframe bias" className="order-2">
            {trend}
          </Panel>

          {/* Priority 3: Open Positions - active trades monitoring */}
          <Panel title="Open Positions" subtitle="Active trades" className="order-3">
            {positions}
          </Panel>

          {/* Priority 4: Kill Zones - timing info */}
          <Panel title="Kill Zones" subtitle="Optimal trading times" className="order-4">
            {killZones}
          </Panel>

          {/* Priority 5: Lot Calculator - risk management */}
          <Panel title="Lot Calculator" subtitle="Risk management" className="order-5">
            {calculator}
          </Panel>

          {/* Priority 6: Active Zones - technical levels */}
          <Panel title="Active Zones" subtitle="Key price levels" className="order-6">
            {zones}
          </Panel>

          {/* Priority 7: Account & Alerts - status info (least critical) */}
          <Panel title="Account & Alerts" subtitle="Status & notifications" className="order-7 sm:col-span-2 lg:col-span-1">
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
