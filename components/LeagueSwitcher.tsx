'use client';

import { useState, useRef, useEffect } from 'react';
import { useLeague } from '@/lib/league-context';

export default function LeagueSwitcher() {
  const { leagues, activeLeague, setActiveLeagueId, loading } = useLeague();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading || leagues.length === 0) {
    return (
      <a href="/leagues" className="text-sm text-white/50 hover:text-white transition-colors">
        {loading ? '...' : 'Join a League'}
      </a>
    );
  }

  const commissionerLeagues = leagues.filter((l) => l.role === 'commissioner');
  const memberLeagues = leagues.filter((l) => l.role === 'member');

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-white hover:text-gold transition-colors"
      >
        <span className="text-sm font-semibold truncate max-w-[140px] md:max-w-[200px]">
          {activeLeague?.name ?? 'Select League'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
          {commissionerLeagues.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Leagues</span>
              </div>
              {commissionerLeagues.map((l) => (
                <LeagueOption
                  key={l.id}
                  league={l}
                  active={l.id === activeLeague?.id}
                  onSelect={() => { setActiveLeagueId(l.id); setOpen(false); }}
                />
              ))}
            </>
          )}

          {memberLeagues.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined</span>
              </div>
              {memberLeagues.map((l) => (
                <LeagueOption
                  key={l.id}
                  league={l}
                  active={l.id === activeLeague?.id}
                  onSelect={() => { setActiveLeagueId(l.id); setOpen(false); }}
                />
              ))}
            </>
          )}

          <div className="border-t border-slate-100">
            <a href="/leagues" className="block px-3 py-2.5 text-sm text-court font-medium hover:bg-slate-50 transition-colors">
              Manage Leagues
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function LeagueOption({
  league,
  active,
  onSelect,
}: {
  league: { id: string; name: string; role: string; season: number };
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
        active ? 'bg-slate-50' : ''
      }`}
    >
      <div className="min-w-0">
        <p className={`text-sm truncate ${active ? 'font-bold text-court' : 'text-slate-700'}`}>{league.name}</p>
        <p className="text-[10px] text-slate-400">Season {league.season}</p>
      </div>
      <div className="flex items-center gap-1.5 ml-2 shrink-0">
        {league.role === 'commissioner' && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gold/20 text-gold-dark">COMMISH</span>
        )}
        {active && (
          <svg className="w-4 h-4 text-court" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
  );
}
