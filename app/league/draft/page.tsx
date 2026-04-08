import Nav from '@/components/Nav';

export default function DraftPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Draft Board</h1>
          <p className="page-subtitle">Snake draft with lottery order</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">🎯</span>
            <p className="text-slate-500 font-medium">Draft board coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Lottery simulation, pick protections, draft night</p>
          </div>
        </div>
      </main>
    </>
  );
}
