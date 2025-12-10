import type {
  OrderBlock,
  FairValueGap,
  FibonacciZone,
  ConfluenceZone,
} from '@/lib/ict/types';
import { isPriceInOptimalZone } from './fibonacci';

/**
 * Finds confluence zones where Order Blocks and FVGs overlap
 */
export function findConfluenceZones(
  orderBlocks: OrderBlock[],
  fvgs: FairValueGap[],
  fibonacci?: FibonacciZone
): ConfluenceZone[] {
  const confluenceZones: ConfluenceZone[] = [];

  // Check each Order Block against each FVG for overlap
  for (const ob of orderBlocks) {
    for (const fvg of fvgs) {
      // Only consider same-direction confluences
      if (ob.type !== fvg.type) {
        continue;
      }

      const overlap = calculateOverlap(
        ob.top,
        ob.bottom,
        fvg.top,
        fvg.bottom
      );

      if (overlap.hasOverlap) {
        const midpoint = (overlap.overlapTop + overlap.overlapBottom) / 2;
        const inOptimalZone = fibonacci
          ? isPriceInOptimalZone(
              midpoint,
              fibonacci,
              ob.type === 'bullish' ? 'long' : 'short'
            )
          : false;

        const strength = calculateConfluenceStrength(
          ob,
          fvg,
          overlap.overlapPercentage,
          inOptimalZone
        );

        confluenceZones.push({
          id: `confluence-${ob.id}-${fvg.id}`,
          orderBlock: ob,
          fairValueGap: fvg,
          type: ob.type === 'bullish' ? 'bullish' : 'bearish',
          overlapTop: overlap.overlapTop,
          overlapBottom: overlap.overlapBottom,
          inOptimalZone,
          strength,
        });
      }
    }
  }

  // Sort by strength (strongest first)
  return confluenceZones.sort((a, b) => b.strength - a.strength);
}

interface OverlapResult {
  hasOverlap: boolean;
  overlapTop: number;
  overlapBottom: number;
  overlapPercentage: number;
}

function calculateOverlap(
  top1: number,
  bottom1: number,
  top2: number,
  bottom2: number
): OverlapResult {
  const overlapTop = Math.min(top1, top2);
  const overlapBottom = Math.max(bottom1, bottom2);

  if (overlapBottom >= overlapTop) {
    return {
      hasOverlap: false,
      overlapTop: 0,
      overlapBottom: 0,
      overlapPercentage: 0,
    };
  }

  const overlapSize = overlapTop - overlapBottom;
  const zone1Size = top1 - bottom1;
  const zone2Size = top2 - bottom2;
  const avgSize = (zone1Size + zone2Size) / 2;

  const overlapPercentage = (overlapSize / avgSize) * 100;

  return {
    hasOverlap: true,
    overlapTop,
    overlapBottom,
    overlapPercentage,
  };
}

function calculateConfluenceStrength(
  ob: OrderBlock,
  fvg: FairValueGap,
  overlapPercentage: number,
  inOptimalZone: boolean
): number {
  let strength = 0;

  // Factor 1: Overlap percentage (0-40 points)
  strength += Math.min(overlapPercentage, 40);

  // Factor 2: Order Block strength (0-25 points)
  strength += (ob.strength / 100) * 25;

  // Factor 3: FVG fill status (0-15 points)
  if (fvg.status === 'unfilled') {
    strength += 15;
  } else if (fvg.status === 'partially_filled') {
    strength += 7;
  }

  // Factor 4: Optimal zone bonus (0-20 points)
  if (inOptimalZone) {
    strength += 20;
  }

  return Math.min(strength, 100);
}
