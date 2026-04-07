'use client';

import { useState } from 'react';
import type { ScoringBreakdown as ScoringBreakdownType } from '@/types';

interface ScoringBreakdownProps {
  playerName: string;
  finalScore: number;
  rawScore: number;
  coachingBonus: number;
  simulationUsed: boolean;
  breakout: boolean;
  breakdown: ScoringBreakdownType;
}

export default function ScoringBreakdown({
  playerName, finalScore, rawScore, coachingBonus, simulationUsed, breakout, breakdown,
}: ScoringBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{playerName}</span>
          {simulationUsed && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">SIM</span>
          )}
          {breakout && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">BREAKOUT</span>
          )}
        </div>
        <span className="font-bold text-lg">{finalScore.toFixed(1)}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t">
          <div className="grid grid-cols-3 gap-2 text-sm mt-2">
            <div>Scoring: {breakdown.scoring.toFixed(1)}</div>
            <div>Playmaking: {breakdown.playmaking.toFixed(1)}</div>
            <div>Defense: {breakdown.defense.toFixed(1)}</div>
            <div>Boards: {breakdown.boards.toFixed(1)}</div>
            <div>Bonuses: {breakdown.bonuses.toFixed(1)}</div>
            <div>Penalties: {breakdown.penalties.toFixed(1)}</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Raw: {rawScore.toFixed(1)} | Coaching: {coachingBonus > 0 ? '+' : ''}{coachingBonus.toFixed(1)}
          </div>
        </div>
      )}
    </div>
  );
}
