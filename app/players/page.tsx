import Nav from '@/components/Nav';

export default function PlayersPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Free Agents</h1>
          <p className="page-subtitle">Browse available players by tier</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">🏀</span>
            <p className="text-slate-500 font-medium">Free agent marketplace coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Filter by tier, position, per-36 stats</p>
          </div>
        </div>
      </main>
    </>
  );
}
