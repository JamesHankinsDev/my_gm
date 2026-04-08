import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-helpers';

// GET /api/auth/me — return the current user's UID
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ uid: user.uid, email: user.email });
}
