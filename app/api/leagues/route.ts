import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

// GET /api/leagues — list leagues the user belongs to
export async function GET() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get leagues where the user has a team
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('league_id')
    .eq('user_id', user.id);

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  const leagueIds = teams?.map((t) => t.league_id) ?? [];

  // Also include leagues the user is commissioner of
  const { data: leagues, error } = await supabase
    .from('leagues')
    .select('*')
    .or(`commissioner_id.eq.${user.id}${leagueIds.length > 0 ? `,id.in.(${leagueIds.join(',')})` : ''}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: leagues });
}

// POST /api/leagues — create a new league
export async function POST(request: Request) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, season } = body;

  if (!name) {
    return NextResponse.json({ error: 'League name is required' }, { status: 400 });
  }

  // Create the league
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert({
      name,
      commissioner_id: user.id,
      season: season ?? 2025,
    })
    .select()
    .single();

  if (leagueError) {
    return NextResponse.json({ error: leagueError.message }, { status: 500 });
  }

  // Auto-create a team for the commissioner
  const { error: teamError } = await supabase
    .from('teams')
    .insert({
      league_id: league.id,
      user_id: user.id,
      name: `${name} - Team 1`,
    });

  if (teamError) {
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  return NextResponse.json({ data: league }, { status: 201 });
}
