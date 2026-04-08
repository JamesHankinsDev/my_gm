'use client';

import { useEffect, useState, useCallback } from 'react';
import Nav from '@/components/Nav';
import { useLeague } from '@/lib/league-context';
import type { DraftSession, DraftPick } from '@/types';

interface RosteredPlayer {
  pick: number;
  player_name: string;
  player_id: string;
  round: number;
}

export default function RosterPage() {
  const { activeLeague } = useLeague();
  const [draft, setDraft] = useState<DraftSession | null>(null);
  const [userTeamId, setUserTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const leagueId = activeLeague?.id;

  const fetchRoster = useCallback(async () => {
    if (!leagueId) return;
    const res = await fetch(`/api/draft?league_id=${leagueId}`);
    const json = await res.json();
    if (json.data) {
      const detailRes = await fetch(`/api/draft/${json.data.id}`);
      const detailJson = await detailRes.json();
      setDraft(detailJson.data);
      setUserTeamId(detailJson.userTeamId);
    }
    setLoading(false);
  }, [leagueId]);

  useEffect(() => { fetchRoster(); }, [fetchRoster]);

  if (!activeLeague) {
    return (
      <><Nav /><main className="page-container"><div className="card mx-5 mt-6 text-center py-12">
        <p className="text-slate-400">Select a league to view your roster</p>
      </div></main></>
    );
  }

  if (loading) {
    return (<><Nav /><main className="page-container"><div className="card mx-5 mt-6 text-center py-12 text-slate-400">Loading...</div></main></>);
  }

  // Get user's drafted players
  const myPicks: RosteredPlayer[] = draft?.picks
    ?.filter((p: DraftPick) => p.team_id === userTeamId && p.player_id)
    .map((p: DraftPick) => ({
      pick: p.overall,
      player_name: p.player_name ?? 'Unknown',
      player_id: p.player_id!,
      round: p.round,
    })) ?? [];

  // No draft or no picks — show empty state
  if (!draft || myPicks.length === 0) {
    const hasDraft = !!draft;
    const draftInProgress = draft?.status === 'in_progress';

    return (
      <>
        <Nav />
        <main className="page-container">
          <div className="page-header">
            <h1 className="page-title">My Roster</h1>
            <p className="page-subtitle">{activeLeague.name}</p>
          </div>
          <div className="px-5">
            <div className="card text-center py-10">
              <span className="text-4xl block mb-3">👥</span>
              {!hasDraft ? (
                <>
                  <p className="text-slate-500 font-medium">Your roster is empty</p>
                  <p className="text-xs text-slate-400 mt-1 mb-5">You need to draft players first</p>
                  <a href="/league/draft" className="btn-primary inline-block">Go to Draft</a>
                </>
              ) : draftInProgress ? (
                <>
                  <p className="text-slate-500 font-medium">Draft in progress</p>
                  <p className="text-xs text-slate-400 mt-1 mb-5">Head to the draft board to make your picks</p>
                  <a href="/league/draft" className="btn-primary inline-block">Go to Draft</a>
                </>
              ) : (
                <p className="text-slate-500 font-medium">No players on your roster</p>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  // Show roster
  const slotLabels = ['Starter', 'Starter', 'Starter', 'Starter', 'Starter', '6th Man', 'Rotation', 'Rotation', 'Bench', 'Bench'];
  const slotStyles: Record<string, { bg: string; text: string }> = {
    Starter: { bg: 'bg-court', text: 'text-white' },
    '6th Man': { bg: 'bg-flame', text: 'text-white' },
    Rotation: { bg: 'bg-court-light', text: 'text-white' },
    Bench: { bg: 'bg-slate-300', text: 'text-slate-700' },
  };

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Roster</h1>
          <p className="page-subtitle">
            {activeLeague.name} &middot; {myPicks.length} player{myPicks.length !== 1 ? 's' : ''}
            {draft.status === 'in_progress' && (
              <span className="text-gold ml-1">(Draft in progress)</span>
            )}
          </p>
        </div>

        <div className="px-5 space-y-2">
          {myPicks.map((pick, i) => {
            const label = slotLabels[i] ?? 'Bench';
            const style = slotStyles[label] ?? slotStyles.Bench;
            return (
              <div key={pick.pick} className="card flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.bg}`}>
                  <span className={`text-[9px] font-black leading-tight text-center ${style.text}`}>
                    {label === 'Starter' ? `S${i + 1}` : label === '6th Man' ? '6TH' : label === 'Rotation' ? 'ROT' : 'BNC'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{pick.player_name}</p>
                  <p className="text-[10px] text-slate-400">Round {pick.round}, Pick #{pick.pick}</p>
                </div>
              </div>
            );
          })}
        </div>

        {draft.status === 'in_progress' && (
          <div className="px-5 mt-4">
            <a href="/league/draft" className="btn-secondary w-full block text-center">
              Back to Draft Board
            </a>
          </div>
        )}
      </main>
    </>
  );
}
