"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMT5Store } from "@/stores/mt5Store";
import { useMarketStore } from "@/stores/marketStore";
import { useAlertStore } from "@/stores/alertStore";
import {
  TrendingUp,
  TrendingDown,
  X,
  Edit,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/mt5/types";

export function PositionsPanel() {
  const { positions, setPositions, accountInfo, setAccountInfo } = useMT5Store();
  const { bid, symbol } = useMarketStore();
  const { addAlert } = useAlertStore();

  const handleClosePosition = (positionId: string) => {
    const position = positions.find((p) => p.id === positionId);
    if (!position) return;

    // Remove from positions
    const updatedPositions = positions.filter((p) => p.id !== positionId);
    setPositions(updatedPositions);

    // Update account balance with realized profit
    if (accountInfo) {
      const realizedProfit = position.profit + (position.commission || 0) + (position.swap || 0);
      setAccountInfo({
        ...accountInfo,
        balance: accountInfo.balance + realizedProfit,
      });
    }

    // Show alert
    addAlert({
      type: "entry",
      title: "Position Closed",
      message: `${position.symbol} ${position.type.toUpperCase()} closed @ ${bid.toFixed(5)} | P/L: ${position.profit >= 0 ? "+" : ""}$${position.profit.toFixed(2)}`,
      priority: "high",
    });
  };

  const totalProfit = positions.reduce((sum, pos) => sum + pos.profit, 0);
  const isProfitable = totalProfit >= 0;

  const formatPrice = (price: number, sym: string) => {
    return price.toFixed(sym === "XAUUSD" ? 2 : 5);
  };

  if (positions.length === 0) {
    return (
      <Card className="bg-card/95 border-border shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold tracking-wider text-amber-600 dark:text-amber-400">
              OPEN POSITIONS
            </CardTitle>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              0
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 space-y-3">
          <div className="p-3 rounded-full bg-secondary border border-border">
            <Layers className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No open positions</p>
          <p className="text-xs text-muted-foreground/70">Place a trade to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 border-border shadow-xl backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-wider text-amber-600 dark:text-amber-400">
            OPEN POSITIONS
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
              {positions.length}
            </Badge>
            <span className={cn(
              "text-sm font-mono font-bold",
              isProfitable ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}>
              {isProfitable ? "+" : ""}${totalProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="max-h-[220px] sm:max-h-[280px] lg:max-h-[350px]">
          <div className="space-y-2 p-2 sm:p-3">
            {positions.map((position) => (
              <PositionItem
                key={position.id}
                position={position}
                onClose={handleClosePosition}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface PositionItemProps {
  position: Position;
  onClose: (id: string) => void;
  formatPrice: (price: number, symbol: string) => string;
}

function PositionItem({ position, onClose, formatPrice }: PositionItemProps) {
  const isProfit = position.profit >= 0;
  const isBuy = position.type === "buy";

  return (
    <div className={cn(
      "group relative rounded-md border transition-all duration-200",
      "bg-gradient-to-r from-secondary/40 to-secondary/20",
      "hover:from-secondary/60 hover:to-secondary/40",
      isBuy
        ? "border-emerald-500/20 hover:border-emerald-500/40"
        : "border-red-500/20 hover:border-red-500/40"
    )}>
      {/* Direction indicator bar */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-md",
        isBuy ? "bg-emerald-500" : "bg-red-500"
      )} />

      {/* Main content - horizontal layout */}
      <div className="pl-3 pr-2 py-2.5 flex items-center gap-3">
        {/* Symbol & Type */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className="font-mono text-sm font-semibold text-foreground tracking-tight">
            {position.symbol}
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
            isBuy
              ? "bg-emerald-500/20 text-emerald-500"
              : "bg-red-500/20 text-red-500"
          )}>
            {position.type}
          </span>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex flex-col items-center min-w-[50px]">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Vol</span>
          <span className="font-mono text-xs font-medium text-foreground">
            {position.volume.toFixed(2)}
          </span>
        </div>

        {/* Entry → Current */}
        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
          <span className="font-mono text-xs text-muted-foreground truncate">
            {formatPrice(position.openPrice, position.symbol)}
          </span>
          <span className="text-muted-foreground/40 text-xs">→</span>
          <span className="font-mono text-xs font-medium text-foreground truncate">
            {formatPrice(position.currentPrice, position.symbol)}
          </span>
        </div>

        {/* P/L */}
        <div className={cn(
          "font-mono text-sm font-bold min-w-[70px] text-right",
          isProfit ? "text-emerald-500" : "text-red-500"
        )}>
          {isProfit ? "+" : ""}{position.profit.toFixed(2)}
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(position.id)}
          className={cn(
            "p-1.5 rounded transition-all duration-200",
            "text-muted-foreground/50 hover:text-red-500",
            "hover:bg-red-500/10",
            "opacity-50 group-hover:opacity-100"
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* SL/TP row - only if set */}
      {(position.stopLoss || position.takeProfit) && (
        <div className="pl-3 pr-2 pb-2 flex items-center gap-4 text-[10px]">
          {position.stopLoss && (
            <div className="flex items-center gap-1">
              <span className="text-red-500/60 uppercase tracking-wider">SL</span>
              <span className="font-mono text-red-500">{formatPrice(position.stopLoss, position.symbol)}</span>
            </div>
          )}
          {position.takeProfit && (
            <div className="flex items-center gap-1">
              <span className="text-emerald-500/60 uppercase tracking-wider">TP</span>
              <span className="font-mono text-emerald-500">{formatPrice(position.takeProfit, position.symbol)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
