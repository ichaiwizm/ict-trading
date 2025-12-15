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
      <div className="mx-auto max-w-[1800px]">
        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-2 md:gap-3">

          {/* Left Column - Chart & Bottom panels */}
          <div className="space-y-2 md:space-y-3">
            {/* Chart - takes most vertical space */}
            <Panel noPadding className="h-[50vh] sm:h-[55vh] lg:h-[65vh]">
              {chart}
            </Panel>

            {/* Bottom panels in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              <Panel title="Open Positions" subtitle="Active trades">
                {positions}
              </Panel>
              <Panel title="Lot Calculator" subtitle="Risk management">
                {calculator}
              </Panel>
            </div>
          </div>

          {/* Right Column - fixed width sidebar */}
          <div className="space-y-2 md:space-y-3">
            <Panel title="Market Trend" subtitle="Multi-timeframe bias">
              {trend}
            </Panel>
            <Panel title="Kill Zones" subtitle="Optimal trading times">
              {killZones}
            </Panel>
            <Panel title="Active Zones" subtitle="Key price levels">
              {zones}
            </Panel>
            <Panel title="Quick Trade" subtitle="Execute orders">
              {trade}
            </Panel>
            <Panel title="Account & Alerts" subtitle="Status & notifications">
              <AccountAlertsPanel />
            </Panel>
          </div>
        </div>
      </div>

      {/* Mobile-specific spacing for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}

export { Panel };
