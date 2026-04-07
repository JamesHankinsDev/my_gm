import { NextResponse } from 'next/server';

// POST /api/scoring — trigger scoring for a week
export async function POST(request: Request) {
  const body = await request.json();
  const { league_id, week, season } = body;

  if (!league_id || !week || !season) {
    return NextResponse.json({ error: 'league_id, week, and season are required' }, { status: 400 });
  }

  // TODO: Fetch games, calculate scores, store in scoring_logs
  return NextResponse.json({ message: 'Scoring trigger — not yet implemented', data: { league_id, week, season } });
}

// GET /api/scoring — fetch scoring logs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');
  const week = searchParams.get('week');

  if (!teamId) {
    return NextResponse.json({ error: 'team_id is required' }, { status: 400 });
  }

  // TODO: Fetch scoring_logs from Supabase
  return NextResponse.json({ data: [], message: 'Scoring logs — not yet implemented' });
}
