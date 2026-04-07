import type { Per36Stats, PlayerGameStats } from '@/types';

// Simulate projected stats at a target minute total using per-36 rates
export const simulateToMinutes = (
  per36Stats: Per36Stats,
  targetMinutes: number
): PlayerGameStats => {
  const ratio = targetMinutes / 36;
  return {
    pts: per36Stats.pts * ratio,
    reb: per36Stats.reb * ratio,
    ast: per36Stats.ast * ratio,
    stl: per36Stats.stl * ratio,
    blk: per36Stats.blk * ratio,
    to: per36Stats.to * ratio,
    fg3m: per36Stats.fg3m * ratio,
    fgMissed: per36Stats.fgmiss * ratio,
    pf: 0,
    tf: 0,
    ff: 0,
    min: targetMinutes,
    dreb: 0,
    oreb: 0,
  };
};

// Minimum games required for per-36 eligibility
export const PER36_MIN_GAMES = 20;

// Check if a player qualifies for per-36 simulation
export const isEligibleForSimulation = (gamesPlayed: number): boolean =>
  gamesPlayed >= PER36_MIN_GAMES;

// Slot simulation targets (in minutes)
export const SIMULATION_TARGETS = {
  sixth_man: 20,
  rotation: 10,
} as const;

// Slot minute floors (below this = 0 points)
export const MINUTE_FLOORS = {
  sixth_man: 15,
  rotation: 8,
} as const;

// Breakout thresholds (at or above = use actual stats with milestones)
export const BREAKOUT_THRESHOLDS = {
  sixth_man: 25,
  rotation: 20,
} as const;
