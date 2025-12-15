// OANDA API v20 Types

export type OandaEnvironment = 'practice' | 'live';

export interface OandaConfig {
  apiKey: string;
  environment: OandaEnvironment;
  accountId?: string;
}

// Account types
export interface OandaAccount {
  id: string;
  tags: string[];
}

export interface OandaAccountsResponse {
  accounts: OandaAccount[];
}

// Candlestick types
export interface OandaCandlestick {
  time: string;
  volume: number;
  mid?: {
    o: string; // open
    h: string; // high
    l: string; // low
    c: string; // close
  };
  bid?: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
  ask?: {
    o: string;
    h: string;
    l: string;
    c: string;
  };
  complete: boolean;
}

export interface OandaCandlesResponse {
  instrument: string;
  granularity: string;
  candles: OandaCandlestick[];
}

// Pricing types
export interface OandaPrice {
  time: string;
  tradeable: boolean;
  instrument: string;
  bids: Array<{ price: string; liquidity: number }>;
  asks: Array<{ price: string; liquidity: number }>;
  closeoutBid: string;
  closeoutAsk: string;
  status: string;
}

export interface OandaPricingResponse {
  time: string;
  prices: OandaPrice[];
}

// Granularity mapping
export type OandaGranularity =
  | 'S5' | 'S10' | 'S15' | 'S30'  // Seconds
  | 'M1' | 'M2' | 'M4' | 'M5' | 'M10' | 'M15' | 'M30'  // Minutes
  | 'H1' | 'H2' | 'H3' | 'H4' | 'H6' | 'H8' | 'H12'    // Hours
  | 'D' | 'W' | 'M';  // Day, Week, Month

// Map app timeframes to OANDA granularity
export const timeframeToGranularity: Record<string, OandaGranularity> = {
  '1m': 'M1',
  '5m': 'M5',
  '15m': 'M15',
  '30m': 'M30',
  '1H': 'H1',
  '4H': 'H4',
  '1D': 'D',
  '1W': 'W',
};

// Instrument mapping (app symbols to OANDA format)
export const symbolToInstrument: Record<string, string> = {
  'EURUSD': 'EUR_USD',
  'XAUUSD': 'XAU_USD',
  'GBPUSD': 'GBP_USD',
  'USDJPY': 'USD_JPY',
};

export const instrumentToSymbol: Record<string, string> = {
  'EUR_USD': 'EURUSD',
  'XAU_USD': 'XAUUSD',
  'GBP_USD': 'GBPUSD',
  'USD_JPY': 'USDJPY',
};
