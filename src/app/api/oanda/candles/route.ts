import { NextRequest, NextResponse } from 'next/server';
import { oandaDataProvider } from '@/lib/oanda';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') as 'EURUSD' | 'XAUUSD';
    const timeframe = searchParams.get('timeframe') || '1H';
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required (EURUSD or XAUUSD)' },
        { status: 400 }
      );
    }

    console.log(`[API/oanda/candles] Fetching ${timeframe} candles for ${symbol}`);

    const candles = await oandaDataProvider.getCandles(symbol, timeframe, limit);

    return NextResponse.json({
      success: true,
      symbol,
      timeframe,
      count: candles.length,
      candles,
    });
  } catch (error) {
    console.error('[API/oanda/candles] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch candles',
        success: false,
      },
      { status: 500 }
    );
  }
}
