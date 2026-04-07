import { NextResponse } from 'next/server';

// GET /api/roster — fetch roster for a team
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');

  if (!teamId) {
    return NextResponse.json({ error: 'team_id is required' }, { status: 400 });
  }

  // TODO: Fetch roster slots from Supabase
  return NextResponse.json({ data: [], message: 'Roster endpoint — not yet implemented' });
}

// POST /api/roster — update roster slot assignments
export async function POST(request: Request) {
  const body = await request.json();
  const { team_id, player_id, slot_type, slot_position } = body;

  if (!team_id || !player_id || !slot_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // TODO: Validate cap, update roster_slots in Supabase
  return NextResponse.json({ message: 'Roster update — not yet implemented', data: { team_id, player_id, slot_type, slot_position } });
}
