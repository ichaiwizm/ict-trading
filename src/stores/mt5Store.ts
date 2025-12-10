import { create } from 'zustand';
import type { AccountInfo, Position } from '@/lib/mt5/types';

interface MT5State {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  accountId: string | null;
  accountInfo: AccountInfo | null;
  positions: Position[];
  pendingOrders: any[];
  isPlacingOrder: boolean;
  lastOrderResult: any | null;

  setConnected: (status: boolean) => void;
  setConnecting: (status: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setAccountId: (id: string | null) => void;
  setAccountInfo: (info: AccountInfo | null) => void;
  setPositions: (positions: Position[]) => void;
  setPlacingOrder: (status: boolean) => void;
  setLastOrderResult: (result: any) => void;
  disconnect: () => void;
}

export const useMT5Store = create<MT5State>((set) => ({
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  accountId: null,
  accountInfo: null,
  positions: [],
  pendingOrders: [],
  isPlacingOrder: false,
  lastOrderResult: null,

  setConnected: (status) =>
    set({
      isConnected: status,
      isConnecting: false,
      connectionError: status ? null : undefined,
    }),

  setConnecting: (status) =>
    set({
      isConnecting: status,
      connectionError: null,
    }),

  setConnectionError: (error) =>
    set({
      connectionError: error,
      isConnecting: false,
      isConnected: false,
    }),

  setAccountId: (id) =>
    set({
      accountId: id,
    }),

  setAccountInfo: (info) =>
    set({
      accountInfo: info,
    }),

  setPositions: (positions) =>
    set({
      positions,
    }),

  setPlacingOrder: (status) =>
    set({
      isPlacingOrder: status,
    }),

  setLastOrderResult: (result) =>
    set({
      lastOrderResult: result,
    }),

  disconnect: () =>
    set({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      accountId: null,
      accountInfo: null,
      positions: [],
      pendingOrders: [],
      lastOrderResult: null,
    }),
}));
