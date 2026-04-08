import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';

// Verify session cookie in API routes. Returns user UID or null.
export const getSessionUser = async (): Promise<{ uid: string; email: string | undefined } | null> => {
  const session = cookies().get('session')?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
};
