'use client';

import { getCapZone } from '@/lib/salary';
import type { CapZone } from '@/types';

interface CapBarProps {
  currentCap: number;
  capLimit?: number;
}

const zoneColors: Record<CapZone, string> = {
  compliant: 'bg-green-500',
  tax: 'bg-amber-500',
  lockout: 'bg-red-500',
};

const zoneLabels: Record<CapZone, string> = {
  compliant: 'Under Cap',
  tax: 'Luxury Tax',
  lockout: 'Hard Cap — Locked Out',
};

export default function CapBar({ currentCap, capLimit = 20 }: CapBarProps) {
  const zone = getCapZone(currentCap);
  const pct = Math.min((currentCap / (capLimit * 1.1)) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">${currentCap.toFixed(1)} / ${capLimit.toFixed(1)}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${zoneColors[zone]} text-white`}>
          {zoneLabels[zone]}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${zoneColors[zone]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
