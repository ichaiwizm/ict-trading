"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMT5Store } from "@/stores";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Shield,
  Server,
  Percent,
  DollarSign
} from "lucide-react";

export function AccountPanel() {
  const { isConnected, accountInfo } = useMT5Store();

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

  const profit = accountInfo?.profit ?? 0;
  const isProfitable = profit >= 0;

  return (
    <Card className="bg-card/95 border-border shadow-xl backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-wider text-cyan-600 dark:text-cyan-400">
            ACCOUNT
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"}`} />
            <Badge
              variant="outline"
              className={`text-xs ${isConnected
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "border-border text-muted-foreground"}`}
            >
              {isConnected ? "DEMO" : "OFFLINE"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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
            <span className="text-xs text-muted-foreground">Margin Used</span>
            <span className="text-sm font-mono text-foreground">${formatCurrency(accountInfo?.margin)}</span>
          </div>
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
        </div>

        {/* Account Details */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Leverage</span>
            </div>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
              1:{accountInfo?.leverage ?? 100}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Server className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Server</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {accountInfo?.server ?? "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
