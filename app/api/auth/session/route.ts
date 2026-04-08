import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

// POST /api/auth/session — create a session cookie from Firebase ID token
export async function POST(request: Request) {
  const body = await request.json();
  const { idToken } = body;

  if (!idToken) {
    return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
  }

  try {
    // Verify the ID token
    const decoded = await adminAuth.verifyIdToken(idToken);
    console.log('[session] Verified token for:', decoded.email ?? decoded.uid);

    // Create a session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[session] Error:', message);
    return NextResponse.json(
      { error: `Session creation failed: ${message}` },
      { status: 401 }
    );
  }
}

// DELETE /api/auth/session — sign out (clear session cookie)
export async function DELETE() {
  cookies().delete('session');
  return NextResponse.json({ status: 'ok' });
}
