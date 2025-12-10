"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, TrendingUp, DollarSign, Clock, Target, Trash2 } from "lucide-react";
import { useAlertStore } from "@/stores";

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

export function AlertsPanel() {
  const alerts = useAlertStore((state) => state.alerts);
  const soundEnabled = useAlertStore((state) => state.soundEnabled);
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const clearAlerts = useAlertStore((state) => state.clearAlerts);
  const toggleSound = useAlertStore((state) => state.toggleSound);
  const unreadCount = alerts.filter((a) => !a.read).length;

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
    <Card className="bg-card/95 border-border shadow-xl backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold tracking-wider text-purple-600 dark:text-purple-400">
              ALERTS
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No alerts yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">You'll be notified of important events</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {alerts.slice(0, 10).map(renderAlert)}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
