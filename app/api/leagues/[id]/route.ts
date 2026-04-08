import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-helpers';

// GET /api/leagues/[id] — get league details + members
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leagueDoc = await adminDb.collection('leagues').doc(params.id).get();
  if (!leagueDoc.exists) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  const league = { id: leagueDoc.id, ...leagueDoc.data() };

  // Get all teams in this league
  const teamsSnap = await adminDb
    .collection('teams')
    .where('league_id', '==', params.id)
    .get();

  const teams = teamsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const isCommissioner = leagueDoc.data()?.commissioner_id === user.uid;

  return NextResponse.json({ data: { league, teams, isCommissioner } });
}

// PATCH /api/leagues/[id] — update league settings (commissioner only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leagueDoc = await adminDb.collection('leagues').doc(params.id).get();
  if (!leagueDoc.exists) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  if (leagueDoc.data()?.commissioner_id !== user.uid) {
    return NextResponse.json({ error: 'Only the commissioner can update league settings' }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields = ['name', 'season', 'settings'];
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (field === 'settings') {
        // Merge settings rather than replace
        const currentSettings = leagueDoc.data()?.settings ?? {};
        updates.settings = { ...currentSettings, ...body.settings };
        // Keep cap_limit in sync
        if (body.settings.cap_limit !== undefined) {
          updates.cap_limit = body.settings.cap_limit;
        }
      } else {
        updates[field] = body[field];
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  await adminDb.collection('leagues').doc(params.id).update(updates);

  const updated = await adminDb.collection('leagues').doc(params.id).get();
  return NextResponse.json({ data: { id: updated.id, ...updated.data() } });
}
