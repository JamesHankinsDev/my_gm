import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';
import { selectBestAvailable } from '@/lib/draft';
import type { DraftPick, DraftSession } from '@/types';

// GET /api/draft/[id] — get draft session state
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await adminDb.collection('draft_sessions').doc(params.id).get();
  if (!doc.exists) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  // Get team names for display
  const data = doc.data() as Omit<DraftSession, 'id'>;
  const teamsSnap = await adminDb
    .collection('teams')
    .where('league_id', '==', data.league_id)
    .get();
  const teamMap: Record<string, string> = {};
  teamsSnap.docs.forEach((d) => { teamMap[d.id] = d.data().name; });

  // Find user's team in this league
  const userTeam = teamsSnap.docs.find((d) => d.data().user_id === user.uid);

  return NextResponse.json({
    data: { id: doc.id, ...data },
    teamMap,
    userTeamId: userTeam?.id ?? null,
  });
}

// POST /api/draft/[id] — make a pick
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { player_id, player_name } = body;

  const draftRef = adminDb.collection('draft_sessions').doc(params.id);
  const draftDoc = await draftRef.get();
  if (!draftDoc.exists) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const draft = draftDoc.data() as Omit<DraftSession, 'id'>;
  if (draft.status !== 'in_progress') {
    return NextResponse.json({ error: 'Draft is not in progress' }, { status: 400 });
  }

  // Find current pick
  const currentPick = draft.picks.find((p: DraftPick) => p.overall === draft.current_pick);
  if (!currentPick) {
    return NextResponse.json({ error: 'No more picks' }, { status: 400 });
  }

  // Verify it's the user's turn (for live drafts)
  if (draft.mode === 'live') {
    const teamsSnap = await adminDb
      .collection('teams')
      .where('league_id', '==', draft.league_id)
      .get();
    const userTeam = teamsSnap.docs.find((d) => d.data().user_id === user.uid);
    if (!userTeam || userTeam.id !== currentPick.team_id) {
      return NextResponse.json({ error: "It's not your turn" }, { status: 403 });
    }
  }

  if (!player_id) {
    return NextResponse.json({ error: 'player_id is required' }, { status: 400 });
  }

  // Check player not already drafted
  const alreadyDrafted = draft.picks.some(
    (p: DraftPick) => p.player_id === player_id
  );
  if (alreadyDrafted) {
    return NextResponse.json({ error: 'Player already drafted' }, { status: 409 });
  }

  // Make the pick
  const updatedPicks = draft.picks.map((p: DraftPick) =>
    p.overall === draft.current_pick
      ? { ...p, player_id, player_name: player_name ?? '', auto_picked: false }
      : p
  );

  const nextPick = draft.current_pick + 1;
  const totalPicks = draft.picks.length;
  const isComplete = nextPick > totalPicks;

  await draftRef.update({
    picks: updatedPicks,
    current_pick: nextPick,
    status: isComplete ? 'completed' : 'in_progress',
  });

  const updated = await draftRef.get();
  return NextResponse.json({ data: { id: updated.id, ...updated.data() } });
}

// PATCH /api/draft/[id] — mock draft auto-pick (run remaining picks for AI teams)
export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const draftRef = adminDb.collection('draft_sessions').doc(params.id);
  const draftDoc = await draftRef.get();
  if (!draftDoc.exists) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const draft = draftDoc.data() as Omit<DraftSession, 'id'>;
  if (draft.status !== 'in_progress') {
    return NextResponse.json({ error: 'Draft is not in progress' }, { status: 400 });
  }

  // Find user's team
  const teamsSnap = await adminDb
    .collection('teams')
    .where('league_id', '==', draft.league_id)
    .get();
  const userTeam = teamsSnap.docs.find((d) => d.data().user_id === user.uid);
  const userTeamId = userTeam?.id;

  // Load all players for auto-picking
  const playersSnap = await adminDb
    .collection('players')
    .orderBy('per36_pts', 'desc')
    .limit(300)
    .get();

  const allPlayers = playersSnap.docs.map((d) => ({
    id: d.id,
    full_name: d.data().full_name as string,
    tier: d.data().tier as number,
    per36_pts: d.data().per36_pts as number,
  }));

  // Auto-pick until it's the user's turn or draft is complete
  let picks = [...draft.picks];
  let currentPick = draft.current_pick;

  while (currentPick <= picks.length) {
    const pick = picks.find((p) => p.overall === currentPick);
    if (!pick) break;

    // Stop if it's the user's turn (they pick manually)
    if (pick.team_id === userTeamId) break;

    // Get already-drafted player IDs
    const draftedIds = new Set(picks.filter((p) => p.player_id).map((p) => p.player_id));
    const available = allPlayers.filter((p) => !draftedIds.has(p.id));

    const selection = selectBestAvailable(available, pick.team_id);
    if (!selection) break;

    picks = picks.map((p) =>
      p.overall === currentPick
        ? { ...p, player_id: selection.id, player_name: selection.full_name, auto_picked: true }
        : p
    );
    currentPick++;
  }

  const isComplete = currentPick > picks.length;

  await draftRef.update({
    picks,
    current_pick: currentPick,
    status: isComplete ? 'completed' : 'in_progress',
  });

  const updated = await draftRef.get();
  return NextResponse.json({ data: { id: updated.id, ...updated.data() } });
}
