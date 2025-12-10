'use client';

import { useState, useCallback, useMemo } from 'react';
import { useMT5Store, useMarketStore } from '@/stores';
import {
  calculateLotSize,
  calculatePips,
  type LotSizeResult,
} from '@/lib/calculations/lotSize';

interface LotCalculatorState {
  riskPercentage: number;
  stopLossPips: number;
  manualBalance: number | null;
}

export function useLotCalculator() {
  const { accountInfo } = useMT5Store();
  const { symbol, currentPrice } = useMarketStore();

  const [state, setState] = useState<LotCalculatorState>({
    riskPercentage: 1,
    stopLossPips: 25,
    manualBalance: null,
  });

  const balance = state.manualBalance ?? accountInfo?.balance ?? 10000;

  const result: LotSizeResult = useMemo(() => {
    return calculateLotSize({
      accountBalance: balance,
      riskPercentage: state.riskPercentage,
      stopLossPips: state.stopLossPips,
      symbol,
    });
  }, [balance, state.riskPercentage, state.stopLossPips, symbol]);

  const setRiskPercentage = useCallback((value: number) => {
    setState((prev) => ({ ...prev, riskPercentage: value }));
  }, []);

  const setStopLossPips = useCallback((value: number) => {
    setState((prev) => ({ ...prev, stopLossPips: value }));
  }, []);

  const setManualBalance = useCallback((value: number | null) => {
    setState((prev) => ({ ...prev, manualBalance: value }));
  }, []);

  const calculateFromPrice = useCallback(
    (entryPrice: number, stopLossPrice: number) => {
      const pips = calculatePips(entryPrice, stopLossPrice, symbol);
      setState((prev) => ({ ...prev, stopLossPips: Math.abs(pips) }));
    },
    [symbol]
  );

  return {
    balance,
    riskPercentage: state.riskPercentage,
    stopLossPips: state.stopLossPips,
    lotSize: result.lotSize,
    riskAmount: result.riskAmount,
    pipValue: result.pipValue,
    maxLoss: result.maxLoss,
    setRiskPercentage,
    setStopLossPips,
    setManualBalance,
    calculateFromPrice,
  };
}
