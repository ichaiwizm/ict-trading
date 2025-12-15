"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMT5Store, useAlertStore } from "@/stores";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Shield,
  Percent,
  DollarSign,
  Bell,
  BellOff,
  Clock,
  Target,
  Trash2
} from "lucide-react";

type TabType = "account" | "alerts";

export type AlertType = "setup" | "price" | "killzone" | "entry" | "info";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

const ALERT_ICONS: Record<AlertType, React.ComponentType<{ className?: string }>> = {
  setup: TrendingUp,
  price: DollarSign,
  killzone: Clock,
  entry: Target,
  info: Bell,
};

const ALERT_COLORS: Record<AlertType, string> = {
  setup: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
  price: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  killzone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  entry: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30",
  info: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export function AccountAlertsPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("account");

  // Account state
  const { isConnected, accountInfo } = useMT5Store();

  // Alerts state
  const alerts = useAlertStore((state) => state.alerts);
  const soundEnabled = useAlertStore((state) => state.soundEnabled);
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const clearAlerts = useAlertStore((state) => state.clearAlerts);
  const toggleSound = useAlertStore((state) => state.toggleSound);
  const unreadCount = alerts.filter((a) => !a.read).length;

  const formatCurrency = (value: number | undefined, decimals = 2) => {
    if (value === undefined) return "—";
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === 0) return "—";
    return `${value.toFixed(0)}%`;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const profit = accountInfo?.profit ?? 0;
  const isProfitable = profit >= 0;

  const renderAlert = (alert: Alert) => {
    const Icon = ALERT_ICONS[alert.type];
    const colorClass = ALERT_COLORS[alert.type];

    return (
      <div
        key={alert.id}
        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:border-opacity-60 ${
          alert.read ? "bg-secondary/50 border-border opacity-60" : "bg-secondary border-border/80"
        }`}
        onClick={() => !alert.read && markAsRead(alert.id)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg border ${colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-foreground truncate">{alert.title}</h4>
              {!alert.read && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_6px_var(--primary)] flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{alert.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/70 font-mono">{formatTimestamp(alert.timestamp)}</span>
              <Badge variant="outline" className={`text-xs ${colorClass}`}>
                {alert.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === "account"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="h-4 w-4" />
          Account
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === "alerts"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4" />
          Alerts
          {unreadCount > 0 && (
            <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs h-5 min-w-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Account Tab Content */}
      {activeTab === "account" && (
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? "Connected" : "Offline"}
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${isConnected
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "border-border text-muted-foreground"}`}
            >
              {isConnected ? "DEMO" : "OFFLINE"}
            </Badge>
          </div>

          {/* Balance & Equity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs text-muted-foreground uppercase">Balance</span>
              </div>
              <span className="text-lg font-bold font-mono text-foreground">
                ${formatCurrency(accountInfo?.balance)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs text-muted-foreground uppercase">Equity</span>
              </div>
              <span className="text-lg font-bold font-mono text-foreground">
                ${formatCurrency(accountInfo?.equity)}
              </span>
            </div>
          </div>

          {/* Profit/Loss */}
          <div className={`p-3 rounded-lg border ${isProfitable
            ? "bg-emerald-500/10 border-emerald-500/30"
            : "bg-red-500/10 border-red-500/30"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isProfitable ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span className="text-xs text-muted-foreground uppercase">Floating P/L</span>
              </div>
              <span className={`text-lg font-bold font-mono ${isProfitable ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {isProfitable ? "+" : ""}{formatCurrency(profit)}
              </span>
            </div>
          </div>

          {/* Margin Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 border border-border/50">
              <span className="text-xs text-muted-foreground">Free Margin</span>
              <span className="text-sm font-mono text-foreground">${formatCurrency(accountInfo?.freeMargin)}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-1.5">
                <Percent className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Margin Level</span>
              </div>
              <span className={`text-sm font-mono ${
                (accountInfo?.marginLevel ?? 0) > 200
                  ? "text-emerald-600 dark:text-emerald-400"
                  : (accountInfo?.marginLevel ?? 0) > 100
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
              }`}>
                {formatPercent(accountInfo?.marginLevel)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Leverage</span>
              </div>
              <span className="text-sm font-mono text-purple-600 dark:text-purple-400">
                1:{accountInfo?.leverage ?? 100}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab Content */}
      {activeTab === "alerts" && (
        <div className="space-y-3">
          {/* Alert Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              {soundEnabled ? (
                <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            {alerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAlerts}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </Button>
            )}
          </div>

          {/* Alerts List */}
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No alerts yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">You'll be notified of important events</p>
            </div>
          ) : (
            <ScrollArea className="h-[280px] pr-2">
              <div className="space-y-2">
                {alerts.slice(0, 10).map(renderAlert)}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
