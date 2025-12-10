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
        <ScrollArea className="max-h-[200px] sm:max-h-[240px] lg:max-h-[300px]">
          <div className="space-y-3 p-3 sm:p-4">
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
    <div className="p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border space-y-2.5 sm:space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isBuy ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
          )}
          <span className="font-mono text-sm font-medium text-foreground">
            {position.symbol}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-1.5 py-0",
              isBuy
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "border-red-500/30 text-red-600 dark:text-red-400"
            )}
          >
            {position.type.toUpperCase()}
          </Badge>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {position.volume.toFixed(2)} lots
        </span>
      </div>

      {/* Prices */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="text-muted-foreground">Entry:</span>
        <span className="font-mono text-muted-foreground">
          {formatPrice(position.openPrice, position.symbol)}
        </span>
        <span className="text-muted-foreground/50">→</span>
        <span className="font-mono text-foreground">
          {formatPrice(position.currentPrice, position.symbol)}
        </span>
      </div>

      {/* SL/TP */}
      {(position.stopLoss || position.takeProfit) && (
        <div className="flex gap-3 text-xs">
          {position.stopLoss && (
            <span className="text-muted-foreground">
              SL: <span className="font-mono text-red-600 dark:text-red-400">{formatPrice(position.stopLoss, position.symbol)}</span>
            </span>
          )}
          {position.takeProfit && (
            <span className="text-muted-foreground">
              TP: <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatPrice(position.takeProfit, position.symbol)}</span>
            </span>
          )}
        </div>
      )}

      {/* P/L and Close */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className={cn(
          "font-mono text-sm font-bold",
          isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        )}>
          {isProfit ? "+" : ""}${position.profit.toFixed(2)}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onClose(position.id)}
          className="h-7 px-2 text-xs hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400"
        >
          <X className="h-3 w-3 mr-1" />
          Close
        </Button>
      </div>
    </div>
  );
}
