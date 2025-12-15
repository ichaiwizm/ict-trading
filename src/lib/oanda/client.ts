// OANDA API v20 Client

import {
  OandaConfig,
  OandaEnvironment,
  OandaAccountsResponse,
  OandaCandlesResponse,
  OandaPricingResponse,
  OandaGranularity,
} from './types';

const API_URLS: Record<OandaEnvironment, string> = {
  practice: 'https://api-fxpractice.oanda.com',
  live: 'https://api-fxtrade.oanda.com',
};

class OandaClient {
  private apiKey: string | null = null;
  private environment: OandaEnvironment = 'practice';
  private accountId: string | null = null;

  constructor() {
    this.apiKey = process.env.OANDA_API_KEY || null;
    this.environment = (process.env.OANDA_ENVIRONMENT as OandaEnvironment) || 'practice';

    console.log('[OandaClient] Initialized');
    console.log('[OandaClient] API Key present:', !!this.apiKey);
    console.log('[OandaClient] Environment:', this.environment);
  }

  private get baseUrl(): string {
    return API_URLS[this.environment];
  }

  private get headers(): HeadersInit {
    if (!this.apiKey) {
      throw new Error('OANDA API key not configured');
    }
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async getAccounts(): Promise<OandaAccountsResponse> {
    const url = `${this.baseUrl}/v3/accounts`;
    console.log('[OandaClient] Fetching accounts...');

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OandaClient] Failed to fetch accounts:', error);
      throw new Error(`OANDA API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('[OandaClient] Found accounts:', data.accounts?.length || 0);
    return data;
  }

  async getAccountId(): Promise<string> {
    if (this.accountId) {
      return this.accountId;
    }

    const accounts = await this.getAccounts();
    if (!accounts.accounts || accounts.accounts.length === 0) {
      throw new Error('No OANDA accounts found');
    }

    this.accountId = accounts.accounts[0].id;
    console.log('[OandaClient] Using account ID:', this.accountId);
    return this.accountId;
  }

  async getCandles(
    instrument: string,
    granularity: OandaGranularity,
    count: number = 200
  ): Promise<OandaCandlesResponse> {
    const url = `${this.baseUrl}/v3/instruments/${instrument}/candles?granularity=${granularity}&count=${count}&price=M`;

    console.log(`[OandaClient] Fetching ${count} ${granularity} candles for ${instrument}...`);

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OandaClient] Failed to fetch candles:', error);
      throw new Error(`OANDA API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log(`[OandaClient] Received ${data.candles?.length || 0} candles`);
    return data;
  }

  async getPricing(instruments: string[]): Promise<OandaPricingResponse> {
    const accountId = await this.getAccountId();
    const instrumentsParam = instruments.join(',');
    const url = `${this.baseUrl}/v3/accounts/${accountId}/pricing?instruments=${instrumentsParam}`;

    console.log(`[OandaClient] Fetching pricing for ${instrumentsParam}...`);

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OandaClient] Failed to fetch pricing:', error);
      throw new Error(`OANDA API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log(`[OandaClient] Received pricing for ${data.prices?.length || 0} instruments`);
    return data;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getConfig(): OandaConfig {
    return {
      apiKey: this.apiKey || '',
      environment: this.environment,
      accountId: this.accountId || undefined,
    };
  }
}

export const oandaClient = new OandaClient();
