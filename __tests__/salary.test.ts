import {
  applySeasonEndAdjustment,
  calcActiveCap,
  getCapZone,
  applyCapPenalty,
  validateTradeSalary,
  salaryForTier,
} from '../lib/salary';
import type { RosterSlot } from '../types';

const makeSlot = (overrides: Partial<RosterSlot> = {}): RosterSlot => ({
  id: '1',
  team_id: 't1',
  player_id: 'p1',
  season: 2025,
  slot_type: 'starter',
  slot_position: 1,
  acquired_via: 'free_agent',
  draft_ceiling_active: false,
  contract_salary: 2.5,
  retained_seasons: 1,
  ...overrides,
});

describe('applySeasonEndAdjustment', () => {
  it('increases salary when tier rises', () => {
    expect(applySeasonEndAdjustment(2.0, 2, 3, 'free_agent')).toBe(2.5);
  });

  it('decreases salary when tier drops', () => {
    expect(applySeasonEndAdjustment(3.0, 4, 3, 'free_agent')).toBe(2.5);
  });

  it('keeps salary the same when tier unchanged', () => {
    expect(applySeasonEndAdjustment(3.0, 3, 3, 'free_agent')).toBe(3.0);
  });

  it('caps drafted players at $4', () => {
    expect(applySeasonEndAdjustment(4.0, 4, 5, 'draft')).toBe(4.0);
  });

  it('does not go below $1', () => {
    expect(applySeasonEndAdjustment(1.0, 2, 1, 'free_agent')).toBe(1.0);
  });

  it('does not exceed $5', () => {
    expect(applySeasonEndAdjustment(5.0, 4, 5, 'free_agent')).toBe(5.0);
  });
});

describe('calcActiveCap', () => {
  it('sums only active slot salaries', () => {
    const slots = [
      makeSlot({ slot_type: 'starter', contract_salary: 3.0 }),
      makeSlot({ slot_type: 'sixth_man', contract_salary: 2.5 }),
      makeSlot({ slot_type: 'rotation', contract_salary: 1.5 }),
      makeSlot({ slot_type: 'bench', contract_salary: 2.0 }),
      makeSlot({ slot_type: 'ir', contract_salary: 4.0 }),
    ];
    expect(calcActiveCap(slots)).toBeCloseTo(9.0);
  });

  it('excludes IR from cap', () => {
    const slots = [
      makeSlot({ slot_type: 'ir', contract_salary: 5.0 }),
    ];
    expect(calcActiveCap(slots)).toBe(0);
  });
});

describe('getCapZone', () => {
  it('returns compliant at or below $20', () => {
    expect(getCapZone(20)).toBe('compliant');
    expect(getCapZone(15)).toBe('compliant');
  });

  it('returns tax between $20-$22', () => {
    expect(getCapZone(21)).toBe('tax');
    expect(getCapZone(22)).toBe('tax');
  });

  it('returns lockout above $22', () => {
    expect(getCapZone(23)).toBe('lockout');
  });
});

describe('applyCapPenalty', () => {
  it('returns full score when compliant', () => {
    expect(applyCapPenalty(100, 18)).toBe(100);
  });

  it('applies 5% per dollar over cap in tax zone', () => {
    // $21 = 1 over, 5% penalty
    expect(applyCapPenalty(100, 21)).toBeCloseTo(95);
    // $22 = 2 over, 10% penalty
    expect(applyCapPenalty(100, 22)).toBeCloseTo(90);
  });

  it('returns 0 in lockout zone', () => {
    expect(applyCapPenalty(100, 23)).toBe(0);
  });
});

describe('validateTradeSalary', () => {
  it('allows equal salary trades', () => {
    expect(validateTradeSalary(3.0, 3.0)).toBe(true);
  });

  it('allows within 125% + $0.50', () => {
    // incoming=2.0 → outgoing limit = 2.0*1.25 + 0.5 = 3.0
    expect(validateTradeSalary(3.0, 2.0)).toBe(true);
  });

  it('rejects when outgoing exceeds limit', () => {
    expect(validateTradeSalary(5.0, 2.0)).toBe(false);
  });
});

describe('salaryForTier', () => {
  it('returns correct salary for each tier', () => {
    expect(salaryForTier(1)).toBe(1.0);
    expect(salaryForTier(2)).toBe(2.0);
    expect(salaryForTier(3)).toBe(3.0);
    expect(salaryForTier(4)).toBe(4.0);
    expect(salaryForTier(5)).toBe(5.0);
  });

  it('defaults to $1 for unknown tier', () => {
    expect(salaryForTier(0)).toBe(1.0);
    expect(salaryForTier(6)).toBe(1.0);
  });
});
