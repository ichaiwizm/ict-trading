/**
 * MT5 Account API Route
 * GET /api/mt5/account - Returns account info and positions
 */

import { NextResponse } from 'next/server';
import { connectToAccount, isConnected } from '@/lib/mt5/client';
import { getAccountInfo, getPositions } from '@/lib/mt5/account';

export async function GET(request: Request) {
  try {
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

    // Fetch account info and positions in parallel
    const [accountInfo, positions] = await Promise.all([
      getAccountInfo(),
      getPositions(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        accountInfo,
        positions,
      },
    });
  } catch (error: any) {
    console.error('Account API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch account data',
      },
      { status: 500 }
    );
  }
}
