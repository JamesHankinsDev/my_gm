import Nav from '@/components/Nav';

export default function RosterPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Roster</h1>
          <p className="page-subtitle">8 active + 2 bench + 2 IR slots</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">👥</span>
            <p className="text-slate-500 font-medium">Roster management coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Drag-drop slot assignments, salary cap tracking</p>
          </div>
        </div>
      </main>
    </>
  );
}
