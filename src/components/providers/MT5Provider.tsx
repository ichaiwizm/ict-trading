'use client';

import { useEffect, useRef } from 'react';
import { useMT5Store } from '@/stores';

const REFRESH_INTERVAL = 30000; // 30 seconds

export function MT5Provider({ children }: { children: React.ReactNode }) {
  const {
    isConnected,
    isConnecting,
    setConnected,
    setConnecting,
    setConnectionError,
    setAccountInfo,
    setPositions,
    setPendingOrders,
  } = useMT5Store();

  const hasAttemptedConnection = useRef(false);

  // Auto-connect on mount
  useEffect(() => {
    if (hasAttemptedConnection.current || isConnected || isConnecting) {
      return;
    }

    hasAttemptedConnection.current = true;

    const autoConnect = async () => {
      setConnecting(true);

      try {
        // Connect using env variable (no accountId needed)
        const connectRes = await fetch('/api/mt5/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        const connectData = await connectRes.json();

        if (!connectRes.ok || !connectData.success) {
          throw new Error(connectData.error || 'Connection failed');
        }

        setConnected(true);

        // Fetch account info
        const accountRes = await fetch('/api/mt5/account');
        const accountData = await accountRes.json();

        if (accountRes.ok && accountData.success && accountData.data) {
          setAccountInfo(accountData.data.accountInfo);
          setPositions(accountData.data.positions || []);
          setPendingOrders(accountData.data.pendingOrders || []);
        }
      } catch (error) {
        console.error('MT5 auto-connect failed:', error);
        setConnectionError(
          error instanceof Error ? error.message : 'Auto-connection failed'
        );
        setConnected(false);
      } finally {
        setConnecting(false);
      }
    };

    autoConnect();
  }, []);

  // Periodic refresh when connected
  useEffect(() => {
    if (!isConnected) return;

    const refresh = async () => {
      try {
        const res = await fetch('/api/mt5/account');
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setAccountInfo(data.data.accountInfo);
          setPositions(data.data.positions || []);
          setPendingOrders(data.data.pendingOrders || []);
        }
      } catch (error) {
        console.error('MT5 refresh failed:', error);
      }
    };

    const intervalId = setInterval(refresh, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isConnected, setAccountInfo, setPositions, setPendingOrders]);

  return <>{children}</>;
}
