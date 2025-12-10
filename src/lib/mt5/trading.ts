/**
 * MT5 Trading Operations Module
 */

import { getConnection } from './client';
import type { TradeOrder, PendingOrder, TradeResult } from './types';

/**
 * Place a market order (buy or sell)
 */
export async function placeMarketOrder(order: TradeOrder): Promise<TradeResult> {
  try {
    const connection = getConnection();

    const tradeRequest = {
      actionType: 'ORDER_TYPE_BUY' === order.type.toUpperCase()
        ? 'ORDER_TYPE_BUY'
        : 'ORDER_TYPE_SELL',
      symbol: order.symbol,
      volume: order.volume,
      stopLoss: order.stopLoss,
      takeProfit: order.takeProfit,
      comment: order.comment || 'ICT Trade',
      magic: order.magic,
    };

    const result = await connection.createMarketBuyOrder(
      order.symbol,
      order.volume,
      order.stopLoss,
      order.takeProfit,
      {
        comment: order.comment || 'ICT Trade',
        magic: order.magic,
      }
    );

    return {
      success: true,
      orderId: result.orderId,
      positionId: result.positionId,
      message: 'Market order placed successfully',
    };
  } catch (error: any) {
    console.error('Failed to place market order:', error);
    return {
      success: false,
      error: error.message || 'Failed to place market order',
    };
  }
}

/**
 * Place a pending order (limit or stop)
 */
export async function placePendingOrder(order: PendingOrder): Promise<TradeResult> {
  try {
    const connection = getConnection();

    let orderType = 'ORDER_TYPE_BUY_LIMIT';
    if (order.type === 'sell_limit') orderType = 'ORDER_TYPE_SELL_LIMIT';
    else if (order.type === 'buy_stop') orderType = 'ORDER_TYPE_BUY_STOP';
    else if (order.type === 'sell_stop') orderType = 'ORDER_TYPE_SELL_STOP';

    const result = await connection.createLimitBuyOrder(
      order.symbol,
      order.volume,
      order.openPrice,
      order.stopLoss,
      order.takeProfit,
      {
        comment: order.comment || 'ICT Pending Order',
        magic: order.magic,
        expiration: order.expiration,
      }
    );

    return {
      success: true,
      orderId: result.orderId,
      message: 'Pending order placed successfully',
    };
  } catch (error: any) {
    console.error('Failed to place pending order:', error);
    return {
      success: false,
      error: error.message || 'Failed to place pending order',
    };
  }
}

/**
 * Modify stop loss and take profit on an existing position
 */
export async function modifyPosition(
  positionId: string,
  stopLoss?: number,
  takeProfit?: number
): Promise<TradeResult> {
  try {
    const connection = getConnection();

    await connection.modifyPosition(positionId, stopLoss, takeProfit);

    return {
      success: true,
      positionId,
      message: 'Position modified successfully',
    };
  } catch (error: any) {
    console.error('Failed to modify position:', error);
    return {
      success: false,
      error: error.message || 'Failed to modify position',
    };
  }
}

/**
 * Close a position completely
 */
export async function closePosition(positionId: string): Promise<TradeResult> {
  try {
    const connection = getConnection();

    await connection.closePosition(positionId);

    return {
      success: true,
      positionId,
      message: 'Position closed successfully',
    };
  } catch (error: any) {
    console.error('Failed to close position:', error);
    return {
      success: false,
      error: error.message || 'Failed to close position',
    };
  }
}

/**
 * Close a position partially
 */
export async function closePositionPartially(
  positionId: string,
  volume: number
): Promise<TradeResult> {
  try {
    const connection = getConnection();

    await connection.closePositionPartially(positionId, volume);

    return {
      success: true,
      positionId,
      message: `Position partially closed (${volume} lots)`,
    };
  } catch (error: any) {
    console.error('Failed to partially close position:', error);
    return {
      success: false,
      error: error.message || 'Failed to partially close position',
    };
  }
}
