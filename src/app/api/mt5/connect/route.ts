/**
 * MT5 Connection API Route
 * POST /api/mt5/connect - Connect to MT5 account
 */

import { NextResponse } from 'next/server';
import { connectToAccount, isConnected, disconnect } from '@/lib/mt5/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { accountId } = body;

    // Use environment variable if accountId not provided
    if (!accountId) {
      accountId = process.env.METAAPI_ACCOUNT_ID;
    }

    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account ID is required. Provide it in request body or set METAAPI_ACCOUNT_ID',
        },
        { status: 400 }
      );
    }

    // Check if already connected
    if (isConnected()) {
      return NextResponse.json({
        success: true,
        message: 'Already connected to MT5',
        connected: true,
        accountId,
      });
    }

    // Connect to account
    await connectToAccount(accountId);

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to MT5',
      connected: true,
      accountId,
    });
  } catch (error: any) {
    console.error('Connection API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to MT5',
        connected: false,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await disconnect();

    return NextResponse.json({
      success: true,
      message: 'Disconnected from MT5',
      connected: false,
    });
  } catch (error: any) {
    console.error('Disconnect API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to disconnect from MT5',
      },
      { status: 500 }
    );
  }
}
