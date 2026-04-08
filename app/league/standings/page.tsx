import Nav from '@/components/Nav';

export default function StandingsPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Standings</h1>
          <p className="page-subtitle">League rankings with cap info</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">📈</span>
            <p className="text-slate-500 font-medium">Standings coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Win/loss record, cap status, playoff seeding</p>
          </div>
        </div>
      </main>
    </>
  );
}
