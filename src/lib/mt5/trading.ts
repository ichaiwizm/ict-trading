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
    const orderType = order.type.toLowerCase();

    const options = {
      comment: order.comment || 'ICT Trade',
      magic: order.magic,
    };

    let result;

    if (orderType === 'buy') {
      result = await connection.createMarketBuyOrder(
        order.symbol,
        order.volume,
        order.stopLoss,
        order.takeProfit,
        options
      );
    } else {
      result = await connection.createMarketSellOrder(
        order.symbol,
        order.volume,
        order.stopLoss,
        order.takeProfit,
        options
      );
    }

    return {
      success: true,
      orderId: result.orderId,
      positionId: result.positionId,
      message: `Market ${orderType.toUpperCase()} order placed successfully`,
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
    const orderType = order.type.toLowerCase();

    const options = {
      comment: order.comment || 'ICT Pending Order',
      magic: order.magic,
      expiration: order.expiration,
    };

    let result;

    switch (orderType) {
      case 'buy_limit':
        result = await connection.createLimitBuyOrder(
          order.symbol,
          order.volume,
          order.openPrice,
          order.stopLoss,
          order.takeProfit,
          options
        );
        break;
      case 'sell_limit':
        result = await connection.createLimitSellOrder(
          order.symbol,
          order.volume,
          order.openPrice,
          order.stopLoss,
          order.takeProfit,
          options
        );
        break;
      case 'buy_stop':
        result = await connection.createStopBuyOrder(
          order.symbol,
          order.volume,
          order.openPrice,
          order.stopLoss,
          order.takeProfit,
          options
        );
        break;
      case 'sell_stop':
        result = await connection.createStopSellOrder(
          order.symbol,
          order.volume,
          order.openPrice,
          order.stopLoss,
          order.takeProfit,
          options
        );
        break;
      default:
        throw new Error(`Unknown order type: ${order.type}`);
    }

    return {
      success: true,
      orderId: result.orderId,
      message: `Pending ${orderType.toUpperCase()} order placed successfully`,
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
