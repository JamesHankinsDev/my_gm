'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import type { League } from '@/types';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    if (!leagueName.trim()) return;

    const res = await fetch('/api/leagues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: leagueName, team_name: teamName || undefined }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error);
    } else {
      setLeagueName('');
      setTeamName('');
      setShowCreate(false);
      router.push(`/leagues/${json.data.id}`);
    }
  };

  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">My Leagues</h1>
            <p className="page-subtitle">Create or join a fantasy league</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm !py-2 !px-4">
            + New
          </button>
        </div>

        {/* Create league form */}
        {showCreate && (
          <div className="px-5 mb-5">
            <div className="card">
              <h2 className="font-bold text-slate-900 mb-3">Create a League</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <input type="text" placeholder="League name" value={leagueName} onChange={(e) => setLeagueName(e.target.value)} className="input" required />
                <input type="text" placeholder="Your team name (optional)" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="input" />
                {error && <p className="text-flame text-sm font-medium">{error}</p>}
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">Create</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leagues list */}
        <div className="px-5 space-y-3">
          {loading ? (
            <div className="card text-center py-12 text-slate-400">Loading...</div>
          ) : leagues.length > 0 ? (
            leagues.map((league) => (
              <a
                key={league.id}
                href={`/leagues/${league.id}`}
                className="card-interactive flex items-center justify-between"
              >
                <div>
                  <h2 className="font-bold text-slate-900">{league.name}</h2>
                  <p className="text-xs text-slate-500">Season {league.season}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-court/10 text-court">${league.cap_limit} cap</span>
                  <svg className="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </div>
              </a>
            ))
          ) : (
            <div className="card text-center py-12">
              <span className="text-4xl block mb-3">🏆</span>
              <p className="text-slate-500 font-medium">No leagues yet</p>
              <p className="text-xs text-slate-400 mt-1">Create one or join with an invite link</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
