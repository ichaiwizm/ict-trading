import { useAlertStore, useICTStore, useMarketStore } from '@/stores';
import type { ConfluenceZone, KillZone, EntrySignal } from '@/lib/ict/types';

type AlertType = 'setup' | 'price' | 'killzone' | 'entry' | 'info';
type Priority = 'high' | 'medium' | 'low';

interface AlertConfig {
  confluenceProximity: number; // Pips to trigger "price approaching" alert
  enableKillZoneAlerts: boolean;
  enableSetupAlerts: boolean;
  enableEntryAlerts: boolean;
}

const DEFAULT_CONFIG: AlertConfig = {
  confluenceProximity: 20,
  enableKillZoneAlerts: true,
  enableSetupAlerts: true,
  enableEntryAlerts: true,
};

class AlertEngine {
  private config: AlertConfig = DEFAULT_CONFIG;
  private lastKillZoneAlert: string | null = null;
  private alertedZones: Set<string> = new Set();
  private alertedSignals: Set<string> = new Set();

  setConfig(config: Partial<AlertConfig>) {
    this.config = { ...this.config, ...config };
  }

  checkKillZoneAlerts(killZones: KillZone[]) {
    if (!this.config.enableKillZoneAlerts) return;

    const activeZone = killZones.find((kz) => kz.isActive);

    if (activeZone && this.lastKillZoneAlert !== activeZone.name) {
      this.lastKillZoneAlert = activeZone.name;
      this.createAlert(
        'killzone',
        `${this.formatKillZoneName(activeZone.name)} Active`,
        `Trading session is now active. High volatility expected.`,
        'medium'
      );
    } else if (!activeZone) {
      this.lastKillZoneAlert = null;
    }
  }

  checkConfluenceAlerts(
    confluenceZones: ConfluenceZone[],
    currentPrice: number,
    symbol: string
  ) {
    if (!this.config.enableSetupAlerts) return;

    const pipMultiplier = symbol.includes('JPY') ? 0.01 : 0.0001;
    const proximityPips = this.config.confluenceProximity;

    for (const zone of confluenceZones) {
      if (this.alertedZones.has(zone.id)) continue;

      const distanceToTop = Math.abs(currentPrice - zone.overlapTop);
      const distanceToBottom = Math.abs(currentPrice - zone.overlapBottom);
      const minDistance = Math.min(distanceToTop, distanceToBottom);
      const distanceInPips = minDistance / pipMultiplier;

      if (distanceInPips <= proximityPips) {
        this.alertedZones.add(zone.id);
        this.createAlert(
          'setup',
          `Confluence Zone Approaching`,
          `Price is ${distanceInPips.toFixed(1)} pips from confluence zone at ${zone.overlapTop.toFixed(5)}`,
          zone.strength >= 70 ? 'high' : 'medium'
        );
      }
    }
  }

  checkEntrySignals(entrySignals: EntrySignal[]) {
    if (!this.config.enableEntryAlerts) return;

    for (const signal of entrySignals) {
      if (this.alertedSignals.has(signal.id)) continue;

      this.alertedSignals.add(signal.id);
      this.createAlert(
        'entry',
        `Entry Signal: ${signal.direction.toUpperCase()}`,
        `Sweep & Shift detected. Entry: ${signal.suggestedEntry.toFixed(5)}, SL: ${signal.suggestedSL.toFixed(5)}, R:R: ${signal.riskRewardRatio.toFixed(1)}`,
        signal.confidence >= 70 ? 'high' : 'medium'
      );
    }
  }

  private createAlert(
    type: AlertType,
    title: string,
    message: string,
    priority: Priority
  ) {
    const { addAlert } = useAlertStore.getState();
    addAlert({ type, title, message, priority });
  }

  private formatKillZoneName(name: string): string {
    const names: Record<string, string> = {
      london: 'London Session',
      new_york_am: 'New York AM',
      new_york_pm: 'New York PM',
      asian: 'Asian Session',
    };
    return names[name] || name;
  }

  clearAlertedZones() {
    this.alertedZones.clear();
  }

  clearAlertedSignals() {
    this.alertedSignals.clear();
  }
}

export const alertEngine = new AlertEngine();
