/**
 * ICT Trading Types
 * All types related to ICT (Inner Circle Trader) trading methodology
 */

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type SwingPointType = 'high' | 'low';

export interface SwingPoint {
  time: number;
  price: number;
  type: SwingPointType;
  index: number;
  strength: number;
}

export type OrderBlockType = 'bullish' | 'bearish';
export type OrderBlockStatus = 'valid' | 'mitigated' | 'invalidated';

export interface OrderBlock {
  id: string;
  type: OrderBlockType;
  top: number;
  bottom: number;
  startTime: number;
  status: OrderBlockStatus;
  strength: number;
  retestCount: number;
}

export type FairValueGapType = 'bullish' | 'bearish';
export type FairValueGapStatus = 'unfilled' | 'partially_filled' | 'filled' | 'invalidated';

export interface FairValueGap {
  id: string;
  type: FairValueGapType;
  top: number;
  bottom: number;
  startTime: number;
  status: FairValueGapStatus;
  fillPercentage: number;
  inPremium: boolean;
  inDiscount: boolean;
}

export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
}

export interface FibonacciZone {
  swingLow: SwingPoint;
  swingHigh: SwingPoint;
  levels: FibonacciLevel[];
  premiumZone: { top: number; bottom: number };
  discountZone: { top: number; bottom: number };
}

export type ConfluenceType = 'bullish' | 'bearish';

export interface ConfluenceZone {
  id: string;
  orderBlock: OrderBlock | null;
  fairValueGap: FairValueGap | null;
  type: ConfluenceType;
  overlapTop: number;
  overlapBottom: number;
  inOptimalZone: boolean;
  strength: number;
}

export type KillZoneName = 'london' | 'new_york_am' | 'new_york_pm' | 'asian';

export interface KillZone {
  name: KillZoneName;
  startUTC: string;
  endUTC: string;
  isActive: boolean;
  timeRemaining?: number;
  volatilityExpected: 'high' | 'medium' | 'low';
}

export type TrendDirection = 'bullish' | 'bearish' | 'ranging';
export type StructureBreakType = 'bos' | 'choch';
export type StructureBreakDirection = 'bullish' | 'bearish';

export interface StructureBreak {
  type: StructureBreakType;
  direction: StructureBreakDirection;
  price: number;
  time: number;
}

export interface TrendAnalysis {
  direction: TrendDirection;
  strength: number;
  higherTimeframe: TrendDirection;
  lowerTimeframe: TrendDirection;
  structureBreaks: StructureBreak[];
}

export type EntrySignalType = 'sweep_and_shift' | 'orderblock_retest' | 'fvg_fill';
export type EntryDirection = 'long' | 'short';

export interface EntryZone {
  top: number;
  bottom: number;
}

export interface EntrySignal {
  id: string;
  type: EntrySignalType;
  direction: EntryDirection;
  sweepTime: number | null;
  shiftTime: number | null;
  entryZone: EntryZone;
  suggestedEntry: number;
  suggestedSL: number;
  suggestedTP1: number;
  suggestedTP2: number | null;
  riskRewardRatio: number;
  confidence: number;
}

export interface ICTAnalysis {
  symbol: string;
  timestamp: number;
  trend: TrendAnalysis;
  swingPoints: SwingPoint[];
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  fibonacci: FibonacciZone | null;
  confluenceZones: ConfluenceZone[];
  killZones: KillZone[];
  entrySignals: EntrySignal[];
}
