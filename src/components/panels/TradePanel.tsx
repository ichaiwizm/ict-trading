"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMT5Store } from "@/stores/mt5Store";
import { useMarketStore } from "@/stores/marketStore";
import { useAlertStore } from "@/stores/alertStore";
import { useICTStore } from "@/stores/ictStore";
import { calculateLotSize } from "@/lib/calculations/lotSize";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  ShieldAlert,
  Loader2,
  Zap
} from "lucide-react";
import type { Position } from "@/lib/mt5/types";

type OrderType = "buy" | "sell";

export function TradePanel() {
  const { isConnected, accountInfo, positions, setPositions, isPlacingOrder, setPlacingOrder } = useMT5Store();
  const { symbol, bid, ask } = useMarketStore();
  const { addAlert } = useAlertStore();
  const { activeSignal, entrySignals, setActiveSignal, settings } = useICTStore();

  const [orderType, setOrderType] = useState<OrderType>("buy");
  const [lotSize, setLotSize] = useState<string>("0.01");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");

  const currentPrice = orderType === "buy" ? ask : bid;
  const spread = ask - bid;

  // Auto-fill from active signal
  useEffect(() => {
    if (activeSignal) {
      // Set order type
      setOrderType(activeSignal.direction === 'long' ? 'buy' : 'sell');

      // Set SL and TP
      setStopLoss(activeSignal.suggestedSL.toFixed(symbol === 'XAUUSD' ? 2 : 5));
      setTakeProfit(activeSignal.suggestedTP1.toFixed(symbol === 'XAUUSD' ? 2 : 5));

      // Calculate lot size based on risk
      const balance = accountInfo?.balance || 10000;
      const riskPercentage = settings.defaultRiskPercentage;

      if (activeSignal.slDistancePips > 0) {
        const calculation = calculateLotSize({
          accountBalance: balance,
          riskPercentage,
          stopLossPips: activeSignal.slDistancePips,
          symbol,
        });
        setLotSize(calculation.lotSize.toFixed(2));
      }

      // Show alert
      addAlert({
        type: "info",
        title: "Signal Applied",
        message: `${activeSignal.direction.toUpperCase()} - SL: ${activeSignal.slDistancePips.toFixed(1)} pips (${activeSignal.slSource})`,
        priority: "medium",
      });
    }
  }, [activeSignal, symbol, accountInfo?.balance, settings.defaultRiskPercentage, addAlert]);

  // Handler to apply signal
  const handleApplySignal = () => {
    if (entrySignals.length > 0) {
      setActiveSignal(entrySignals[0]);
    }
  };

  // Get pip size based on symbol
  const pipSize = symbol === "XAUUSD" ? 0.1 : 0.0001;
  const pipDigits = symbol === "XAUUSD" ? 1 : 4;

  const formatPrice = (price: number) => {
    return price.toFixed(symbol === "XAUUSD" ? 2 : 5);
  };

  const handlePlaceOrder = async (type: OrderType) => {
    if (!isConnected) {
      addAlert({
        type: "info",
        title: "Demo Mode",
        message: "Trading in demo mode - orders are simulated",
        priority: "medium",
      });
    }

    setPlacingOrder(true);

    // Simulate order execution delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const entryPrice = type === "buy" ? ask : bid;
    const sl = stopLoss ? parseFloat(stopLoss) : undefined;
    const tp = takeProfit ? parseFloat(takeProfit) : undefined;
    const volume = parseFloat(lotSize);

    // Create simulated position
    const newPosition: Position = {
      id: `demo-${Date.now()}`,
      symbol,
      type,
      volume,
      openPrice: entryPrice,
      currentPrice: entryPrice,
      stopLoss: sl,
      takeProfit: tp,
      profit: 0,
      swap: 0,
      commission: -0.07 * volume, // Simulated commission
      openTime: new Date().toISOString(),
      comment: "Demo order",
    };

    // Add to positions
    setPositions([...positions, newPosition]);
    setPlacingOrder(false);

    // Show success alert
    addAlert({
      type: "entry",
      title: `${type.toUpperCase()} Order Executed`,
      message: `${symbol} ${volume} lots @ ${formatPrice(entryPrice)}`,
      priority: "high",
    });

    // Reset SL/TP fields
    setStopLoss("");
    setTakeProfit("");
  };

  const handleQuickOrder = (type: OrderType) => {
    setOrderType(type);
    handlePlaceOrder(type);
  };

  return (
    <div className="space-y-4">
      {/* Current Prices */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={() => setOrderType("sell")}
          className={`p-3 rounded-lg border transition-all ${
            orderType === "sell"
              ? "bg-red-500/20 border-red-500/50"
              : "bg-secondary/50 border-border hover:border-red-500/30"
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            <span className="text-xs text-red-600 dark:text-red-400 uppercase font-medium">Sell</span>
          </div>
          <span className="text-lg font-bold font-mono text-red-600 dark:text-red-400">
            {formatPrice(bid)}
          </span>
        </button>

        <button
          onClick={() => setOrderType("buy")}
          className={`p-3 rounded-lg border transition-all ${
            orderType === "buy"
              ? "bg-emerald-500/20 border-emerald-500/50"
              : "bg-secondary/50 border-border hover:border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-medium">Buy</span>
          </div>
          <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatPrice(ask)}
          </span>
        </button>
      </div>

      {/* Spread */}
      <div className="flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          Spread: <span className="font-mono text-foreground">{(spread / pipSize).toFixed(1)} pips</span>
        </span>
      </div>

      {/* Apply Signal Button */}
      {entrySignals.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleApplySignal}
          className="w-full border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
        >
          <Zap className="h-4 w-4 mr-2" />
          Apply Signal ({entrySignals[0].direction.toUpperCase()} - SL: {entrySignals[0].slDistancePips.toFixed(1)} pips)
        </Button>
      )}

      {/* Active Signal Info */}
      {activeSignal && (
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              Signal Active
            </span>
            <Badge variant="outline" className="text-[10px] border-purple-500/50">
              {activeSignal.slSource} / {activeSignal.tpSource}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">SL:</span>{" "}
              <span className="text-red-500">{activeSignal.slDistancePips.toFixed(1)}p</span>
            </div>
            <div>
              <span className="text-muted-foreground">TP:</span>{" "}
              <span className="text-emerald-500">{activeSignal.suggestedTP1.toFixed(symbol === 'XAUUSD' ? 2 : 5)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">R:R:</span>{" "}
              <span className="text-purple-500">{activeSignal.riskRewardRatio.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lot Size */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center justify-between">
          <span>Volume (lots)</span>
          <span className="text-muted-foreground/70">Min: 0.01</span>
        </label>
        <Input
          type="number"
          value={lotSize}
          onChange={(e) => setLotSize(e.target.value)}
          className="font-mono text-center text-lg"
          min={0.01}
          step={0.01}
        />
        <div className="flex gap-1">
          {["0.01", "0.05", "0.1", "0.5", "1.0"].map((size) => (
            <button
              key={size}
              onClick={() => setLotSize(size)}
              className={`flex-1 py-1 text-xs font-mono rounded transition-colors ${
                lotSize === size
                  ? "bg-purple-500/30 text-purple-600 dark:text-purple-400"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* SL/TP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-red-500" />
            Stop Loss
          </label>
          <Input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder={formatPrice(orderType === "buy" ? bid - 50 * pipSize : ask + 50 * pipSize)}
            className="font-mono text-sm"
            step={pipSize}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="h-3 w-3 text-emerald-500" />
            Take Profit
          </label>
          <Input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder={formatPrice(orderType === "buy" ? ask + 100 * pipSize : bid - 100 * pipSize)}
            className="font-mono text-sm"
            step={pipSize}
          />
        </div>
      </div>

      {/* Execute Button */}
      <Button
        onClick={() => handlePlaceOrder(orderType)}
        disabled={isPlacingOrder || !lotSize}
        className={`w-full py-6 text-lg font-bold ${
          orderType === "buy"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isPlacingOrder ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {orderType === "buy" ? (
              <ArrowUpCircle className="h-5 w-5 mr-2" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 mr-2" />
            )}
            {orderType.toUpperCase()} {lotSize} lots
          </>
        )}
      </Button>

      {/* Quick Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handleQuickOrder("sell")}
          disabled={isPlacingOrder}
          className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
        >
          <TrendingDown className="h-4 w-4 mr-1" />
          Quick Sell
        </Button>
        <Button
          variant="outline"
          onClick={() => handleQuickOrder("buy")}
          disabled={isPlacingOrder}
          className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Quick Buy
        </Button>
      </div>

      {/* Demo Mode Notice */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground/70">
          Demo mode - Orders are simulated
        </span>
      </div>
    </div>
  );
}
