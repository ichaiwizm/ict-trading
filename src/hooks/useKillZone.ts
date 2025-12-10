'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMarketStore, useICTStore } from '@/stores';
import {
  getKillZoneStatus,
  shouldTradeNow,
  getTimeUntilNextKillZone,
} from '@/lib/ict/killZones';
import type { KillZone } from '@/lib/ict/types';

export function useKillZone() {
  const { symbol } = useMarketStore();
  const { setKillZones } = useICTStore();

  const [activeKillZone, setActiveKillZone] = useState<KillZone | null>(null);
  const [nextKillZone, setNextKillZone] = useState<{
    name: string;
    seconds: number;
  } | null>(null);
  const [canTrade, setCanTrade] = useState(false);

  const updateKillZones = useCallback(() => {
    const killZones = getKillZoneStatus(symbol);
    setKillZones(killZones);

    const active = killZones.find((kz) => kz.isActive);
    setActiveKillZone(active || null);

    const next = getTimeUntilNextKillZone(symbol);
    setNextKillZone(next);

    setCanTrade(shouldTradeNow(symbol));
  }, [symbol, setKillZones]);

  // Update every second for countdown
  useEffect(() => {
    updateKillZones();
    const interval = setInterval(updateKillZones, 1000);
    return () => clearInterval(interval);
  }, [updateKillZones]);

  return {
    activeKillZone,
    nextKillZone,
    canTrade,
    refresh: updateKillZones,
  };
}
