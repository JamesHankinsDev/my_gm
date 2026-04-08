'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useLeague } from '@/lib/league-context';
import type { DraftSession, DraftPick } from '@/types';

interface PlayerOption {
  id: string;
  full_name: string;
  position: string;
  tier: number;
  salary: number;
  per36_pts: number;
  per36_reb: number;
  per36_ast: number;
}

export default function DraftPage() {
  const { activeLeague } = useLeague();
  const router = useRouter();
  const [draft, setDraft] = useState<DraftSession | null>(null);
  const [teamMap, setTeamMap] = useState<Record<string, string>>({});
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [creating, setCreating] = useState(false);

  const leagueId = activeLeague?.id;
  const isCommissioner = activeLeague?.role === 'commissioner';

  // Fetch draft state
  const fetchDraft = useCallback(async () => {
    if (!leagueId) return;
    const res = await fetch(`/api/draft?league_id=${leagueId}`);
    const json = await res.json();
    if (json.data) {
      // We have a draft — fetch full details
      const detailRes = await fetch(`/api/draft/${json.data.id}`);
      const detailJson = await detailRes.json();
      setDraft(detailJson.data);
      setTeamMap(detailJson.teamMap ?? {});
      setUserTeamId(detailJson.userTeamId);
    } else {
      setDraft(null);
    }
    setLoading(false);
  }, [leagueId]);

  // Fetch available players
  const fetchPlayers = useCallback(async () => {
    if (!leagueId) return;
    const res = await fetch('/api/players?limit=300');
    if (res.ok) {
      const json = await res.json();
      setPlayers(json.data ?? []);
    }
  }, [leagueId]);

  useEffect(() => { fetchDraft(); fetchPlayers(); }, [fetchDraft, fetchPlayers]);

  // Poll for live draft updates
  useEffect(() => {
    if (!draft || draft.status !== 'in_progress' || draft.mode !== 'live') return;
    const interval = setInterval(fetchDraft, 3000);
    return () => clearInterval(interval);
  }, [draft, fetchDraft]);

  const createDraft = async (mode: 'mock' | 'live') => {
    if (!leagueId) return;
    setCreating(true);
    const res = await fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ league_id: leagueId, mode, rounds: 10 }),
    });
    const json = await res.json();
    setCreating(false);
    if (res.ok) {
      fetchDraft();
      fetchPlayers();
    } else {
      alert(json.error);
    }
  };

  const makePick = async (playerId: string, playerName: string) => {
    if (!draft || picking) return;
    setPicking(true);
    await fetch(`/api/draft/${draft.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, player_name: playerName }),
    });
    await fetchDraft();
    setPicking(false);
  };

  const runAutoPicks = async () => {
    if (!draft) return;
    setPicking(true);
    await fetch(`/api/draft/${draft.id}`, { method: 'PATCH' });
    await fetchDraft();
    setPicking(false);
  };

  // Derived state
  const draftedPlayerIds = new Set(
    draft?.picks?.filter((p: DraftPick) => p.player_id).map((p: DraftPick) => p.player_id) ?? []
  );
  const availablePlayers = players
    .filter((p) => !draftedPlayerIds.has(p.id))
    .filter((p) => !search || p.full_name.toLowerCase().includes(search.toLowerCase()));

  const currentPick = draft?.picks?.find((p: DraftPick) => p.overall === draft.current_pick);
  const isMyTurn = currentPick?.team_id === userTeamId;
  const isMock = draft?.mode === 'mock';

  if (!activeLeague) {
    return (
      <><Nav /><main className="page-container"><div className="card mx-5 mt-6 text-center py-12">
        <p className="text-slate-400">Select a league to view the draft</p>
      </div></main></>
    );
  }

  if (loading) {
    return (<><Nav /><main className="page-container"><div className="card mx-5 mt-6 text-center py-12 text-slate-400">Loading...</div></main></>);
  }

  // No draft yet — show setup
  if (!draft) {
    return (
      <><Nav /><main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Draft Board</h1>
          <p className="page-subtitle">{activeLeague.name}</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-10">
            <span className="text-4xl block mb-3">🎯</span>
            <p className="text-slate-500 font-medium mb-1">No draft started yet</p>
            {isCommissioner ? (
              <>
                <p className="text-xs text-slate-400 mb-5">Choose a draft mode to begin</p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <button onClick={() => createDraft('mock')} disabled={creating} className="btn-primary">
                    {creating ? 'Creating...' : 'Mock Draft'}
                  </button>
                  <button onClick={() => createDraft('live')} disabled={creating} className="btn-secondary">
                    {creating ? 'Creating...' : 'Live Draft'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-4">
                  Mock: AI auto-picks for other teams. Live: all owners pick in real-time.
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">Waiting for the commissioner to start the draft.</p>
            )}
          </div>
        </div>
      </main></>
    );
  }

  // Draft board
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Draft Board</h1>
              <p className="page-subtitle">
                {draft.status === 'completed' ? 'Draft Complete' : `Round ${currentPick?.round ?? '?'}, Pick ${currentPick?.pick_in_round ?? '?'}`}
                {' '}&middot; {isMock ? 'Mock' : 'Live'}
              </p>
            </div>
            {draft.status === 'completed' && (
              <span className="badge bg-emerald-100 text-emerald-700">Complete</span>
            )}
          </div>
        </div>

        {/* On the clock banner */}
        {draft.status === 'in_progress' && currentPick && (
          <div className={`mx-5 mb-4 rounded-xl p-4 ${isMyTurn ? 'bg-gold/20 border border-gold/30' : 'bg-court/5 border border-court/10'}`}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">On the Clock</p>
            <p className="text-lg font-bold text-slate-900">
              {teamMap[currentPick.team_id] ?? 'Unknown'}
              {isMyTurn && <span className="text-gold ml-2">(You!)</span>}
            </p>
            <p className="text-xs text-slate-400">
              Pick {currentPick.overall} &middot; Round {currentPick.round}
            </p>
            {isMock && !isMyTurn && draft.status === 'in_progress' && (
              <button onClick={runAutoPicks} disabled={picking} className="btn-primary text-sm !py-2 mt-3">
                {picking ? 'Picking...' : 'Auto-pick to My Turn'}
              </button>
            )}
          </div>
        )}

        {/* Player search + pick (when it's user's turn) */}
        {draft.status === 'in_progress' && isMyTurn && (
          <div className="px-5 mb-4">
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input mb-3"
            />
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {availablePlayers.slice(0, 50).map((p) => (
                <div key={p.id} className="card flex items-center justify-between !py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{p.full_name}</p>
                    <p className="text-[10px] text-slate-400">{p.position} &middot; T{p.tier} &middot; ${p.salary}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400">{p.per36_pts.toFixed(1)} pts</p>
                    </div>
                    <button
                      onClick={() => makePick(p.id, p.full_name)}
                      disabled={picking}
                      className="btn-primary text-xs !py-1.5 !px-3 !rounded-lg"
                    >
                      Draft
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pick history */}
        <div className="px-5">
          <h2 className="section-title !px-0">Picks</h2>
          <div className="space-y-1.5">
            {draft.picks.filter((p: DraftPick) => p.player_id).reverse().map((pick: DraftPick) => (
              <div
                key={pick.overall}
                className={`card !py-2.5 flex items-center justify-between ${
                  pick.team_id === userTeamId ? 'border-gold/30 bg-gold/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    <span className="text-xs font-bold text-slate-400">{pick.overall}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{pick.player_name}</p>
                    <p className="text-[10px] text-slate-400">
                      {teamMap[pick.team_id] ?? 'Unknown'}
                      {pick.auto_picked && <span className="ml-1 text-slate-300">&middot; auto</span>}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">R{pick.round} P{pick.pick_in_round}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
