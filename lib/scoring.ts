import type {
  PlayerGameStats,
  ScoringResult,
  Milestones,
  Per36Stats,
  SlotType,
} from '@/types';

// Base scoring weights (Sleeper settings)
export const WEIGHTS = {
  pts: 1.0,
  fg3m: 0.1,
  fgMissed: -0.1,
  ast: 1.0,
  to: -0.25,
  dreb: 1.0,
  oreb: 0.1,
  stl: 1.25,
  blk: 1.25,
  pf: -0.1,
  tf: -0.25,
  ff: -0.5,
  doubleDouble: 1.0,
  tripleDouble: 2.0,
  assists15: 2.0,
  rebounds20: 2.0,
} as const;

// Milestone detection
export const detectMilestones = (stats: PlayerGameStats): Milestones => {
  const totalReb = stats.dreb + stats.oreb;
  const doubleCategories = [
    stats.pts >= 10,
    totalReb >= 10,
    stats.ast >= 10,
    stats.stl >= 10,
    stats.blk >= 10,
  ].filter(Boolean).length;

  return {
    doubleDouble: doubleCategories >= 2 && doubleCategories < 3,
    tripleDouble: doubleCategories >= 3,
    assists15: stats.ast >= 15,
    rebounds20: totalReb >= 20,
  };
};

// Calculate raw score from actual game stats
export const calculateRawScore = (
  stats: PlayerGameStats,
  includeMilestones: boolean
): number => {
  const totalReb = stats.dreb + stats.oreb;

  const scoring = stats.pts * WEIGHTS.pts + stats.fg3m * WEIGHTS.fg3m + stats.fgMissed * WEIGHTS.fgMissed;
  const playmaking = stats.ast * WEIGHTS.ast + stats.to * WEIGHTS.to;
  const defense = stats.stl * WEIGHTS.stl + stats.blk * WEIGHTS.blk;
  const boards = stats.dreb * WEIGHTS.dreb + stats.oreb * WEIGHTS.oreb;
  const penalties = stats.pf * WEIGHTS.pf + stats.tf * WEIGHTS.tf + stats.ff * WEIGHTS.ff;

  let bonuses = 0;
  if (includeMilestones) {
    const milestones = detectMilestones(stats);
    if (milestones.tripleDouble) bonuses += WEIGHTS.tripleDouble;
    else if (milestones.doubleDouble) bonuses += WEIGHTS.doubleDouble;
    if (milestones.assists15) bonuses += WEIGHTS.assists15;
    if (milestones.rebounds20) bonuses += WEIGHTS.rebounds20;
  }

  return scoring + playmaking + defense + boards + penalties + bonuses;
};

// Coaching accuracy bonus
export const coachingBonus = (predicted: number, actual: number): number => {
  if (predicted === 0 && actual === 0) return 2.0;
  if (predicted === 0 && actual > 0) return -3.0;
  if (predicted > 0 && actual === 0) return -2.0;
  const diff = Math.abs(predicted - actual);
  if (diff <= 2) return 2.0;
  if (diff <= 5) return 1.0;
  if (diff <= 10) return 0.0;
  return -1.0;
};

