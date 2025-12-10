'use client';

import { ISeriesApi, Time } from 'lightweight-charts';
import { OrderBlock, FairValueGap, ConfluenceZone } from '@/lib/ict/types';

interface ZoneStyle {
  color: string;
  opacity: number;
  borderColor?: string;
  borderWidth?: number;
}

const ZONE_STYLES = {
  orderBlock: {
    bullish: { color: '#8b5cf6', opacity: 0.15, borderColor: '#8b5cf6', borderWidth: 1 },
    bearish: { color: '#8b5cf6', opacity: 0.15, borderColor: '#8b5cf6', borderWidth: 1 },
  },
  fvg: {
    bullish: { color: '#f59e0b', opacity: 0.12, borderColor: '#f59e0b', borderWidth: 1 },
    bearish: { color: '#f59e0b', opacity: 0.12, borderColor: '#f59e0b', borderWidth: 1 },
  },
  confluence: {
    bullish: { color: '#fbbf24', opacity: 0.2, borderColor: '#fbbf24', borderWidth: 2 },
    bearish: { color: '#fbbf24', opacity: 0.2, borderColor: '#fbbf24', borderWidth: 2 },
  },
};

export class ZoneRenderer {
  private series: ISeriesApi<'Candlestick'>;
  private zones: Map<string, any> = new Map();

  constructor(series: ISeriesApi<'Candlestick'>) {
    this.series = series;
  }

  drawOrderBlock(orderBlock: OrderBlock) {
    const style = ZONE_STYLES.orderBlock[orderBlock.type];

    // Create rectangle shape data
    const zoneId = `ob-${orderBlock.id}`;
    const zoneData = {
      id: zoneId,
      type: 'orderBlock',
      top: orderBlock.top,
      bottom: orderBlock.bottom,
      startTime: orderBlock.startTime,
      style,
      status: orderBlock.status,
    };

    this.zones.set(zoneId, zoneData);
    return zoneId;
  }

  drawFairValueGap(fvg: FairValueGap) {
    const style = ZONE_STYLES.fvg[fvg.type];

    const zoneId = `fvg-${fvg.id}`;
    const zoneData = {
      id: zoneId,
      type: 'fvg',
      top: fvg.top,
      bottom: fvg.bottom,
      startTime: fvg.startTime,
      style,
      status: fvg.status,
    };

    this.zones.set(zoneId, zoneData);
    return zoneId;
  }

  drawConfluenceZone(confluence: ConfluenceZone) {
    const style = ZONE_STYLES.confluence[confluence.type];

    const zoneId = `conf-${confluence.id}`;
    const zoneData = {
      id: zoneId,
      type: 'confluence',
      top: confluence.overlapTop,
      bottom: confluence.overlapBottom,
      startTime: confluence.orderBlock?.startTime || confluence.fairValueGap?.startTime || 0,
      style: {
        ...style,
        // Add glow effect for confluence zones
        shadowColor: '#fbbf24',
        shadowBlur: 15,
      },
      inOptimalZone: confluence.inOptimalZone,
    };

    this.zones.set(zoneId, zoneData);
    return zoneId;
  }

  removeZone(zoneId: string) {
    this.zones.delete(zoneId);
  }

  clearAllZones() {
    this.zones.clear();
  }

  getAllZones() {
    return Array.from(this.zones.values());
  }

  // Render zones as price lines with backgrounds (simplified approach)
  renderZoneAsLines(zoneId: string) {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    // In a real implementation, you would use custom series primitives
    // For now, we return the zone data for external rendering
    return zone;
  }
}

// Helper function to create a zone renderer instance
export function createZoneRenderer(series: ISeriesApi<'Candlestick'>) {
  return new ZoneRenderer(series);
}

export default ZoneRenderer;
