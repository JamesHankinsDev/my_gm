'use client';

import type { SlotType } from '@/types';

interface RosterSlotProps {
  slotType: SlotType;
  slotPosition: number;
  playerName: string;
  salary: number;
  tier: number;
}

const slotConfig: Record<SlotType, { label: string; bg: string; text: string }> = {
  starter: { label: 'START', bg: 'bg-court', text: 'text-white' },
  sixth_man: { label: '6TH', bg: 'bg-flame', text: 'text-white' },
  rotation: { label: 'ROT', bg: 'bg-court-light', text: 'text-white' },
  bench: { label: 'BNC', bg: 'bg-slate-300', text: 'text-slate-700' },
  ir: { label: 'IR', bg: 'bg-slate-800', text: 'text-white' },
};

const tierColors: Record<number, string> = {
  1: 'text-slate-400',
  2: 'text-emerald-500',
  3: 'text-blue-500',
  4: 'text-purple-500',
  5: 'text-gold-dark',
};

export default function RosterSlot({ slotType, slotPosition, playerName, salary, tier }: RosterSlotProps) {
  const config = slotConfig[slotType];

  return (
    <div className="card flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.bg}`}>
        <span className={`text-xs font-black ${config.text}`}>{config.label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-900 truncate">{playerName}</p>
        <p className={`text-xs font-semibold ${tierColors[tier] ?? tierColors[1]}`}>Tier {tier}</p>
      </div>
      <div className="text-right">
        <span className="text-sm font-black text-slate-900">${salary.toFixed(1)}</span>
      </div>
    </div>
  );
}
