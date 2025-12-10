/**
 * MT5 Account Information Module
 */

import { getConnection } from './client';
import type { AccountInfo, Position, PendingOrderData } from './types';

/**
 * Get account information (balance, equity, margin, etc.)
 */
export async function getAccountInfo(): Promise<AccountInfo> {
  try {
    const connection = getConnection();
    const accountInformation = await connection.getAccountInformation();

    return {
      balance: accountInformation.balance || 0,
      equity: accountInformation.equity || 0,
      margin: accountInformation.margin || 0,
      freeMargin: accountInformation.freeMargin || 0,
      marginLevel: accountInformation.marginLevel || 0,
      profit: accountInformation.profit || 0,
      currency: accountInformation.currency || 'USD',
      leverage: accountInformation.leverage || 1,
      name: accountInformation.name || '',
      server: accountInformation.server || '',
      accountId: accountInformation.login?.toString() || '',
    };
  } catch (error) {
    console.error('Failed to get account info:', error);
    throw error;
  }
}

/**
 * Get all open positions with current P/L
 */
export async function getPositions(): Promise<Position[]> {
  try {
    const connection = getConnection();
    const positions = await connection.getPositions();

    return positions.map((pos: any) => ({
      id: pos.id || pos.positionId,
      symbol: pos.symbol,
      type: pos.type === 'POSITION_TYPE_BUY' ? 'buy' : 'sell',
      volume: pos.volume,
      openPrice: pos.openPrice,
      currentPrice: pos.currentPrice,
      stopLoss: pos.stopLoss,
      takeProfit: pos.takeProfit,
      profit: pos.profit || 0,
      swap: pos.swap || 0,
      commission: pos.commission || 0,
      openTime: pos.time || new Date().toISOString(),
      magic: pos.magic,
      comment: pos.comment,
    }));
  } catch (error) {
    console.error('Failed to get positions:', error);
    throw error;
  }
}

/**
 * Get all pending orders
 */
export async function getPendingOrders(): Promise<PendingOrderData[]> {
  try {
    const connection = getConnection();
    const orders = await connection.getOrders();

    return orders.map((order: any) => {
      let orderType: PendingOrderData['type'] = 'buy_limit';

      if (order.type === 'ORDER_TYPE_BUY_LIMIT') orderType = 'buy_limit';
      else if (order.type === 'ORDER_TYPE_SELL_LIMIT') orderType = 'sell_limit';
      else if (order.type === 'ORDER_TYPE_BUY_STOP') orderType = 'buy_stop';
      else if (order.type === 'ORDER_TYPE_SELL_STOP') orderType = 'sell_stop';

      return {
        id: order.id || order.orderId,
        symbol: order.symbol,
        type: orderType,
        volume: order.volume,
        openPrice: order.openPrice,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        expiration: order.expirationTime,
        magic: order.magic,
        comment: order.comment,
      };
    });
  } catch (error) {
    console.error('Failed to get pending orders:', error);
    throw error;
  }
}
