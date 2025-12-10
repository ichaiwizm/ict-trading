'use client';

import { useState } from 'react';
import { BarChart3, Target, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'chart' | 'zones' | 'trade' | 'account';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'chart', label: 'Chart', icon: BarChart3 },
  { id: 'zones', label: 'Zones', icon: Target },
  { id: 'trade', label: 'Trade', icon: TrendingUp },
  { id: 'account', label: 'Account', icon: User },
];

export function MobileNav() {
  const [activeTab, setActiveTab] = useState<TabId>('chart');

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    // Scroll to corresponding section
    const sectionMap: Record<TabId, string> = {
      chart: 'chart-section',
      zones: 'zones-section',
      trade: 'trade-section',
      account: 'account-section',
    };
    const element = document.getElementById(sectionMap[tabId]);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="grid h-16 grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                'active:scale-95',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </div>
              <span className="font-mono text-xs font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
