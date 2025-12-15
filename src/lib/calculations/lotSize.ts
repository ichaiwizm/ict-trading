/**
 * Lot Size Calculator
 * Calculates position size based on risk management parameters
 */

export interface LotSizeParams {
  accountBalance: number;
  riskPercentage: number;
  stopLossPips: number;
  symbol: string;
  accountCurrency?: string;
}

export interface LotSizeResult {
  lotSize: number;
  riskAmount: number;
  pipValue: number;
  maxLoss: number;
}

const PIP_VALUES: Record<string, number> = {
  EURUSD: 10,
  XAUUSD: 10,
  GBPUSD: 10,
  USDJPY: 10,
  USDCHF: 10,
  AUDUSD: 10,
  NZDUSD: 10,
};

export function getPipValue(symbol: string): number {
  const normalizedSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '');
  return PIP_VALUES[normalizedSymbol] || 10;
}

export function calculatePips(
  entryPrice: number,
  stopLossPrice: number,
  symbol: string
): number {
  const normalizedSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '');
  const priceDiff = Math.abs(entryPrice - stopLossPrice);

  if (normalizedSymbol === 'XAUUSD') {
    return Number((priceDiff * 10).toFixed(1));
  }

  if (normalizedSymbol.includes('JPY')) {
    return Number((priceDiff * 100).toFixed(1));
  }

  return Number((priceDiff * 10000).toFixed(1));
}

export function calculateLotSize(params: LotSizeParams): LotSizeResult {
  const { accountBalance, riskPercentage, stopLossPips, symbol } = params;

  // Guard against invalid inputs
  if (stopLossPips <= 0 || accountBalance <= 0 || riskPercentage <= 0) {
    return {
      lotSize: 0.01,
      riskAmount: 0,
      pipValue: getPipValue(symbol),
      maxLoss: 0,
    };
  }

  const riskAmount = (accountBalance * riskPercentage) / 100;
  const pipValue = getPipValue(symbol);
  const lotSize = riskAmount / (stopLossPips * pipValue);
  const roundedLotSize = Math.round(lotSize * 100) / 100;
  const finalLotSize = Math.max(0.01, roundedLotSize);
  const maxLoss = finalLotSize * stopLossPips * pipValue;

  return {
    lotSize: finalLotSize,
    riskAmount,
    pipValue,
    maxLoss,
  };
}

export function calculatePositionValue(
  lotSize: number,
  symbol: string,
  currentPrice: number
): number {
  const normalizedSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '');

  if (normalizedSymbol === 'XAUUSD') {
    return lotSize * 100 * currentPrice;
  }

  return lotSize * 100000;
}
