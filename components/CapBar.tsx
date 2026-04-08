'use client';

import { getCapZone } from '@/lib/salary';
import type { CapZone } from '@/types';

interface CapBarProps {
  currentCap: number;
  capLimit?: number;
}

const zoneStyles: Record<CapZone, { bg: string; bar: string; label: string; text: string }> = {
  compliant: { bg: 'bg-emerald-100', bar: 'bg-emerald-500', label: 'Under Cap', text: 'text-emerald-700' },
  tax: { bg: 'bg-gold/20', bar: 'bg-gold', label: 'Luxury Tax', text: 'text-gold-dark' },
  lockout: { bg: 'bg-flame/10', bar: 'bg-flame', label: 'LOCKED OUT', text: 'text-flame' },
};

export default function CapBar({ currentCap, capLimit = 20 }: CapBarProps) {
  const zone = getCapZone(currentCap);
  const style = zoneStyles[zone];
  const pct = Math.min((currentCap / (capLimit * 1.1)) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-bold text-slate-900">
          ${currentCap.toFixed(1)} <span className="text-slate-400 font-normal">/ ${capLimit.toFixed(1)}</span>
        </span>
        <span className={`badge ${style.bg} ${style.text}`}>{style.label}</span>
      </div>
      <div className={`w-full rounded-full h-2.5 ${style.bg}`}>
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
