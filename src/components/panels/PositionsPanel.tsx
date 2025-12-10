"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMT5Store } from "@/stores/mt5Store";
import { useMarketStore } from "@/stores/marketStore";
import { useAlertStore } from "@/stores/alertStore";
import {
  X,
  Layers,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/mt5/types";

export function PositionsPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <>
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
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1 rounded hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"
                title="Agrandir"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[280px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {positions.map((position) => (
                <PositionItem
                  key={position.id}
                  position={position}
                  onClose={handleClosePosition}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal agrandi */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center justify-between pr-8">
              <span className="text-amber-600 dark:text-amber-400">
                OPEN POSITIONS
              </span>
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
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6 min-h-0">
            <div className="space-y-2 pb-2">
              {positions.map((position) => (
                <PositionItem
                  key={position.id}
                  position={position}
                  onClose={handleClosePosition}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
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
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border",
        "bg-secondary/30 hover:bg-secondary/50",
        "transition-colors duration-150",
        isBuy
          ? "border-l-2 border-l-emerald-500 border-emerald-500/20"
          : "border-l-2 border-l-red-500 border-red-500/20"
      )}
    >
      {/* Row 1: Symbol, Type, Volume, Prices, Close */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Symbol + Type */}
          <span className="font-mono text-sm font-semibold shrink-0">
            {position.symbol}
          </span>
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
            isBuy
              ? "bg-emerald-500/20 text-emerald-500"
              : "bg-red-500/20 text-red-500"
          )}>
            {isBuy ? "BUY" : "SELL"}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {position.volume}
          </span>

          {/* Prices - truncate if needed */}
          <div className="flex items-center gap-1 text-xs min-w-0 ml-auto">
            <span className="font-mono text-muted-foreground truncate">
              {formatPrice(position.openPrice, position.symbol)}
            </span>
            <span className="text-muted-foreground/50">→</span>
            <span className="font-mono truncate">
              {formatPrice(position.currentPrice, position.symbol)}
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(position.id)}
          className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Row 2: SL/TP + P/L */}
      <div className="flex items-center justify-between px-3 pb-2 text-xs">
        <div className="flex items-center gap-3">
          {position.stopLoss && (
            <span className="text-muted-foreground">
              SL: <span className="font-mono text-red-500">{formatPrice(position.stopLoss, position.symbol)}</span>
            </span>
          )}
          {position.takeProfit && (
            <span className="text-muted-foreground">
              TP: <span className="font-mono text-emerald-500">{formatPrice(position.takeProfit, position.symbol)}</span>
            </span>
          )}
          {!position.stopLoss && !position.takeProfit && (
            <span className="text-muted-foreground/50 italic">No SL/TP</span>
          )}
        </div>

        {/* P/L - always visible, prominent */}
        <span className={cn(
          "font-mono font-bold",
          isProfit ? "text-emerald-500" : "text-red-500"
        )}>
          {isProfit ? "+" : ""}${position.profit.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
