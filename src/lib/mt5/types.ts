/**
 * MT5 Integration Type Definitions
 */

export interface AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  profit: number;
  currency: string;
  leverage: number;
  name: string;
  server: string;
  accountId: string;
}

export interface Position {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string;
  magic?: number;
  comment?: string;
}

export interface PendingOrderData {
  id: string;
  symbol: string;
  type: 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  volume: number;
  openPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: string;
  magic?: number;
  comment?: string;
}

export interface TradeOrder {
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  magic?: number;
}

export interface PendingOrder {
  symbol: string;
  type: 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  volume: number;
  openPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: Date;
  comment?: string;
  magic?: number;
}

export interface TradeResult {
  success: boolean;
  orderId?: string;
  positionId?: string;
  error?: string;
  message?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  accountId?: string;
  error?: string;
}
