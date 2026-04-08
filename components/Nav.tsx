'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/roster', label: 'Roster', icon: RosterIcon },
  { href: '/lineup', label: 'Lineup', icon: LineupIcon },
  { href: '/scoring', label: 'Scoring', icon: ScoringIcon },
  { href: '/leagues', label: 'Leagues', icon: LeagueIcon },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Desktop top bar */}
      <nav className="hidden md:flex items-center justify-between bg-court text-white px-6 py-3">
        <div className="flex items-center gap-6">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="text-gold">HOOPS</span> GM
          </a>
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={`text-sm font-medium transition-colors ${
                  active ? 'text-gold' : 'text-white/70 hover:text-white'
                }`}
              >
                {tab.label}
              </a>
            );
          })}
          <a href="/players" className={`text-sm font-medium transition-colors ${pathname === '/players' ? 'text-gold' : 'text-white/70 hover:text-white'}`}>Players</a>
          <a href="/league/trades" className={`text-sm font-medium transition-colors ${pathname === '/league/trades' ? 'text-gold' : 'text-white/70 hover:text-white'}`}>Trades</a>
        </div>
        <button onClick={handleSignOut} className="text-sm text-white/60 hover:text-white transition-colors">
          Sign Out
        </button>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-court border-t border-court-light z-50 safe-area-bottom">
        <div className="flex justify-around items-center py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <a
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                  active ? 'text-gold' : 'text-white/50'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-court text-white px-5 py-3">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-gold">HOOPS</span> GM
        </span>
        <button onClick={handleSignOut} className="text-xs text-white/60 hover:text-white">
          Sign Out
        </button>
      </div>
    </>
  );
}

// Simple SVG icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function RosterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LineupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ScoringIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function LeagueIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
