'use client';

import { useCallback } from 'react';
import { useMT5Store } from '@/stores';
import type { TradeOrder } from '@/lib/mt5/types';

export function useMT5() {
  const {
    isConnected,
    isConnecting,
    connectionError,
    accountId,
    accountInfo,
    positions,
    pendingOrders,
    isPlacingOrder,
    lastOrderResult,
    setConnected,
    setConnecting,
    setConnectionError,
    setAccountId,
    setAccountInfo,
    setPositions,
    setPlacingOrder,
    setLastOrderResult,
    disconnect: storeDisconnect,
  } = useMT5Store();

  const connect = useCallback(
    async (newAccountId: string) => {
      setConnecting(true);
      setConnectionError(null);

      try {
        const response = await fetch('/api/mt5/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: newAccountId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Connection failed');
        }

        setAccountId(newAccountId);
        setConnected(true);
        await refreshAccount();
      } catch (error) {
        setConnectionError(
          error instanceof Error ? error.message : 'Connection failed'
        );
        setConnected(false);
      } finally {
        setConnecting(false);
      }
    },
    [setConnecting, setConnectionError, setAccountId, setConnected]
  );

  const disconnect = useCallback(() => {
    storeDisconnect();
  }, [storeDisconnect]);

  const refreshAccount = useCallback(async () => {
    if (!isConnected) return;

    try {
      const response = await fetch('/api/mt5/account');
      const data = await response.json();

      if (response.ok) {
        setAccountInfo(data.accountInfo);
        setPositions(data.positions || []);
      }
    } catch (error) {
      console.error('Failed to refresh account:', error);
    }
  }, [isConnected, setAccountInfo, setPositions]);

  const placeOrder = useCallback(
    async (order: TradeOrder) => {
      if (!isConnected) {
        throw new Error('Not connected to MT5');
      }

      setPlacingOrder(true);

      try {
        const response = await fetch('/api/mt5/trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'open', ...order }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Order failed');
        }

        setLastOrderResult(data);
        await refreshAccount();
        return data;
      } catch (error) {
        const errorResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Order failed',
        };
        setLastOrderResult(errorResult);
        throw error;
      } finally {
        setPlacingOrder(false);
      }
    },
    [isConnected, setPlacingOrder, setLastOrderResult, refreshAccount]
  );

  const closePosition = useCallback(
    async (positionId: string) => {
      if (!isConnected) return;

      try {
        const response = await fetch('/api/mt5/trade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'close', positionId }),
        });

        if (response.ok) {
          await refreshAccount();
        }
      } catch (error) {
        console.error('Failed to close position:', error);
      }
    },
    [isConnected, refreshAccount]
  );

  return {
    isConnected,
    isConnecting,
    connectionError,
    accountId,
    accountInfo,
    positions,
    pendingOrders,
    isPlacingOrder,
    lastOrderResult,
    connect,
    disconnect,
    refreshAccount,
    placeOrder,
    closePosition,
  };
}
