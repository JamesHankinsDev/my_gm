import {
  calculateRawScore,
  detectMilestones,
  coachingBonus,
  assignTier,
  calcPer36,
  scorePlayer,
  simulate,
} from '../lib/scoring';
import type { PlayerGameStats, Per36Stats } from '../types';

const makeStats = (overrides: Partial<PlayerGameStats> = {}): PlayerGameStats => ({
  pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0,
  fg3m: 0, fgMissed: 0, pf: 0, tf: 0, ff: 0,
  min: 30, dreb: 0, oreb: 0,
  ...overrides,
});

const makePer36 = (overrides: Partial<Per36Stats> = {}): Per36Stats => ({
  pts: 20, reb: 8, ast: 5, stl: 1.5, blk: 1, to: 2, fg3m: 2, fgmiss: 5,
  ...overrides,
});

describe('detectMilestones', () => {
  it('detects a double-double', () => {
    const stats = makeStats({ pts: 20, dreb: 8, oreb: 3, ast: 5 });
    const m = detectMilestones(stats);
    expect(m.doubleDouble).toBe(true);
    expect(m.tripleDouble).toBe(false);
  });

  it('detects a triple-double', () => {
    const stats = makeStats({ pts: 15, dreb: 7, oreb: 4, ast: 12 });
    const m = detectMilestones(stats);
    expect(m.doubleDouble).toBe(false);
    expect(m.tripleDouble).toBe(true);
  });

  it('detects 15+ assists bonus', () => {
    const stats = makeStats({ ast: 16 });
    expect(detectMilestones(stats).assists15).toBe(true);
  });

  it('detects 20+ rebounds bonus', () => {
    const stats = makeStats({ dreb: 14, oreb: 7 });
    expect(detectMilestones(stats).rebounds20).toBe(true);
  });

  it('returns no milestones for low stats', () => {
    const m = detectMilestones(makeStats({ pts: 5, ast: 3 }));
    expect(m.doubleDouble).toBe(false);
    expect(m.tripleDouble).toBe(false);
    expect(m.assists15).toBe(false);
    expect(m.rebounds20).toBe(false);
  });
});

describe('calculateRawScore', () => {
  it('scores points correctly', () => {
    const stats = makeStats({ pts: 30, fg3m: 5, fgMissed: 10 });
    const score = calculateRawScore(stats, false);
    // 30*1.0 + 5*0.1 + 10*(-0.1) = 30 + 0.5 - 1.0 = 29.5
    expect(score).toBeCloseTo(29.5);
  });

  it('includes milestones when requested', () => {
    const stats = makeStats({ pts: 25, dreb: 8, oreb: 3, ast: 12 });
    const withMilestones = calculateRawScore(stats, true);
    const withoutMilestones = calculateRawScore(stats, false);
    // Triple-double (2.0) should be added
    expect(withMilestones).toBeGreaterThan(withoutMilestones);
    expect(withMilestones - withoutMilestones).toBeCloseTo(2.0);
  });

  it('applies defensive weights', () => {
    const stats = makeStats({ stl: 3, blk: 2 });
    const score = calculateRawScore(stats, false);
    // 3*1.25 + 2*1.25 = 6.25
    expect(score).toBeCloseTo(6.25);
  });

  it('applies penalty weights', () => {
    const stats = makeStats({ pf: 5, tf: 1, ff: 1 });
    const score = calculateRawScore(stats, false);
    // 5*(-0.1) + 1*(-0.25) + 1*(-0.5) = -0.5 -0.25 -0.5 = -1.25
    expect(score).toBeCloseTo(-1.25);
  });
});

describe('coachingBonus', () => {
  it('returns +2 for correct DNP call', () => {
    expect(coachingBonus(0, 0)).toBe(2.0);
  });

  it('returns -3 for wrong DNP call (predicted 0, played)', () => {
    expect(coachingBonus(0, 20)).toBe(-3.0);
  });

  it('returns -2 for predicted play but DNP', () => {
    expect(coachingBonus(20, 0)).toBe(-2.0);
  });

  it('returns +2 for within 2 minutes', () => {
    expect(coachingBonus(25, 24)).toBe(2.0);
  });

  it('returns +1 for within 5 minutes', () => {
    expect(coachingBonus(25, 21)).toBe(1.0);
  });

  it('returns 0 for within 10 minutes', () => {
    expect(coachingBonus(25, 16)).toBe(0.0);
  });

  it('returns -1 for over 10 minutes off', () => {
    expect(coachingBonus(25, 10)).toBe(-1.0);
  });
});

