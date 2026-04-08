import type { DraftPick } from '@/types';

// Generate snake draft order for N rounds
// Round 1: [0,1,2,...,n-1], Round 2: [n-1,...,2,1,0], etc.
export const generateSnakePicks = (
  teamIds: string[],
  rounds: number
): DraftPick[] => {
  const picks: DraftPick[] = [];
  let overall = 1;

  for (let round = 1; round <= rounds; round++) {
    const order = round % 2 === 1 ? [...teamIds] : [...teamIds].reverse();
    for (let i = 0; i < order.length; i++) {
      picks.push({
        overall,
        round,
        pick_in_round: i + 1,
        team_id: order[i],
        player_id: null,
      });
      overall++;
    }
  }

  return picks;
};

// Shuffle array (Fisher-Yates) for randomizing draft order
export const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Simple mock draft auto-pick: pick the best available player by tier then per36_pts
export const selectBestAvailable = (
  availablePlayers: { id: string; full_name: string; tier: number; per36_pts: number }[],
  _teamId: string
): { id: string; full_name: string } | null => {
  if (availablePlayers.length === 0) return null;

  // Sort by tier desc, then per36_pts desc
  const sorted = [...availablePlayers].sort((a, b) => {
    if (b.tier !== a.tier) return b.tier - a.tier;
    return b.per36_pts - a.per36_pts;
  });

  return { id: sorted[0].id, full_name: sorted[0].full_name };
};
