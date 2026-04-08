'use client';

import { useEffect, useState } from 'react';
import { LeagueProvider } from '@/lib/league-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
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
