'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Nav from '@/components/Nav';
import type { League, Team } from '@/types';

export default function LeagueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leagues/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setLeague(json.data.league);
          setTeams(json.data.teams);
          setIsCommissioner(json.data.isCommissioner);
        }
        setLoading(false);
      });
  }, [id]);

  const copyInviteLink = () => {
    if (!league) return;
    const link = `${window.location.origin}/leagues/join/${league.invite_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Nav />
        <main className="page-container">
          <div className="card mx-5 mt-6 text-center py-12 text-slate-400">Loading...</div>
        </main>
      </>
    );
  }

  if (!league) {
    return (
      <>
        <Nav />
        <main className="page-container">
          <div className="card mx-5 mt-6 text-center py-12">
            <p className="text-slate-500">League not found</p>
          </div>
        </main>
      </>
    );
  }

  const maxTeams = league.settings?.max_teams ?? 10;

  return (
    <>
      <Nav />
      <main className="page-container">
        {/* League header */}
        <div className="bg-court mx-3 mt-3 rounded-2xl p-5 md:mx-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{league.name}</h1>
              <p className="text-white/50 text-sm mt-0.5">
                Season {league.season} &middot; {teams.length}/{maxTeams} teams
              </p>
            </div>
            {isCommissioner && (
              <span className="badge bg-gold text-court text-xs">Commissioner</span>
            )}
          </div>

          {/* Invite link */}
          <div className="mt-4 flex gap-2">
            <button onClick={copyInviteLink} className="btn-outline flex-1 !border-white/20 !text-white text-sm !py-2">
              {copied ? 'Copied!' : 'Copy Invite Link'}
            </button>
            {isCommissioner && (
              <a href={`/leagues/${id}/commissioner`} className="btn-primary text-sm !py-2 !px-4">
                Settings
              </a>
            )}
          </div>
        </div>

        {/* Teams list */}
        <div className="px-5 mt-5">
          <h2 className="section-title !px-0">Teams</h2>
          <div className="space-y-2">
            {teams.map((team, i) => (
              <div key={team.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-court/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-court">{i + 1}</span>
                  </div>
                  <span className="font-bold text-sm text-slate-900">{team.name}</span>
                </div>
                {team.user_id === league.commissioner_id && (
                  <span className="badge bg-gold/20 text-gold-dark text-[10px]">Commish</span>
                )}
              </div>
            ))}
            {teams.length < maxTeams && (
              <div className="card border-dashed border-2 border-slate-200 text-center py-4">
                <p className="text-xs text-slate-400">
                  {maxTeams - teams.length} spot{maxTeams - teams.length !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
