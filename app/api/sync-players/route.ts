import { NextResponse } from 'next/server';
import { syncPlayers } from '@/lib/sync-players';
import { getCurrentSeason } from '@/lib/player-pool';

// POST /api/sync-players — trigger a full player sync from BallDontLie
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const season = body.season ?? getCurrentSeason();
  const maxPages = body.maxPages ?? 0;

  try {
    const result = await syncPlayers(season, maxPages);
    return NextResponse.json({
      message: `Synced ${result.synced} players, skipped ${result.skipped}`,
      ...result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Sync failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
