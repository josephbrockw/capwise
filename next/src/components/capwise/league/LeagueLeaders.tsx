import { Card, CardHeader } from '@/components/capwise/ui';
import { Flex } from '@/components/bb/layout';
import { Player } from '@/api/league';

type StatCategory = 'pts' | 'reb' | 'ast' | 'stl' | 'blk';

interface LeagueLeader {
  player: Player;
  teamName: string;
  value: number;
}

interface LeagueLeadersProps {
  leaders: LeagueLeader[];
  selectedCategory: StatCategory;
  onCategoryChange: (category: StatCategory) => void;
}

const statCategories: { key: StatCategory; label: string }[] = [
  { key: 'pts', label: 'Points' },
  { key: 'reb', label: 'Rebounds' },
  { key: 'ast', label: 'Assists' },
  { key: 'stl', label: 'Steals' },
  { key: 'blk', label: 'Blocks' },
];

export function LeagueLeaders({
  leaders,
  selectedCategory,
  onCategoryChange,
}: LeagueLeadersProps) {
  return (
    <Card>
      <CardHeader title="League Leaders" />
      <div className="px-4 pb-2">
        <Flex gap="sm" className="flex-wrap">
          {statCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-hover text-text-muted hover:text-text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </Flex>
      </div>
      <div className="divide-y divide-border">
        {leaders.length > 0 ? (
          leaders.map((leader, index) => (
            <div key={leader.player.id} className="px-4 py-3 flex items-center gap-4">
              <span className="text-lg font-bold text-text-muted w-6">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-text">{leader.player.name}</p>
                <p className="text-sm text-text-muted">{leader.teamName}</p>
              </div>
              <span className="text-lg font-semibold text-text">
                {leader.value.toFixed(1)}
              </span>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-text-muted">
            No player data available
          </div>
        )}
      </div>
    </Card>
  );
}

export type { StatCategory, LeagueLeader };
