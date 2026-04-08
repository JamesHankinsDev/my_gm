import { adminDb } from './firebase-admin';
import { getPlayers, getSeasonAverage, calcPer36, parseMinutes } from './balldontlie';
import { assignTier } from './scoring';
import { salaryForTier } from './salary';
import type { BDLSeasonAverage } from '@/types';

const RATE_LIMIT_MS = 600;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const round2 = (n: number) => Math.round(n * 100) / 100;

// Get the current NBA season year (e.g. 2024 for the 2024-25 season)
export const getCurrentSeason = (): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // NBA season starts in October — if before October, use previous year
  return month >= 9 ? year : year - 1;
};

// Ensure we have enough players in Firestore, syncing from BDL if needed.
// Returns the total player count.
export const ensurePlayerPool = async (
  minPlayers: number = 200
): Promise<number> => {
  // Check current count
  const countSnap = await adminDb.collection('players').count().get();
  const currentCount = countSnap.data().count;

  if (currentCount >= minPlayers) {
    return currentCount;
  }

  // Need more players — sync from BallDontLie
  const season = getCurrentSeason();
  const pagesToFetch = Math.ceil((minPlayers - currentCount) / 25) + 2; // extra buffer

  let cursor: number | undefined;

  for (let page = 0; page < pagesToFetch; page++) {
    await delay(RATE_LIMIT_MS);
    const res = await getPlayers(undefined, cursor, 25);
    const players = res.data;
    if (!players || players.length === 0) break;

    for (const player of players) {
      let avg: BDLSeasonAverage | undefined;
      try {
        await delay(RATE_LIMIT_MS);
        const avgRes = await getSeasonAverage(season, player.id);
        avg = avgRes.data?.[0];
      } catch {
        // No stats for this season
      }

      const min = avg ? parseMinutes(avg.min) : 0;
      const gamesPlayed = avg?.games_played ?? 0;
      const per36Pts = avg ? calcPer36(avg.pts, min) : 0;
      const per36Reb = avg ? calcPer36(avg.reb, min) : 0;
      const per36Ast = avg ? calcPer36(avg.ast, min) : 0;
      const per36Stl = avg ? calcPer36(avg.stl, min) : 0;
      const per36Blk = avg ? calcPer36(avg.blk, min) : 0;
      const per36To = avg ? calcPer36(avg.turnover, min) : 0;
      const per36Fg3m = avg ? calcPer36(avg.fg3m, min) : 0;
      const per36Fgmiss = avg ? calcPer36(avg.fga - avg.fgm, min) : 0;

      const fantasyPPG = per36Pts + per36Ast + per36Stl * 1.25 + per36Blk * 1.25 +
        per36Fg3m * 0.1 + per36Fgmiss * -0.1 + per36To * -0.25 +
        (avg ? calcPer36(avg.dreb, min) : 0) + (avg ? calcPer36(avg.oreb, min) * 0.1 : 0);

      const tier = gamesPlayed >= 20 ? assignTier(fantasyPPG) : 1;
      const salary = salaryForTier(tier);
      const fullName = `${player.first_name} ${player.last_name}`.trim();
      if (!fullName) continue;

      await adminDb.collection('players').doc(String(player.id)).set({
        balldontlie_id: player.id,
        full_name: fullName,
        position: player.position || '',
        tier, salary,
        is_rookie: false,
        games_played: gamesPlayed,
        per36_pts: round2(per36Pts), per36_reb: round2(per36Reb),
        per36_ast: round2(per36Ast), per36_stl: round2(per36Stl),
        per36_blk: round2(per36Blk), per36_to: round2(per36To),
        per36_fg3m: round2(per36Fg3m), per36_fgmiss: round2(per36Fgmiss),
      }, { merge: true });
    }

    cursor = res.meta.next_cursor ?? undefined;
    if (!cursor) break;
  }

  const newCount = await adminDb.collection('players').count().get();
  return newCount.data().count;
};
