/**
 * MT5 Trading API Route
 * POST /api/mt5/trade - Place, modify, or close trades
 */

import { NextResponse } from 'next/server';
import { connectToAccount, isConnected } from '@/lib/mt5/client';
import {
  placeMarketOrder,
  placePendingOrder,
  modifyPosition,
  closePosition,
  closePositionPartially,
} from '@/lib/mt5/trading';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, symbol, type, volume, stopLoss, takeProfit, positionId, openPrice } = body;

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Connect if not already connected
    if (!isConnected()) {
      const accountId = process.env.METAAPI_ACCOUNT_ID;

      if (!accountId) {
        return NextResponse.json(
          { error: 'METAAPI_ACCOUNT_ID not configured' },
          { status: 500 }
        );
      }

      await connectToAccount(accountId);
    }

    let result;

    switch (action) {
      case 'open':
        if (!symbol || !type || !volume) {
          return NextResponse.json(
            { success: false, error: 'Symbol, type, and volume are required for opening trades' },
            { status: 400 }
          );
        }

        // Check if it's a pending order or market order
        if (openPrice && ['buy_limit', 'sell_limit', 'buy_stop', 'sell_stop'].includes(type)) {
          result = await placePendingOrder({
            symbol,
            type,
            volume,
            openPrice,
            stopLoss,
            takeProfit,
          });
        } else {
          result = await placeMarketOrder({
            symbol,
            type: type === 'buy' ? 'buy' : 'sell',
            volume,
            stopLoss,
            takeProfit,
          });
        }
        break;

      case 'modify':
        if (!positionId) {
          return NextResponse.json(
            { success: false, error: 'Position ID is required for modifying positions' },
            { status: 400 }
          );
        }

        result = await modifyPosition(positionId, stopLoss, takeProfit);
        break;

      case 'close':
        if (!positionId) {
          return NextResponse.json(
            { success: false, error: 'Position ID is required for closing positions' },
            { status: 400 }
          );
        }

        if (volume) {
          result = await closePositionPartially(positionId, volume);
        } else {
          result = await closePosition(positionId);
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: open, close, or modify' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Trade API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Trade operation failed',
      },
      { status: 500 }
    );
  }
}
