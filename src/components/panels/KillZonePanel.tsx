"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KillZone, KillZoneName } from "@/lib/ict/types";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useICTStore } from "@/stores";

const ZONE_LABELS: Record<KillZoneName, string> = {
  london: "London",
  new_york_am: "NY AM",
  new_york_pm: "NY PM",
  asian: "Asian",
};

// Default kill zones for demo
const DEFAULT_KILL_ZONES: KillZone[] = [
  { name: 'london', startUTC: '07:00', endUTC: '10:00', isActive: false, volatilityExpected: 'high' },
  { name: 'new_york_am', startUTC: '12:00', endUTC: '15:00', isActive: false, volatilityExpected: 'high' },
  { name: 'new_york_pm', startUTC: '18:30', endUTC: '21:00', isActive: false, volatilityExpected: 'medium' },
  { name: 'asian', startUTC: '00:00', endUTC: '03:00', isActive: false, volatilityExpected: 'low' },
];

export function KillZonePanel() {
  const storeKillZones = useICTStore((state) => state.killZones);
  const killZones = storeKillZones.length > 0 ? storeKillZones : DEFAULT_KILL_ZONES;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTimeUntilZone = (startUTC: string): number => {
    const [hours, minutes] = startUTC.split(":").map(Number);
    const now = new Date();
    const zoneStart = new Date(now);
    zoneStart.setUTCHours(hours, minutes, 0, 0);

    if (zoneStart < now) {
      zoneStart.setDate(zoneStart.getDate() + 1);
    }

    const diff = zoneStart.getTime() - now.getTime();
    return Math.floor(diff / (1000 * 60));
  };

  const getZoneProgress = (zone: KillZone): number => {
    if (!zone.isActive) return 0;

    const [startHours, startMinutes] = zone.startUTC.split(":").map(Number);
    const [endHours, endMinutes] = zone.endUTC.split(":").map(Number);

    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(startHours, startMinutes, 0, 0);
    const end = new Date(now);
    end.setUTCHours(endHours, endMinutes, 0, 0);

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const renderZone = (zone: KillZone) => {
    const progress = getZoneProgress(zone);
    const timeInfo = zone.isActive
      ? `${zone.timeRemaining || 0}m remaining`
      : `in ${getTimeUntilZone(zone.startUTC)}m`;

    return (
      <div
        key={zone.name}
        className={`p-3 rounded-lg border transition-all duration-300 ${
          zone.isActive
            ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            : "bg-white/5 border-white/10"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {zone.isActive && (
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
            <span className={`font-mono text-sm font-semibold ${zone.isActive ? "text-emerald-400" : "text-gray-400"}`}>
              {ZONE_LABELS[zone.name]}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${
              zone.volatilityExpected === "high"
                ? "border-red-500/30 text-red-400"
                : zone.volatilityExpected === "medium"
                ? "border-amber-500/30 text-amber-400"
                : "border-gray-500/30 text-gray-400"
            }`}
          >
            {zone.volatilityExpected.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Clock className="w-3 h-3" />
          <span className="font-mono">{timeInfo}</span>
        </div>

        {zone.isActive && (
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-[#0a0a0f]/95 border-white/10 shadow-xl backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold tracking-wider text-purple-400">
          KILL ZONES
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {killZones.map(renderZone)}
      </CardContent>
    </Card>
  );
}
