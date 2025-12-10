/**
 * Formatters
 * Utilities for formatting prices, pips, lots, money, and percentages
 */

/**
 * Get decimal places for a given symbol
 */
function getDecimalPlaces(symbol: string): number {
  const upperSymbol = symbol.toUpperCase();

  // Gold and other metals - 2 decimals
  if (upperSymbol.includes('XAU') || upperSymbol.includes('GOLD')) {
    return 2;
  }

  // JPY pairs - 3 decimals
  if (upperSymbol.includes('JPY')) {
    return 3;
  }

  // Most forex pairs - 5 decimals
  return 5;
}

/**
 * Format price based on symbol's typical decimal places
 */
export function formatPrice(price: number, symbol: string): string {
  const decimals = getDecimalPlaces(symbol);
  return price.toFixed(decimals);
}

/**
 * Format pips value
 */
export function formatPips(pips: number): string {
  const sign = pips >= 0 ? '+' : '';
  return `${sign}${pips.toFixed(1)} pips`;
}

/**
 * Format lot size
 */
export function formatLotSize(lots: number): string {
  if (lots >= 1) {
    return lots.toFixed(2);
  }
  if (lots >= 0.1) {
    return lots.toFixed(2);
  }
  return lots.toFixed(3);
}

/**
 * Format money amount with currency symbol
 */
export function formatMoney(amount: number, currency: string = 'USD'): string {
  const formatted = Math.abs(amount).toFixed(2);
  const sign = amount < 0 ? '-' : '';

  switch (currency.toUpperCase()) {
    case 'USD':
      return `${sign}$${formatted}`;
    case 'EUR':
      return `${sign}€${formatted}`;
    case 'GBP':
      return `${sign}£${formatted}`;
    default:
      return `${sign}${formatted} ${currency}`;
  }
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
