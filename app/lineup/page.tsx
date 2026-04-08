import Nav from '@/components/Nav';

export default function LineupPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Weekly Lineup</h1>
          <p className="page-subtitle">Predict minutes for 6th man and rotation</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-slate-500 font-medium">Lineup coaching coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Set minute predictions for coaching bonuses</p>
          </div>
        </div>
      </main>
    </>
  );
}
