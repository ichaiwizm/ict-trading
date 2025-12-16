import { create } from 'zustand';
import type {
  TrendAnalysis,
  OrderBlock,
  FairValueGap,
  FibonacciZone,
  ConfluenceZone,
  KillZone,
  EntrySignal,
  SwingPoint,
} from '@/lib/ict/types';

interface ICTState {
  trend: TrendAnalysis | null;
  swingPoints: SwingPoint[];
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  fibonacci: FibonacciZone | null;
  confluenceZones: ConfluenceZone[];
  killZones: KillZone[];
  entrySignals: EntrySignal[];
  isAnalyzing: boolean;
  lastAnalysis: number;

  // Active signal for TradePanel auto-fill
  activeSignal: EntrySignal | null;

  settings: {
    swingLength: number;
    showMitigated: boolean;
    showInvalidated: boolean;
    slBufferPips: number;
    defaultRiskPercentage: number;
  };

  setAnalysis: (analysis: Partial<ICTState>) => void;
  updateOrderBlock: (id: string, updates: Partial<OrderBlock>) => void;
  updateFVG: (id: string, updates: Partial<FairValueGap>) => void;
  setKillZones: (kzs: KillZone[]) => void;
  updateSettings: (settings: Partial<ICTState['settings']>) => void;
  setActiveSignal: (signal: EntrySignal | null) => void;
  clearAnalysis: () => void;
}

export const useICTStore = create<ICTState>((set, get) => ({
  trend: null,
  swingPoints: [],
  orderBlocks: [],
  fairValueGaps: [],
  fibonacci: null,
  confluenceZones: [],
  killZones: [],
  entrySignals: [],
  isAnalyzing: false,
  lastAnalysis: 0,
  activeSignal: null,

  settings: {
    swingLength: 10,
    showMitigated: false,
    showInvalidated: false,
    slBufferPips: 5,
    defaultRiskPercentage: 1,
  },

  setAnalysis: (analysis) =>
    set((state) => ({
      ...state,
      ...analysis,
      lastAnalysis: Date.now(),
    })),

  updateOrderBlock: (id, updates) =>
    set((state) => ({
      orderBlocks: state.orderBlocks.map((ob) =>
        ob.id === id ? { ...ob, ...updates } : ob
      ),
    })),

  updateFVG: (id, updates) =>
    set((state) => ({
      fairValueGaps: state.fairValueGaps.map((fvg) =>
        fvg.id === id ? { ...fvg, ...updates } : fvg
      ),
    })),

  setKillZones: (kzs) =>
    set({
      killZones: kzs,
    }),

  updateSettings: (settings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...settings,
      },
    })),

  setActiveSignal: (signal) =>
    set({ activeSignal: signal }),

  clearAnalysis: () =>
    set({
      trend: null,
      swingPoints: [],
      orderBlocks: [],
      fairValueGaps: [],
      fibonacci: null,
      confluenceZones: [],
      entrySignals: [],
      activeSignal: null,
      lastAnalysis: 0,
    }),
}));
