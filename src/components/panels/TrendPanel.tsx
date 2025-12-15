"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendAnalysis, StructureBreak } from "@/lib/ict/types";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useICTStore } from "@/stores";

export function TrendPanel() {
  const trend = useICTStore((state) => state.trend);

  // Show loading state when no trend data
  if (!trend) {
    return (
      <Card className="bg-card/95 border-border shadow-xl backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold tracking-wider text-purple-600 dark:text-purple-400">
            TREND ANALYSIS
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500/60" />
          <span className="text-sm text-muted-foreground font-mono">
            Analyzing market structure...
          </span>
          <span className="text-xs text-muted-foreground/60">
            Waiting for 1H & 4H data
          </span>
        </CardContent>
      </Card>
    );
  }

  const currentTrend = trend;
  const getBiasText = () => {
    if (currentTrend.higherTimeframe === "bullish" && currentTrend.lowerTimeframe === "bullish") {
      return "LONGS ONLY";
    }
    if (currentTrend.higherTimeframe === "bearish" && currentTrend.lowerTimeframe === "bearish") {
      return "SHORTS ONLY";
    }
    return "MIXED BIAS";
  };

  const getBiasColor = () => {
    const bias = getBiasText();
    if (bias === "LONGS ONLY") return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    if (bias === "SHORTS ONLY") return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
    return "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30";
  };

  const renderDirection = (direction: string, label: string) => {
    const isBullish = direction === "bullish";
    const isRanging = direction === "ranging";

    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 border border-border/50">
        <span className="text-sm text-muted-foreground font-mono">{label}</span>
        <div className="flex items-center gap-2">
          {isRanging ? (
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">RANGING</span>
          ) : (
            <>
              {isBullish ? (
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <span className={`font-mono text-sm ${isBullish ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {isBullish ? "BULLISH" : "BEARISH"}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  const formatStructureBreak = (sb: StructureBreak) => {
    const isBullish = sb.direction === "bullish";
    return (
      <div key={sb.time} className="flex items-center gap-2 py-1.5">
        <Badge variant="outline" className={`text-xs ${isBullish ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "border-red-500/30 text-red-600 dark:text-red-400"}`}>
          {sb.type.toUpperCase()}
        </Badge>
        <span className="text-xs text-muted-foreground font-mono">
          ${sb.price.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <Card className="bg-card/95 border-border shadow-xl backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wider text-purple-600 dark:text-purple-400">
          TREND ANALYSIS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderDirection(currentTrend.higherTimeframe, "4H")}
        {renderDirection(currentTrend.lowerTimeframe, "1H")}

        <div className="pt-2">
          <Badge className={`w-full justify-center py-2 text-sm font-bold tracking-wider ${getBiasColor()}`}>
            {getBiasText()}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Strength</span>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400">{currentTrend.strength}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              style={{ width: `${currentTrend.strength}%` }}
            />
          </div>
        </div>

        {currentTrend.structureBreaks.length > 0 && (
          <div className="pt-2 space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Recent Breaks</span>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {currentTrend.structureBreaks.slice(0, 5).map(formatStructureBreak)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
