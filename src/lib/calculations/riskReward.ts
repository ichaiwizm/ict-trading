/**
 * Risk-Reward Calculator
 * Calculates risk-reward ratios and related metrics
 */

export interface RiskRewardParams {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
}

export function calculateRiskReward(params: RiskRewardParams): number {
  const { entryPrice, stopLoss, takeProfit } = params;

  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);

  if (risk === 0) return 0;

  const ratio = reward / risk;

  return Number(ratio.toFixed(2));
}

export function calculateTakeProfit(
  entryPrice: number,
  stopLoss: number,
  ratio: number
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = risk * ratio;

  const isLong = entryPrice > stopLoss;

  if (isLong) {
    return Number((entryPrice + reward).toFixed(5));
  } else {
    return Number((entryPrice - reward).toFixed(5));
  }
}

export function calculateBreakeven(
  entryPrice: number,
  positionType: 'long' | 'short',
  spreadPips: number
): number {
  const spreadPrice = spreadPips / 10000;

  if (positionType === 'long') {
    return Number((entryPrice + spreadPrice).toFixed(5));
  } else {
    return Number((entryPrice - spreadPrice).toFixed(5));
  }
}
