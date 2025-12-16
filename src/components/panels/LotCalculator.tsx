"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useMT5Store } from "@/stores/mt5Store";
import { useMarketStore } from "@/stores/marketStore";
import { useICTStore } from "@/stores/ictStore";
import { calculateLotSize } from "@/lib/calculations/lotSize";
import { Zap } from "lucide-react";

export function LotCalculator() {
  const { accountInfo } = useMT5Store();
  const { symbol } = useMarketStore();
  const { activeSignal } = useICTStore();

  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercentage, setRiskPercentage] = useState<number>(1);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [useManualBalance, setUseManualBalance] = useState<boolean>(true);
  const [slFromSignal, setSlFromSignal] = useState<boolean>(false);

  // Update balance when account info is available (only if not using manual)
  useEffect(() => {
    if (accountInfo?.balance && !useManualBalance) {
      setAccountBalance(accountInfo.balance);
    }
  }, [accountInfo, useManualBalance]);

  // Auto-update SL pips when active signal changes
  useEffect(() => {
    if (activeSignal?.slDistancePips && activeSignal.slDistancePips > 0) {
      setStopLossPips(Math.round(activeSignal.slDistancePips * 10) / 10);
      setSlFromSignal(true);
    }
  }, [activeSignal]);

  // Calculate lot size
  const calculation = calculateLotSize({
    accountBalance,
    riskPercentage,
    stopLossPips,
    symbol,
    accountCurrency: accountInfo?.currency || "USD",
  });

  return (
    <div className="space-y-4">
      {/* Account Balance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Account Balance</label>
          {accountInfo?.balance && (
            <button
              onClick={() => {
                setUseManualBalance(!useManualBalance);
                if (useManualBalance && accountInfo.balance) {
                  setAccountBalance(accountInfo.balance);
                }
              }}
              className="text-[10px] font-mono text-purple-500 hover:text-purple-400 transition-colors"
            >
              {useManualBalance ? 'Use MT5' : 'Manual'}
            </button>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(Number(e.target.value))}
            className="pl-7 font-mono"
          />
        </div>
      </div>

      {/* Risk Percentage Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Risk %</label>
          <span className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400">
            {riskPercentage.toFixed(1)}%
          </span>
        </div>
        <Slider
          value={[riskPercentage]}
          onValueChange={(value) => setRiskPercentage(value[0])}
          min={0.5}
          max={5}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground/60">
          <span>0.5%</span>
          <span>5%</span>
        </div>
      </div>

      {/* Stop Loss Pips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Stop Loss (pips)</label>
          {slFromSignal && activeSignal && (
            <Badge variant="outline" className="text-[10px] border-purple-500/50 text-purple-500 gap-1">
              <Zap className="h-2.5 w-2.5" />
              {activeSignal.slSource}
            </Badge>
          )}
        </div>
        <Input
          type="number"
          value={stopLossPips}
          onChange={(e) => {
            setStopLossPips(Number(e.target.value));
            setSlFromSignal(false); // Reset when manually changed
          }}
          className={`font-mono ${slFromSignal ? 'border-purple-500/50' : ''}`}
          min={1}
        />
      </div>

      {/* Calculated Results */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Lot Size</span>
          <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {calculation.lotSize.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Risk Amount</span>
          <span className="font-mono text-lg font-semibold text-amber-600 dark:text-amber-400">
            ${calculation.riskAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Pip Value</span>
          <span className="font-mono text-sm text-foreground">
            ${calculation.pipValue.toFixed(2)}/pip
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Max Loss</span>
          <span className="font-mono text-sm text-red-600 dark:text-red-400">
            ${calculation.maxLoss.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
