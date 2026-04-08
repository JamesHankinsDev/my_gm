'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { League } from '@/types';

interface LeagueWithRole extends League {
  role: 'commissioner' | 'member';
}

interface LeagueContextValue {
  leagues: LeagueWithRole[];
  activeLeague: LeagueWithRole | null;
  setActiveLeagueId: (id: string) => void;
  loading: boolean;
  refresh: () => void;
}

const LeagueContext = createContext<LeagueContextValue>({
  leagues: [],
  activeLeague: null,
  setActiveLeagueId: () => {},
  loading: true,
  refresh: () => {},
});

export const useLeague = () => useContext(LeagueContext);

const STORAGE_KEY = 'hoops_gm_active_league';

export function LeagueProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [leagues, setLeagues] = useState<LeagueWithRole[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeagues = useCallback(async () => {
    try {
      const res = await fetch('/api/leagues');
      const json = await res.json();
      const raw: League[] = json.data ?? [];

      const withRoles: LeagueWithRole[] = raw.map((l) => ({
        ...l,
        role: l.commissioner_id === userId ? 'commissioner' : 'member',
      }));

      setLeagues(withRoles);

      // Restore or pick first league
      const stored = localStorage.getItem(STORAGE_KEY);
      const valid = withRoles.find((l) => l.id === stored);
      if (valid) {
        setActiveId(valid.id);
      } else if (withRoles.length > 0) {
        setActiveId(withRoles[0].id);
        localStorage.setItem(STORAGE_KEY, withRoles[0].id);
      }
    } catch {
      // ignore fetch errors
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const setActiveLeagueId = (id: string) => {
    setActiveId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const activeLeague = leagues.find((l) => l.id === activeId) ?? null;

  return (
    <LeagueContext.Provider value={{ leagues, activeLeague, setActiveLeagueId, loading, refresh: fetchLeagues }}>
      {children}
    </LeagueContext.Provider>
  );
}
