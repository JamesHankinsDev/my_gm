import { adminDb } from './firebase-admin';
import { getPlayers, getSeasonAverage, calcPer36, parseMinutes } from './balldontlie';
import { assignTier } from './scoring';
import { salaryForTier } from './salary';
import type { BDLPlayer, BDLSeasonAverage } from '@/types';

const BATCH_SIZE = 25; // BallDontLie max per_page for season_averages
const RATE_LIMIT_DELAY_MS = 1200; // Pause between API calls to avoid 429s

interface SyncResult {
  synced: number;
  skipped: number;
  errors: string[];
}

// Calculate fantasy PPG from season averages for tier assignment
const calcFantasyPPG = (avg: BDLSeasonAverage): number => {
  const min = parseMinutes(avg.min);
  if (min === 0) return 0;

  const per36Pts = calcPer36(avg.pts, min);
  const per36Ast = calcPer36(avg.ast, min);
  const per36Stl = calcPer36(avg.stl, min);
  const per36Blk = calcPer36(avg.blk, min);
  const per36To = calcPer36(avg.turnover, min);
  const per36Dreb = calcPer36(avg.dreb, min);
  const per36Oreb = calcPer36(avg.oreb, min);
  const per36Fg3m = calcPer36(avg.fg3m, min);
  const per36Fgmiss = calcPer36(avg.fga - avg.fgm, min);

  return (
    per36Pts * 1.0 +
    per36Fg3m * 0.1 +
    per36Fgmiss * -0.1 +
    per36Ast * 1.0 +
    per36To * -0.25 +
    per36Dreb * 1.0 +
    per36Oreb * 0.1 +
    per36Stl * 1.25 +
    per36Blk * 1.25
  );
};

// Sync NBA players and their season averages into Firestore
// Set maxPages to limit how many pages to fetch (0 = all)
export const syncPlayers = async (season: number = 2024, maxPages: number = 0): Promise<SyncResult> => {
  const result: SyncResult = { synced: 0, skipped: 0, errors: [] };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let cursor: number | undefined;
  let hasMore = true;
  let page = 0;

  while (hasMore) {
    page++;
    if (maxPages > 0 && page > maxPages) break;

    // Fetch a page of players (with rate limit pause)
    await delay(RATE_LIMIT_DELAY_MS);
    const playersRes = await getPlayers(undefined, cursor, BATCH_SIZE);
    const players = playersRes.data;

    if (!players || players.length === 0) {
      hasMore = false;
      break;
    }

    // Upsert each player (fetch season averages individually)
    for (const player of players) {
      let avg: BDLSeasonAverage | undefined;
      try {
        await delay(RATE_LIMIT_DELAY_MS);
        const avgRes = await getSeasonAverage(season, player.id);
        avg = avgRes.data?.[0];
      } catch {
        // Player may not have stats for this season — skip averages
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
      const per36Fgmiss = avg ? calcPer36((avg.fga - avg.fgm), min) : 0;

      const fantasyPPG = avg ? calcFantasyPPG(avg) : 0;
      const tier = gamesPlayed >= 20 ? assignTier(fantasyPPG) : 1;
      const salary = salaryForTier(tier);

      const fullName = `${player.first_name} ${player.last_name}`.trim();
      if (!fullName) {
        result.skipped++;
        continue;
      }

      try {
        // Use balldontlie_id as the document ID for upsert behavior
        const docRef = adminDb.collection('players').doc(String(player.id));
        await docRef.set(
          {
            balldontlie_id: player.id,
            full_name: fullName,
            position: player.position || '',
            tier,
            salary,
            is_rookie: false,
            games_played: gamesPlayed,
            per36_pts: round2(per36Pts),
            per36_reb: round2(per36Reb),
            per36_ast: round2(per36Ast),
            per36_stl: round2(per36Stl),
            per36_blk: round2(per36Blk),
            per36_to: round2(per36To),
            per36_fg3m: round2(per36Fg3m),
            per36_fgmiss: round2(per36Fgmiss),
          },
          { merge: true }
        );
        result.synced++;
      } catch (err) {
        result.errors.push(`Failed to upsert ${fullName}: ${err}`);
      }
    }

    cursor = playersRes.meta.next_cursor ?? undefined;
    hasMore = playersRes.meta.next_cursor !== null;
  }

  return result;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;
