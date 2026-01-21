'use client';

import { Badge } from '@/components/bb/data-display';

export interface RosterPlayer {
  id: string;
  name: string;
  positions: string;
  projectedValue: number;
  salary: number;
  status: 'healthy' | 'injured' | 'questionable';
}

export interface RosterValueChartProps {
  players: RosterPlayer[];
}

export function RosterValueChart({ players }: RosterValueChartProps) {
  const maxValue = Math.max(...players.map(p => p.projectedValue), 1);

  return (
    <div className="space-y-3" data-testid="roster-value-chart">
      {players.map((player) => (
        <div key={player.id} className="space-y-1" data-testid={`player-row-${player.id}`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text">{player.name}</span>
              {player.status === 'injured' && (
                <Badge variant="danger" size="sm">INJ</Badge>
              )}
              {player.status === 'questionable' && (
                <Badge variant="warning" size="sm">GTD</Badge>
              )}
            </div>
            <span className="text-text-muted" data-testid={`player-value-${player.id}`}>
              {player.projectedValue.toFixed(1)} FP
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300"
              style={{ width: `${(player.projectedValue / maxValue) * 100}%` }}
              data-testid={`player-bar-${player.id}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
