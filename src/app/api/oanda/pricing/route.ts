import { NextRequest, NextResponse } from 'next/server';
import { oandaDataProvider } from '@/lib/oanda';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') as 'EURUSD' | 'XAUUSD';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required (EURUSD or XAUUSD)' },
        { status: 400 }
      );
    }

    console.log(`[API/oanda/pricing] Fetching quote for ${symbol}`);

    const quote = await oandaDataProvider.getQuote(symbol);

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error('[API/oanda/pricing] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch pricing',
        success: false,
      },
      { status: 500 }
    );
  }
}
