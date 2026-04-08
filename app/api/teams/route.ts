import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/teams — get the user's teams (optionally filtered by league)
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league_id');

  let query: FirebaseFirestore.Query = adminDb
    .collection('teams')
    .where('user_id', '==', user.uid);

  if (leagueId) {
    query = query.where('league_id', '==', leagueId);
  }

  const snap = await query.get();
  const teams = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ data: teams });
}

// POST /api/teams — join a league by creating a team
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { league_id, name } = body;

  if (!league_id || !name) {
    return NextResponse.json({ error: 'league_id and team name are required' }, { status: 400 });
  }

  // Check league exists
  const leagueDoc = await adminDb.collection('leagues').doc(league_id).get();
  if (!leagueDoc.exists) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  // Check user doesn't already have a team in this league
  const existing = await adminDb
    .collection('teams')
    .where('league_id', '==', league_id)
    .where('user_id', '==', user.uid)
    .limit(1)
    .get();

  if (!existing.empty) {
    return NextResponse.json({ error: 'You already have a team in this league' }, { status: 409 });
  }

  // Create team
  const teamRef = await adminDb.collection('teams').add({
    league_id,
    user_id: user.uid,
    name,
    created_at: FieldValue.serverTimestamp(),
  });

  const teamDoc = await teamRef.get();

  return NextResponse.json(
    { data: { id: teamRef.id, ...teamDoc.data() } },
    { status: 201 }
  );
}