// Simulate stats to a target minute total using per-36 rates
export const simulate = (per36Stats: Per36Stats, targetMinutes: number): PlayerGameStats => {
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

// Tier assignment based on fantasy PPG
export const assignTier = (fantasyPPG: number): number => {
  if (fantasyPPG >= 42) return 5;
  if (fantasyPPG >= 32) return 4;
  if (fantasyPPG >= 22) return 3;
  if (fantasyPPG >= 14) return 2;
  return 1;
};

// Per-36 calculation from per-game averages
export const calcPer36 = (statPerGame: number, minPerGame: number): number =>
  minPerGame > 0 ? (statPerGame / minPerGame) * 36 : 0;

// Score a single player for a given slot
export const scorePlayer = (
  slotType: SlotType,
  stats: PlayerGameStats | null,
  per36Stats: Per36Stats,
  predictedMinutes: number
): ScoringResult => {
  // Bench and IR always score 0
  if (slotType === 'bench' || slotType === 'ir') {
    return {
      rawScore: 0,
      coachingBonus: 0,
      simulationUsed: false,
      breakout: false,
      finalScore: 0,
      breakdown: { scoring: 0, playmaking: 0, defense: 0, boards: 0, bonuses: 0, penalties: 0 },
    };
  }

  // No stats available (DNP)
  if (!stats || stats.min === 0) {
    const bonus = slotType === 'sixth_man' || slotType === 'rotation'
      ? coachingBonus(predictedMinutes, 0)
      : 0;
    return {
      rawScore: 0,
      coachingBonus: bonus,
      simulationUsed: false,
      breakout: false,
      finalScore: bonus,
      breakdown: { scoring: 0, playmaking: 0, defense: 0, boards: 0, bonuses: 0, penalties: 0 },
    };
  }

  const actualMin = stats.min;

  // Starter: always score actual stats with milestones
  if (slotType === 'starter') {
    const raw = calculateRawScore(stats, true);
    return {
      rawScore: raw,
      coachingBonus: 0,
      simulationUsed: false,
      breakout: false,
      finalScore: raw,
      breakdown: breakdownFromStats(stats, true),
    };
  }

  // Sixth Man
  if (slotType === 'sixth_man') {
    const bonus = coachingBonus(predictedMinutes, actualMin);
    if (actualMin < 15) {
      return {
        rawScore: 0, coachingBonus: bonus, simulationUsed: false, breakout: false,
        finalScore: bonus,
        breakdown: { scoring: 0, playmaking: 0, defense: 0, boards: 0, bonuses: 0, penalties: 0 },
      };
    }
    if (actualMin >= 25) {
      const raw = calculateRawScore(stats, true);
      return {
        rawScore: raw, coachingBonus: bonus, simulationUsed: false, breakout: true,
        finalScore: raw + bonus,
        breakdown: breakdownFromStats(stats, true),
      };
    }
    // Simulate to 20 minutes
    const simStats = simulate(per36Stats, 20);
    const raw = calculateRawScore(simStats, false);
    return {
      rawScore: raw, coachingBonus: bonus, simulationUsed: true, breakout: false,
      finalScore: raw + bonus,
      breakdown: breakdownFromStats(simStats, false),
    };
  }

  // Rotation
  if (slotType === 'rotation') {
    const bonus = coachingBonus(predictedMinutes, actualMin);
    if (actualMin < 8) {
      return {
        rawScore: 0, coachingBonus: bonus, simulationUsed: false, breakout: false,
        finalScore: bonus,
        breakdown: { scoring: 0, playmaking: 0, defense: 0, boards: 0, bonuses: 0, penalties: 0 },
      };
    }
    if (actualMin >= 20) {
      const raw = calculateRawScore(stats, true);
      return {
        rawScore: raw, coachingBonus: bonus, simulationUsed: false, breakout: true,
        finalScore: raw + bonus,
        breakdown: breakdownFromStats(stats, true),
      };
    }
    // Simulate to 10 minutes
    const simStats = simulate(per36Stats, 10);
    const raw = calculateRawScore(simStats, false);
    return {
      rawScore: raw, coachingBonus: bonus, simulationUsed: true, breakout: false,
      finalScore: raw + bonus,
      breakdown: breakdownFromStats(simStats, false),
    };
  }

  return {
    rawScore: 0, coachingBonus: 0, simulationUsed: false, breakout: false,
    finalScore: 0,
    breakdown: { scoring: 0, playmaking: 0, defense: 0, boards: 0, bonuses: 0, penalties: 0 },
  };
};

// Helper: build breakdown object from stats
const breakdownFromStats = (stats: PlayerGameStats, includeMilestones: boolean) => {
  const milestones = includeMilestones ? detectMilestones(stats) : null;
  let bonuses = 0;
  if (milestones) {
    if (milestones.tripleDouble) bonuses += WEIGHTS.tripleDouble;
    else if (milestones.doubleDouble) bonuses += WEIGHTS.doubleDouble;
    if (milestones.assists15) bonuses += WEIGHTS.assists15;
    if (milestones.rebounds20) bonuses += WEIGHTS.rebounds20;
  }

  return {
    scoring: stats.pts * WEIGHTS.pts + stats.fg3m * WEIGHTS.fg3m + stats.fgMissed * WEIGHTS.fgMissed,
    playmaking: stats.ast * WEIGHTS.ast + stats.to * WEIGHTS.to,
    defense: stats.stl * WEIGHTS.stl + stats.blk * WEIGHTS.blk,
    boards: stats.dreb * WEIGHTS.dreb + stats.oreb * WEIGHTS.oreb,
    bonuses,
    penalties: stats.pf * WEIGHTS.pf + stats.tf * WEIGHTS.tf + stats.ff * WEIGHTS.ff,
  };
};
