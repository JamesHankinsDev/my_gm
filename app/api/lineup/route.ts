import { NextResponse } from 'next/server';

// GET /api/lineup — fetch weekly lineup for a team
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');
  const week = searchParams.get('week');

  if (!teamId) {
    return NextResponse.json({ error: 'team_id is required' }, { status: 400 });
  }

  // TODO: Fetch weekly_lineups from Supabase
  return NextResponse.json({ data: [], message: 'Lineup — not yet implemented' });
}

// POST /api/lineup — save weekly lineup (coaching decisions)
export async function POST(request: Request) {
  const body = await request.json();
  const { team_id, week, season, slots } = body;

  if (!team_id || !week || !season || !slots) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // TODO: Validate lineup, save weekly_lineups to Supabase
  return NextResponse.json({ message: 'Lineup saved — not yet implemented' });
}
