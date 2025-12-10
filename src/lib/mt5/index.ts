/**
 * MT5 Integration Layer - Main Export
 */

// Client exports
export {
  initializeMetaApi,
  connectToAccount,
  getConnection,
  isConnected,
  disconnect,
} from './client';

// Account exports
export {
  getAccountInfo,
  getPositions,
  getPendingOrders,
} from './account';

// Trading exports
export {
  placeMarketOrder,
  placePendingOrder,
  modifyPosition,
  closePosition,
  closePositionPartially,
} from './trading';

// Type exports
export type {
  AccountInfo,
  Position,
  PendingOrderData,
  TradeOrder,
  PendingOrder,
  TradeResult,
  ConnectionStatus,
} from './types';
