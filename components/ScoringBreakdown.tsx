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
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-sm text-slate-900 truncate">{playerName}</span>
          {simulationUsed && <span className="badge bg-gold/20 text-gold-dark">SIM</span>}
          {breakout && <span className="badge bg-emerald-100 text-emerald-700">BREAKOUT</span>}
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span className="text-lg font-black text-court">{finalScore.toFixed(1)}</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Scoring', value: breakdown.scoring },
              { label: 'Playmaking', value: breakdown.playmaking },
              { label: 'Defense', value: breakdown.defense },
              { label: 'Boards', value: breakdown.boards },
              { label: 'Bonuses', value: breakdown.bonuses },
              { label: 'Penalties', value: breakdown.penalties },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-400">{item.label}</div>
                <div className={`text-xs font-bold ${item.value >= 0 ? 'text-slate-800' : 'text-flame'}`}>
                  {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Raw: {rawScore.toFixed(1)}</span>
            <span className={coachingBonus >= 0 ? 'text-emerald-600' : 'text-flame'}>
              Coach: {coachingBonus > 0 ? '+' : ''}{coachingBonus.toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
