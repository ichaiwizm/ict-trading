"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderBlock, FairValueGap, ConfluenceZone } from "@/lib/ict/types";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { useICTStore, useMarketStore } from "@/stores";

export function ZonesPanel() {
  const orderBlocks = useICTStore((state) => state.orderBlocks);
  const fairValueGaps = useICTStore((state) => state.fairValueGaps);
  const confluenceZones = useICTStore((state) => state.confluenceZones);
  const currentPrice = useMarketStore((state) => state.currentPrice);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    confluence: true,
    orderBlocks: true,
    fvgs: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateDistance = (top: number, bottom: number) => {
    const mid = (top + bottom) / 2;
    return Math.abs(currentPrice - mid);
  };

  const validOrderBlocks = orderBlocks.filter((ob) => ob.status === "valid");
  const validFVGs = fairValueGaps.filter((fvg) => fvg.status === "unfilled" || fvg.status === "partially_filled");

  const sortedConfluence = [...confluenceZones].sort(
    (a, b) => calculateDistance(a.overlapTop, a.overlapBottom) - calculateDistance(b.overlapTop, b.overlapBottom)
  );

  const sortedOBs = [...validOrderBlocks].sort(
    (a, b) => calculateDistance(a.top, a.bottom) - calculateDistance(b.top, b.bottom)
  );

  const sortedFVGs = [...validFVGs].sort(
    (a, b) => calculateDistance(a.top, a.bottom) - calculateDistance(b.top, b.bottom)
  );

  const renderConfluenceZone = (zone: ConfluenceZone) => {
    const isBullish = zone.type === "bullish";
    return (
      <div
        key={zone.id}
        className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 transition-all duration-200 shadow-[0_0_10px_rgba(251,191,36,0.15)]"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className={`text-sm font-semibold font-mono ${isBullish ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {isBullish ? "BULL" : "BEAR"}
            </span>
          </div>
          {zone.inOptimalZone && (
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600 dark:text-purple-400">
              OPTIMAL
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">Top:</span>
            <span className="text-foreground">${zone.overlapTop.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">Bot:</span>
            <span className="text-foreground">${zone.overlapBottom.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">Strength:</span>
            <span className="text-amber-600 dark:text-amber-400">{zone.strength}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderBlock = (ob: OrderBlock) => {
    const isBullish = ob.type === "bullish";
    return (
      <div
        key={ob.id}
        className={`p-2.5 rounded-lg border transition-all duration-200 ${
          isBullish ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={`text-xs ${isBullish ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-red-500/30 text-red-600 dark:text-red-400"}`}>
            {isBullish ? "BULL OB" : "BEAR OB"}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">{ob.retestCount}x</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">${ob.top.toFixed(2)}</span>
            <span className="text-muted-foreground">${ob.bottom.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFVG = (fvg: FairValueGap) => {
    const isBullish = fvg.type === "bullish";
    return (
      <div
        key={fvg.id}
        className={`p-2.5 rounded-lg border transition-all duration-200 ${
          isBullish ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className={`text-xs ${isBullish ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-red-500/30 text-red-600 dark:text-red-400"}`}>
            {isBullish ? "BULL FVG" : "BEAR FVG"}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">{fvg.fillPercentage}%</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">${fvg.top.toFixed(2)}</span>
            <span className="text-muted-foreground">${fvg.bottom.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    key: string,
    count: number,
    children: React.ReactNode,
    highlight = false
  ) => (
    <div className={`space-y-2 ${highlight ? "order-first" : ""}`}>
      <button
        onClick={() => toggleSection(key)}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          {expandedSections[key] ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <span className={`text-xs font-semibold tracking-wider ${highlight ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
            {title}
          </span>
        </div>
        <Badge variant="outline" className={`text-xs ${highlight ? "border-amber-500/30 text-amber-600 dark:text-amber-400" : "border-border text-muted-foreground"}`}>
          {count}
        </Badge>
      </button>
      {expandedSections[key] && <div className="space-y-2 pl-1">{children}</div>}
    </div>
  );

  return (
    <Card className="bg-card/95 border-border shadow-xl backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wider text-purple-600 dark:text-purple-400">
          ACTIVE ZONES
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {renderSection(
          "CONFLUENCE ZONES",
          "confluence",
          sortedConfluence.length,
          sortedConfluence.map(renderConfluenceZone),
          true
        )}

        {renderSection(
          "ORDER BLOCKS",
          "orderBlocks",
          sortedOBs.length,
          sortedOBs.map(renderOrderBlock)
        )}

        {renderSection(
          "FAIR VALUE GAPS",
          "fvgs",
          sortedFVGs.length,
          sortedFVGs.map(renderFVG)
        )}
      </CardContent>
    </Card>
  );
}
