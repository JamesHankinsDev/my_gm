'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import type { League } from '@/types';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinLeagueId, setJoinLeagueId] = useState('');
  const [joinTeamName, setJoinTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeagues(); }, []);

  const fetchLeagues = async () => {
    const res = await fetch('/api/leagues');
    const json = await res.json();
    setLeagues(json.data ?? []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newLeagueName.trim()) return;
    const res = await fetch('/api/leagues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newLeagueName }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); } else { setNewLeagueName(''); fetchLeagues(); }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!joinLeagueId.trim() || !joinTeamName.trim()) return;
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ league_id: joinLeagueId, name: joinTeamName }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error); } else { setJoinLeagueId(''); setJoinTeamName(''); fetchLeagues(); }
  };

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Leagues</h1>
          <p className="page-subtitle">Manage your fantasy leagues</p>
        </div>

        {/* League list */}
        <div className="px-5 space-y-3 mb-6">
          {loading ? (
            <div className="card text-center text-slate-400 py-8">Loading...</div>
          ) : leagues.length > 0 ? (
            leagues.map((league) => (
              <a key={league.id} href={`/?league=${league.id}`} className="card-interactive flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">{league.name}</h2>
                  <p className="text-xs text-slate-500">Season {league.season}</p>
                </div>
                <div className="text-right">
                  <span className="badge bg-gold/20 text-gold-dark">${league.cap_limit} cap</span>
                </div>
              </a>
            ))
          ) : (
            <div className="card text-center py-8">
              <p className="text-slate-400">You&apos;re not in any leagues yet.</p>
            </div>
          )}
        </div>

        {/* Create / Join forms */}
        <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="font-bold text-slate-900 mb-3">Create a League</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="League name" value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} className="input" required />
              <button type="submit" className="btn-primary w-full">Create League</button>
            </form>
          </div>

          <div className="card">
            <h2 className="font-bold text-slate-900 mb-3">Join a League</h2>
            <form onSubmit={handleJoin} className="space-y-3">
              <input type="text" placeholder="League ID" value={joinLeagueId} onChange={(e) => setJoinLeagueId(e.target.value)} className="input" required />
              <input type="text" placeholder="Your team name" value={joinTeamName} onChange={(e) => setJoinTeamName(e.target.value)} className="input" required />
              <button type="submit" className="btn-secondary w-full">Join League</button>
            </form>
          </div>
        </div>

        {error && <p className="text-flame text-sm font-medium px-5 mt-3">{error}</p>}
      </main>
    </>
  );
}
