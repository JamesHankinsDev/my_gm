'use client';

import { useRouter } from 'next/navigation';

export default function Nav() {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <a href="/" className="text-xl font-bold">Hoops GM</a>
        <a href="/leagues" className="text-sm text-gray-600 hover:text-gray-900">Leagues</a>
        <a href="/roster" className="text-sm text-gray-600 hover:text-gray-900">Roster</a>
        <a href="/lineup" className="text-sm text-gray-600 hover:text-gray-900">Lineup</a>
        <a href="/scoring" className="text-sm text-gray-600 hover:text-gray-900">Scoring</a>
        <a href="/players" className="text-sm text-gray-600 hover:text-gray-900">Players</a>
        <a href="/league/trades" className="text-sm text-gray-600 hover:text-gray-900">Trades</a>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        Sign Out
      </button>
    </nav>
  );
}
