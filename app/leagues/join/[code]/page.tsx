'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';

interface LeaguePreview {
  id: string;
  name: string;
  season: number;
  team_count: number;
  max_teams: number;
}

export default function JoinLeaguePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [league, setLeague] = useState<LeaguePreview | null>(null);
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/leagues/join?code=${code}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setLeague(json.data);
        setLoading(false);
      });
  }, [code]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!teamName.trim()) return;
    setJoining(true);

    const res = await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, team_name: teamName }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error);
      setJoining(false);
    } else {
      router.push(`/leagues/${json.data.league_id}`);
    }
  };

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Join League</h1>
        </div>

        <div className="px-5">
          {loading ? (
            <div className="card text-center py-12 text-slate-400">Looking up invite...</div>
          ) : error && !league ? (
            <div className="card text-center py-12">
              <span className="text-4xl block mb-3">😕</span>
              <p className="text-slate-500 font-medium">{error}</p>
              <a href="/leagues" className="btn-secondary inline-block mt-4">Back to Leagues</a>
            </div>
          ) : league ? (
            <div className="card">
              <div className="text-center mb-6">
                <span className="text-4xl block mb-2">🏆</span>
                <h2 className="text-xl font-bold text-slate-900">{league.name}</h2>
                <p className="text-sm text-slate-500">Season {league.season}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {league.team_count} / {league.max_teams} teams
                </p>
              </div>

              {league.team_count >= league.max_teams ? (
                <div className="text-center">
                  <p className="text-flame font-medium">This league is full</p>
                  <a href="/leagues" className="btn-secondary inline-block mt-4">Back to Leagues</a>
                </div>
              ) : (
                <form onSubmit={handleJoin} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input"
                    required
                  />
                  {error && <p className="text-flame text-sm font-medium">{error}</p>}
                  <button type="submit" disabled={joining} className="btn-primary w-full">
                    {joining ? 'Joining...' : 'Join League'}
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
