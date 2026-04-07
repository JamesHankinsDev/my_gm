'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { League } from '@/types';

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinLeagueId, setJoinLeagueId] = useState('');
  const [joinTeamName, setJoinTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLeagues();
  }, []);

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

    if (!res.ok) {
      setError(json.error);
    } else {
      setNewLeagueName('');
      fetchLeagues();
    }
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

    if (!res.ok) {
      setError(json.error);
    } else {
      setJoinLeagueId('');
      setJoinTeamName('');
      fetchLeagues();
    }
  };

  if (loading) {
    return <main className="min-h-screen p-8 max-w-4xl mx-auto"><p>Loading...</p></main>;
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Leagues</h1>

      {leagues.length > 0 ? (
        <div className="space-y-3 mb-8">
          {leagues.map((league) => (
            <a
              key={league.id}
              href={`/?league=${league.id}`}
              className="block p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <h2 className="text-lg font-semibold">{league.name}</h2>
              <p className="text-sm text-gray-500">Season {league.season} &middot; Cap ${league.cap_limit}</p>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-8">You&apos;re not in any leagues yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Create a League</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="League name"
              value={newLeagueName}
              onChange={(e) => setNewLeagueName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700"
            >
              Create League
            </button>
          </form>
        </div>

        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-semibold mb-4">Join a League</h2>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              placeholder="League ID"
              value={joinLeagueId}
              onChange={(e) => setJoinLeagueId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Your team name"
              value={joinTeamName}
              onChange={(e) => setJoinTeamName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700"
            >
              Join League
            </button>
          </form>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </main>
  );
}
