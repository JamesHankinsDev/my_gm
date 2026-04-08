'use client';

interface PlayerCardProps {
  name: string;
  position: string;
  tier: number;
  salary: number;
  gamesPlayed: number;
  per36Pts: number;
  per36Reb: number;
  per36Ast: number;
}

const tierBadge: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-slate-100', text: 'text-slate-500' },
  2: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  3: { bg: 'bg-blue-100', text: 'text-blue-700' },
  4: { bg: 'bg-purple-100', text: 'text-purple-700' },
  5: { bg: 'bg-gold/20', text: 'text-gold-dark' },
};

export default function PlayerCard({
  name, position, tier, salary, gamesPlayed, per36Pts, per36Reb, per36Ast,
}: PlayerCardProps) {
  const badge = tierBadge[tier] ?? tierBadge[1];

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 truncate">{name}</h3>
          <p className="text-xs text-slate-500">{position}</p>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <span className={`badge ${badge.bg} ${badge.text}`}>T{tier}</span>
          <span className="text-sm font-black text-slate-900">${salary.toFixed(1)}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {[
          { label: 'GP', value: String(gamesPlayed) },
          { label: 'PTS', value: per36Pts.toFixed(1) },
          { label: 'REB', value: per36Reb.toFixed(1) },
          { label: 'AST', value: per36Ast.toFixed(1) },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-50 rounded-lg py-2 text-center">
            <div className="text-[10px] text-slate-400 font-medium">{stat.label}</div>
            <div className="text-sm font-bold text-slate-800">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
