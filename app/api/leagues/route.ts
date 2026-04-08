import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';
import { FieldValue } from 'firebase-admin/firestore';
import { DEFAULT_LEAGUE_SETTINGS } from '@/types';
import crypto from 'crypto';

const generateInviteCode = () => crypto.randomBytes(4).toString('hex'); // 8 char hex

// GET /api/leagues — list leagues the user belongs to
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamsSnap = await adminDb
    .collection('teams')
    .where('user_id', '==', user.uid)
    .get();

  const leagueIds = new Set<string>();
  teamsSnap.docs.forEach((doc) => leagueIds.add(doc.data().league_id));

  const commissionerSnap = await adminDb
    .collection('leagues')
    .where('commissioner_id', '==', user.uid)
    .get();

  commissionerSnap.docs.forEach((doc) => leagueIds.add(doc.id));

  if (leagueIds.size === 0) {
    return NextResponse.json({ data: [] });
  }

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
  const { name, season, team_name } = body;

  if (!name) {
    return NextResponse.json({ error: 'League name is required' }, { status: 400 });
  }

  const invite_code = generateInviteCode();

  const leagueRef = await adminDb.collection('leagues').add({
    name,
    commissioner_id: user.uid,
    season: season ?? 2025,
    cap_limit: DEFAULT_LEAGUE_SETTINGS.cap_limit,
    invite_code,
    settings: { ...DEFAULT_LEAGUE_SETTINGS },
    created_at: FieldValue.serverTimestamp(),
  });

  await adminDb.collection('teams').add({
    league_id: leagueRef.id,
    user_id: user.uid,
    name: team_name || `${name} - Team 1`,
    created_at: FieldValue.serverTimestamp(),
  });

  const leagueDoc = await leagueRef.get();

  return NextResponse.json(
    { data: { id: leagueRef.id, ...leagueDoc.data() } },
    { status: 201 }
  );
}
