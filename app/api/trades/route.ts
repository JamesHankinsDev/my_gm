import { NextResponse } from 'next/server';

// GET /api/trades — fetch trades for a league
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league_id');

  if (!leagueId) {
    return NextResponse.json({ error: 'league_id is required' }, { status: 400 });
  }

  // TODO: Fetch trades + trade_assets from Supabase
  return NextResponse.json({ data: [], message: 'Trade hub — not yet implemented' });
}

// POST /api/trades — propose a trade
export async function POST(request: Request) {
  const body = await request.json();
  const { league_id, proposed_by_team_id, assets } = body;

  if (!league_id || !proposed_by_team_id || !assets) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // TODO: Validate salary matching, create trade + trade_assets in Supabase
  return NextResponse.json({ message: 'Trade proposal — not yet implemented' });
}
