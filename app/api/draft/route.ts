import { NextResponse } from 'next/server';

// GET /api/draft — fetch draft board for a league
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league_id');

  if (!leagueId) {
    return NextResponse.json({ error: 'league_id is required' }, { status: 400 });
  }

  // TODO: Fetch draft picks + lottery results from Supabase
  return NextResponse.json({ data: [], message: 'Draft board — not yet implemented' });
}

// POST /api/draft — make a draft pick
export async function POST(request: Request) {
  const body = await request.json();
  const { league_id, team_id, player_id, pick_id } = body;

  if (!league_id || !team_id || !player_id || !pick_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // TODO: Validate pick order, assign player to team, update draft_picks
  return NextResponse.json({ message: 'Draft pick — not yet implemented' });
}
