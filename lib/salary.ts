import type { RosterSlot, CapZone, AcquiredVia } from '@/types';

const DRAFT_CEILING = 4.0;
const SALARY_MIN = 1.0;
const SALARY_MAX = 5.0;
const CAP_LIMIT = 20;
const TAX_LIMIT = 22;
const ADJUSTMENT_STEP = 0.5;

// Season-end salary adjustment based on tier movement
export const applySeasonEndAdjustment = (
  currentSalary: number,
  currentTier: number,
  newTier: number,
  acquiredVia: AcquiredVia
): number => {
  let newSalary = currentSalary;

  if (newTier > currentTier) newSalary += ADJUSTMENT_STEP;
  else if (newTier < currentTier) newSalary -= ADJUSTMENT_STEP;

  // Drafted player ceiling
  if (acquiredVia === 'draft' && newSalary > DRAFT_CEILING) {
    newSalary = DRAFT_CEILING;
  }

  return Math.max(SALARY_MIN, Math.min(SALARY_MAX, newSalary));
};

// Calculate total active cap (starters + sixth man + rotation + bench)
export const calcActiveCap = (rosterSlots: RosterSlot[]): number => {
  const activeSlotTypes = ['starter', 'sixth_man', 'rotation', 'bench'];
  return rosterSlots
    .filter((s) => activeSlotTypes.includes(s.slot_type))
    .reduce((sum, s) => sum + s.contract_salary, 0);
};

// Determine cap zone
export const getCapZone = (cap: number): CapZone => {
  if (cap <= CAP_LIMIT) return 'compliant';
  if (cap <= TAX_LIMIT) return 'tax';
  return 'lockout';
};

// Apply cap penalty to raw team score
export const applyCapPenalty = (rawScore: number, cap: number): number => {
  const zone = getCapZone(cap);
  if (zone === 'lockout') return 0;
  if (zone === 'tax') {
    const over = cap - CAP_LIMIT;
    const pct = over * 0.05;
    return rawScore * (1 - pct);
  }
  return rawScore;
};

// Validate salary matching for trades (each side within 125% + $0.50)
export const validateTradeSalary = (
  outgoing: number,
  incoming: number
): boolean => {
  return outgoing <= incoming * 1.25 + 0.5;
};

// Initial salary for a tier
export const salaryForTier = (tier: number): number => {
  const tierSalaries: Record<number, number> = {
    1: 1.0,
    2: 2.0,
    3: 3.0,
    4: 4.0,
    5: 5.0,
  };
  return tierSalaries[tier] ?? 1.0;
};