describe('assignTier', () => {
  it('assigns tier 5 for 42+ PPG', () => expect(assignTier(45)).toBe(5));
  it('assigns tier 4 for 32-41 PPG', () => expect(assignTier(35)).toBe(4));
  it('assigns tier 3 for 22-31 PPG', () => expect(assignTier(25)).toBe(3));
  it('assigns tier 2 for 14-21 PPG', () => expect(assignTier(18)).toBe(2));
  it('assigns tier 1 for <14 PPG', () => expect(assignTier(10)).toBe(1));
});

describe('calcPer36', () => {
  it('calculates per-36 correctly', () => {
    expect(calcPer36(20, 30)).toBeCloseTo(24);
  });
  it('returns 0 for 0 minutes', () => {
    expect(calcPer36(20, 0)).toBe(0);
  });
});

describe('scorePlayer', () => {
  it('returns 0 for bench slot', () => {
    const result = scorePlayer('bench', makeStats({ pts: 30 }), makePer36(), 0);
    expect(result.finalScore).toBe(0);
  });

  it('returns 0 for IR slot', () => {
    const result = scorePlayer('ir', makeStats({ pts: 30 }), makePer36(), 0);
    expect(result.finalScore).toBe(0);
  });

  it('scores starter with actual stats', () => {
    const stats = makeStats({ pts: 25, fg3m: 3, fgMissed: 8, ast: 7, dreb: 5, stl: 2, blk: 1, to: 3 });
    const result = scorePlayer('starter', stats, makePer36(), 0);
    expect(result.rawScore).toBeGreaterThan(0);
    expect(result.simulationUsed).toBe(false);
    expect(result.coachingBonus).toBe(0);
  });

  it('sixth man below floor returns 0 raw score', () => {
    const stats = makeStats({ pts: 10, min: 12 });
    const result = scorePlayer('sixth_man', stats, makePer36(), 15);
    expect(result.rawScore).toBe(0);
  });

  it('sixth man breakout uses actual stats', () => {
    const stats = makeStats({ pts: 20, min: 28, fg3m: 2, dreb: 5, ast: 4, stl: 1, blk: 1 });
    const result = scorePlayer('sixth_man', stats, makePer36(), 20);
    expect(result.breakout).toBe(true);
    expect(result.simulationUsed).toBe(false);
  });

  it('sixth man in range simulates to 20 minutes', () => {
    const stats = makeStats({ pts: 10, min: 18 });
    const result = scorePlayer('sixth_man', stats, makePer36(), 18);
    expect(result.simulationUsed).toBe(true);
    expect(result.breakout).toBe(false);
  });

  it('rotation below floor returns 0 raw score', () => {
    const stats = makeStats({ pts: 5, min: 6 });
    const result = scorePlayer('rotation', stats, makePer36(), 10);
    expect(result.rawScore).toBe(0);
  });

  it('rotation breakout uses actual stats', () => {
    const stats = makeStats({ pts: 15, min: 22, fg3m: 1, dreb: 3, ast: 2, stl: 1 });
    const result = scorePlayer('rotation', stats, makePer36(), 15);
    expect(result.breakout).toBe(true);
    expect(result.simulationUsed).toBe(false);
  });

  it('handles DNP for sixth_man with coaching penalty', () => {
    const result = scorePlayer('sixth_man', null, makePer36(), 15);
    expect(result.rawScore).toBe(0);
    expect(result.coachingBonus).toBe(-2.0);
  });
});

describe('simulate', () => {
  it('scales per-36 stats to target minutes', () => {
    const per36 = makePer36({ pts: 36, ast: 18 });
    const simulated = simulate(per36, 18);
    expect(simulated.pts).toBeCloseTo(18);
    expect(simulated.ast).toBeCloseTo(9);
    expect(simulated.min).toBe(18);
  });
});
