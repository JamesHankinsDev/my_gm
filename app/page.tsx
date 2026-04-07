export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Hoops GM</h1>
      <p className="text-gray-600 mb-8">Fantasy Basketball League — Front Office Mode</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="My Roster"
          description="Manage your players, slots, and salary cap"
          href="/roster"
        />
        <DashboardCard
          title="Weekly Lineup"
          description="Set coaching decisions and minute predictions"
          href="/lineup"
        />
        <DashboardCard
          title="Scoring"
          description="View weekly scoring breakdowns"
          href="/scoring"
        />
        <DashboardCard
          title="Draft Board"
          description="Draft lottery and pick management"
          href="/league/draft"
        />
        <DashboardCard
          title="Trade Hub"
          description="Propose and review multi-team trades"
          href="/league/trades"
        />
        <DashboardCard
          title="Standings"
          description="League standings and cap info"
          href="/league/standings"
        />
        <DashboardCard
          title="Free Agents"
          description="Browse available players by tier"
          href="/players"
        />
      </div>
    </main>
  );
}

function DashboardCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      className="block p-6 border rounded-lg hover:shadow-md transition-shadow bg-white"
    >
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
    </a>
  );
}
