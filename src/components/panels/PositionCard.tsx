"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit } from "lucide-react";
import type { Position } from "@/lib/mt5/types";
import { cn } from "@/lib/utils";

interface PositionCardProps {
  position: Position;
  onClose?: (id: string) => void;
  onModify?: (id: string) => void;
}

export function PositionCard({ position, onClose, onModify }: PositionCardProps) {
  const isProfit = position.profit >= 0;
  const isBuy = position.type === "buy";

  return (
    <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
      <CardContent className="p-3 space-y-2">
        {/* Header: Symbol and Direction */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-zinc-100">
              {position.symbol}
            </span>
            <Badge
              className={cn(
                "px-2 py-0.5 text-xs font-semibold",
                isBuy
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              )}
            >
              {position.type.toUpperCase()}
            </Badge>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {position.volume.toFixed(2)} lots
          </span>
        </div>

        {/* Price Movement */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono text-zinc-400">
            {position.openPrice.toFixed(5)}
          </span>
          <span className="text-zinc-600">→</span>
          <span className="font-mono font-semibold text-zinc-200">
            {position.currentPrice.toFixed(5)}
          </span>
        </div>

        {/* SL/TP Levels */}
        <div className="flex gap-3 text-xs">
          {position.stopLoss && (
            <div className="flex items-center gap-1">
              <span className="text-zinc-600">SL:</span>
              <span className="font-mono text-red-400">
                {position.stopLoss.toFixed(5)}
              </span>
            </div>
          )}
          {position.takeProfit && (
            <div className="flex items-center gap-1">
              <span className="text-zinc-600">TP:</span>
              <span className="font-mono text-emerald-400">
                {position.takeProfit.toFixed(5)}
              </span>
            </div>
          )}
        </div>

        {/* P/L and Actions */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-600">Unrealized P/L</span>
            <span
              className={cn(
                "font-mono text-lg font-bold",
                isProfit ? "text-emerald-400" : "text-red-400"
              )}
            >
              {isProfit ? "+" : ""}${position.profit.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onModify?.(position.id)}
              className="hover:bg-purple-500/10 hover:text-purple-400"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onClose?.(position.id)}
              className="hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
