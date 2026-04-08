import Nav from '@/components/Nav';

export default function ScoringPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Scoring</h1>
          <p className="page-subtitle">Weekly breakdowns per player</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">📊</span>
            <p className="text-slate-500 font-medium">Scoring breakdowns coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Simulation vs actual, coaching bonuses, breakouts</p>
          </div>
        </div>
      </main>
    </>
  );
}
