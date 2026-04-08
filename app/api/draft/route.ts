import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';
import { FieldValue } from 'firebase-admin/firestore';
import { generateSnakePicks, shuffle } from '@/lib/draft';
import { ensurePlayerPool } from '@/lib/player-pool';
import type { DraftMode } from '@/types';

// GET /api/draft?league_id=xxx — get active draft for a league
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league_id');
  if (!leagueId) return NextResponse.json({ error: 'league_id required' }, { status: 400 });

  // Find drafts for this league (no composite index needed)
  const snap = await adminDb
    .collection('draft_sessions')
    .where('league_id', '==', leagueId)
    .get();

  if (snap.empty) {
    return NextResponse.json({ data: null });
  }

  // Pick the most recent by created_at (client-side sort)
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  docs.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
    const aTime = (a.created_at as { seconds?: number })?.seconds ?? 0;
    const bTime = (b.created_at as { seconds?: number })?.seconds ?? 0;
    return bTime - aTime;
  });

  return NextResponse.json({ data: docs[0] });
}

// POST /api/draft — create a new draft session
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { league_id, mode, rounds } = body as {
    league_id: string;
    mode: DraftMode;
    rounds?: number;
  };

  if (!league_id || !mode) {
    return NextResponse.json({ error: 'league_id and mode are required' }, { status: 400 });
  }

  // Verify league exists and user is commissioner
  const leagueDoc = await adminDb.collection('leagues').doc(league_id).get();
  if (!leagueDoc.exists) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }
  if (leagueDoc.data()?.commissioner_id !== user.uid) {
    return NextResponse.json({ error: 'Only the commissioner can start a draft' }, { status: 403 });
  }

  // Get all teams in the league
  const teamsSnap = await adminDb
    .collection('teams')
    .where('league_id', '==', league_id)
    .get();

  const teamIds = teamsSnap.docs.map((d) => d.id);
  if (teamIds.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 teams to draft' }, { status: 400 });
  }

  // Ensure we have enough players synced from BallDontLie
  const totalRounds = rounds ?? 10;
  const picksNeeded = teamIds.length * totalRounds;
  try {
    await ensurePlayerPool(picksNeeded + 50); // buffer for choice variety
  } catch (err) {
    console.error('[draft] Player pool sync warning:', err);
    // Continue anyway — use whatever players are available
  }

  // Randomize draft order
  const pickOrder = shuffle(teamIds);
  const picks = generateSnakePicks(pickOrder, totalRounds);

  const draftRef = await adminDb.collection('draft_sessions').add({
    league_id,
    mode,
    status: 'in_progress',
    rounds: totalRounds,
    current_pick: 1,
    pick_order: pickOrder,
    picks,
    created_at: FieldValue.serverTimestamp(),
  });

  const draftDoc = await draftRef.get();
  return NextResponse.json(
    { data: { id: draftRef.id, ...draftDoc.data() } },
    { status: 201 }
  );
}
