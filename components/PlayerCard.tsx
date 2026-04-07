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

const tierColors: Record<number, string> = {
  1: 'bg-gray-400',
  2: 'bg-green-500',
  3: 'bg-blue-500',
  4: 'bg-purple-500',
  5: 'bg-amber-500',
};

export default function PlayerCard({
  name, position, tier, salary, gamesPlayed, per36Pts, per36Reb, per36Ast,
}: PlayerCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <span className="text-sm text-gray-500">{position}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-1 rounded text-white ${tierColors[tier] ?? tierColors[1]}`}>
            Tier {tier}
          </span>
          <span className="font-bold text-green-700">${salary.toFixed(1)}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-sm mt-3">
        <div>
          <div className="text-gray-500">GP</div>
          <div className="font-medium">{gamesPlayed}</div>
        </div>
        <div>
          <div className="text-gray-500">PTS/36</div>
          <div className="font-medium">{per36Pts.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-gray-500">REB/36</div>
          <div className="font-medium">{per36Reb.toFixed(1)}</div>
        </div>
        <div>
          <div className="text-gray-500">AST/36</div>
          <div className="font-medium">{per36Ast.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}
