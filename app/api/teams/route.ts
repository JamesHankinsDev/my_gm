import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// GET /api/teams — get the user's teams (optionally filtered by league)
export async function GET(request: Request) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league_id');

  let query = supabase
    .from('teams')
    .select('*, leagues(name, season)')
    .eq('user_id', user.id);

  if (leagueId) {
    query = query.eq('league_id', leagueId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/teams — join a league by creating a team
export async function POST(request: Request) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { league_id, name } = body;

  if (!league_id || !name) {
    return NextResponse.json({ error: 'league_id and team name are required' }, { status: 400 });
  }

  // Check league exists
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('id')
    .eq('id', league_id)
    .single();

  if (leagueError || !league) {
    return NextResponse.json({ error: 'League not found' }, { status: 404 });
  }

  // Check user doesn't already have a team in this league
  const { data: existing } = await supabase
    .from('teams')
    .select('id')
    .eq('league_id', league_id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'You already have a team in this league' }, { status: 409 });
  }

  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ league_id, user_id: user.id, name })
    .select()
    .single();

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  return NextResponse.json({ data: team }, { status: 201 });
}
