'use client';

import { useEffect, useState } from 'react';
import { LeagueProvider } from '@/lib/league-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (r) => {
        if (!r.ok) return null;
        const text = await r.text();
        if (!text) return null;
        try { return JSON.parse(text); } catch { return null; }
      })
      .then((data) => {
        if (data?.uid) setUserId(data.uid);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // No user = not logged in (login/signup pages handle themselves)
  if (loading || !userId) {
    return <>{children}</>;
  }

  return (
    <LeagueProvider userId={userId}>
      {children}
    </LeagueProvider>
  );
}
