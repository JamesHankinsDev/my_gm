'use client';

import Nav from '@/components/Nav';

const cards = [
  { title: 'My Leagues', desc: 'Create or join a league', href: '/leagues', icon: '🏆', color: 'bg-gold/10 border-gold/20' },
  { title: 'Roster', desc: 'Manage your players & cap', href: '/roster', icon: '👥', color: 'bg-court/5 border-court/10' },
  { title: 'Lineup', desc: 'Set coaching decisions', href: '/lineup', icon: '📋', color: 'bg-flame/5 border-flame/10' },
  { title: 'Scoring', desc: 'Weekly breakdowns', href: '/scoring', icon: '📊', color: 'bg-court/5 border-court/10' },
  { title: 'Draft', desc: 'Lottery & picks', href: '/league/draft', icon: '🎯', color: 'bg-gold/10 border-gold/20' },
  { title: 'Trades', desc: 'Multi-team trade hub', href: '/league/trades', icon: '🔄', color: 'bg-flame/5 border-flame/10' },
  { title: 'Standings', desc: 'League rankings', href: '/league/standings', icon: '📈', color: 'bg-court/5 border-court/10' },
  { title: 'Free Agents', desc: 'Browse by tier', href: '/players', icon: '🏀', color: 'bg-gold/10 border-gold/20' },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main className="page-container">
        {/* Hero banner */}
        <div className="bg-court mx-3 mt-3 rounded-2xl p-6 md:mx-5">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome to <span className="text-gold">Hoops GM</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">Front Office Mode — manage your franchise</p>
        </div>

        {/* Quick action cards */}
        <div className="px-3 mt-5 md:px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cards.map((card) => (
              <a
                key={card.href}
                href={card.href}
                className={`card-interactive flex flex-col gap-2 border ${card.color}`}
              >
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">{card.title}</h2>
                  <p className="text-xs text-slate-500">{card.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
