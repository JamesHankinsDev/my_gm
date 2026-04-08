import Nav from '@/components/Nav';

export default function AdminPage() {
  return (
    <>
      <Nav />
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Commissioner</h1>
          <p className="page-subtitle">League admin tools</p>
        </div>
        <div className="px-5">
          <div className="card text-center py-12">
            <span className="text-4xl mb-3 block">⚙️</span>
            <p className="text-slate-500 font-medium">Admin tools coming soon</p>
            <p className="text-xs text-slate-400 mt-1">Tier overrides, sanctions, league settings</p>
          </div>
        </div>
      </main>
    </>
  );
}
