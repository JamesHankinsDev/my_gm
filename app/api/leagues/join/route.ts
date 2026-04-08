import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/leagues/join?code=xxx — look up league by invite code (public info only)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
  }

  const snap = await adminDb
    .collection('leagues')
    .where('invite_code', '==', code)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
  }

  const doc = snap.docs[0];
  const data = doc.data();

  // Count current teams
  const teamsSnap = await adminDb
    .collection('teams')
    .where('league_id', '==', doc.id)
    .get();

  return NextResponse.json({
    data: {
      id: doc.id,
      name: data.name,
      season: data.season,
      team_count: teamsSnap.size,
      max_teams: data.settings?.max_teams ?? 10,
    },
  });
}

// POST /api/leagues/join — join a league via invite code
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { code, team_name } = body;

  if (!code || !team_name) {
    return NextResponse.json({ error: 'Invite code and team name are required' }, { status: 400 });
  }

  // Find league by invite code
  const snap = await adminDb
    .collection('leagues')
    .where('invite_code', '==', code)
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
  }

  const leagueDoc = snap.docs[0];
  const leagueData = leagueDoc.data();
  const leagueId = leagueDoc.id;

  // Check if user already has a team
  const existing = await adminDb
    .collection('teams')
    .where('league_id', '==', leagueId)
    .where('user_id', '==', user.uid)
    .limit(1)
    .get();

  if (!existing.empty) {
    return NextResponse.json({ error: 'You already have a team in this league' }, { status: 409 });
  }

  // Check if league is full
  const teamsSnap = await adminDb
    .collection('teams')
    .where('league_id', '==', leagueId)
    .get();

  const maxTeams = leagueData.settings?.max_teams ?? 10;
  if (teamsSnap.size >= maxTeams) {
    return NextResponse.json({ error: 'This league is full' }, { status: 409 });
  }

  // Create team
  const teamRef = await adminDb.collection('teams').add({
    league_id: leagueId,
    user_id: user.uid,
    name: team_name,
    created_at: FieldValue.serverTimestamp(),
  });

  const teamDoc = await teamRef.get();

  return NextResponse.json(
    { data: { team: { id: teamRef.id, ...teamDoc.data() }, league_id: leagueId } },
    { status: 201 }
  );
}
