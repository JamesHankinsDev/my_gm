'use client';

import type { SlotType } from '@/types';

interface RosterSlotProps {
  slotType: SlotType;
  slotPosition: number;
  playerName: string;
  salary: number;
  tier: number;
}

const slotLabels: Record<SlotType, string> = {
  starter: 'Starter',
  sixth_man: '6th Man',
  rotation: 'Rotation',
  bench: 'Bench',
  ir: 'IR',
};

const slotBadgeColors: Record<SlotType, string> = {
  starter: 'bg-blue-600',
  sixth_man: 'bg-purple-600',
  rotation: 'bg-teal-600',
  bench: 'bg-gray-500',
  ir: 'bg-red-700',
};

export default function RosterSlot({ slotType, slotPosition, playerName, salary, tier }: RosterSlotProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-2 py-1 rounded text-white ${slotBadgeColors[slotType]}`}>
          {slotLabels[slotType]} {slotPosition}
        </span>
        <span className="font-medium">{playerName}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Tier {tier}</span>
        <span className="font-bold text-green-700">${salary.toFixed(1)}</span>
      </div>
    </div>
  );
}
