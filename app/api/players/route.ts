import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/players — list players from Firestore
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);
  const search = searchParams.get('search')?.toLowerCase();

  let query: FirebaseFirestore.Query = adminDb
    .collection('players')
    .orderBy('per36_pts', 'desc')
    .limit(limit);

  const snap = await query.get();

  let players = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Client-side name filter (Firestore doesn't support case-insensitive search)
  if (search) {
    players = players.filter((p: Record<string, unknown>) =>
      (p.full_name as string).toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ data: players });
}
