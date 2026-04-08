import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/leagues — list leagues the user belongs to
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get leagues where user has a team
  const teamsSnap = await adminDb
    .collection('teams')
    .where('user_id', '==', user.uid)
    .get();

  const leagueIds = new Set<string>();
  teamsSnap.docs.forEach((doc) => leagueIds.add(doc.data().league_id));

  // Also get leagues where user is commissioner
  const commissionerSnap = await adminDb
    .collection('leagues')
    .where('commissioner_id', '==', user.uid)
    .get();

  commissionerSnap.docs.forEach((doc) => leagueIds.add(doc.id));

  if (leagueIds.size === 0) {
    return NextResponse.json({ data: [] });
  }

  // Fetch all relevant leagues
  const leagueRefs = Array.from(leagueIds).map((id) =>
    adminDb.collection('leagues').doc(id)
  );
  const leagueDocs = await adminDb.getAll(...leagueRefs);

  const leagues = leagueDocs
    .filter((doc) => doc.exists)
    .map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ data: leagues });
}

// POST /api/leagues — create a new league
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, season } = body;

  if (!name) {
    return NextResponse.json({ error: 'League name is required' }, { status: 400 });
  }

  // Create the league
  const leagueRef = await adminDb.collection('leagues').add({
    name,
    commissioner_id: user.uid,
    season: season ?? 2025,
    cap_limit: 20,
    created_at: FieldValue.serverTimestamp(),
  });

  // Auto-create a team for the commissioner
  await adminDb.collection('teams').add({
    league_id: leagueRef.id,
    user_id: user.uid,
    name: `${name} - Team 1`,
    created_at: FieldValue.serverTimestamp(),
  });

  const leagueDoc = await leagueRef.get();

  return NextResponse.json(
    { data: { id: leagueRef.id, ...leagueDoc.data() } },
    { status: 201 }
  );
}
