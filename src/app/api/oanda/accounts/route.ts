import { NextResponse } from 'next/server';
import { oandaClient } from '@/lib/oanda';

export async function GET() {
  try {
    console.log('[API/oanda/accounts] Fetching accounts...');

    if (!oandaClient.isConfigured()) {
      return NextResponse.json(
        {
          error: 'OANDA not configured. Please set OANDA_API_KEY in .env.local',
          success: false,
        },
        { status: 400 }
      );
    }

    const accounts = await oandaClient.getAccounts();
    const accountId = await oandaClient.getAccountId();

    return NextResponse.json({
      success: true,
      accounts: accounts.accounts,
      primaryAccountId: accountId,
      config: {
        environment: oandaClient.getConfig().environment,
        apiKeyConfigured: true,
      },
    });
  } catch (error) {
    console.error('[API/oanda/accounts] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
        success: false,
      },
      { status: 500 }
    );
  }
}
