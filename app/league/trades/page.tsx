import Nav from '@/components/Nav';

export default function TradesPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Trade Hub</h1>
          <p className="page-subtitle">Multi-team trades, up to 4 teams</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">🔄</span>
            <p className="text-slate-500 font-medium">Trade builder coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Salary matching, pick protections, commissioner veto</p>
          </div>
        </div>
      </main>
    </>
  );
}
