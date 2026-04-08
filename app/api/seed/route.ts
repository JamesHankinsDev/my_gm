import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';
import { FieldValue } from 'firebase-admin/firestore';
import { DEFAULT_LEAGUE_SETTINGS } from '@/types';
import crypto from 'crypto';

// POST /api/seed — create a mock league with fake teams (dev only)
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized — sign in first' }, { status: 401 });
  }

  const invite_code = crypto.randomBytes(4).toString('hex');

  // Create mock league
  const leagueRef = await adminDb.collection('leagues').add({
    name: 'Mock Dynasty League',
    commissioner_id: user.uid,
    season: 2025,
    cap_limit: 20,
    invite_code,
    settings: { ...DEFAULT_LEAGUE_SETTINGS, max_teams: 12 },
    created_at: FieldValue.serverTimestamp(),
  });

  // Create commissioner's team
  await adminDb.collection('teams').add({
    league_id: leagueRef.id,
    user_id: user.uid,
    name: 'My GM Squad',
    created_at: FieldValue.serverTimestamp(),
  });

  // Create fake opponent teams
  const fakeTeams = [
    'Brooklyn Ballers',
    'LA Lob City',
    'Chicago Wind',
    'Houston Rockets Redux',
    'Miami Heatwave',
    'Denver Altitude',
    'Phoenix Rising',
    'Boston Greens',
    'Milwaukee Bucks Stop Here',
    'Dallas Mavericks 2.0',
    'Golden State Dubs',
  ];

  for (const name of fakeTeams) {
    await adminDb.collection('teams').add({
      league_id: leagueRef.id,
      user_id: `fake-${crypto.randomBytes(4).toString('hex')}`,
      name,
      created_at: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.json({
    message: `Created mock league with 12 teams`,
    league_id: leagueRef.id,
    invite_code,
  }, { status: 201 });
}
