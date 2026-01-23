'use client';

import { LotteryResult } from '@/api/league';
import { Badge } from '@/components/bb/data-display';

export interface LotteryResultsDisplayProps {
  result: LotteryResult;
}

export function LotteryResultsDisplay({ result }: LotteryResultsDisplayProps) {
  const { results } = result;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text">Lottery Results</h3>
        <p className="text-sm text-text-muted">
          Executed on {new Date(result.executed_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
            1st Pick Winner
          </p>
          <p className="text-xl font-bold text-text">
            {result.first_pick_team_name}
          </p>
        </div>
        <div className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-lg">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
            2nd Pick Winner
          </p>
          <p className="text-xl font-bold text-text">
            {result.second_pick_team_name}
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-surface-alt px-4 py-2 border-b border-border">
          <h4 className="text-sm font-semibold text-text">Final Draft Order</h4>
        </div>
        <table className="w-full">
          <thead className="bg-surface-alt/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Pick
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Movement
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results.final_order.map((entry) => {
              const originalTeam = results.lottery_teams.find(
                (t) => t.team_id === entry.team_id
              );
              const originalPos = originalTeam?.original_position ?? entry.pick_number;
              const movement = originalPos - entry.pick_number;

              return (
                <tr key={entry.team_id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-text">
                    #{entry.pick_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-text">
                    {entry.team_name}
                  </td>
                  <td className="px-4 py-3">
                    {movement > 0 ? (
                      <Badge variant="success" size="sm">
                        +{movement}
                      </Badge>
                    ) : movement < 0 ? (
                      <Badge variant="danger" size="sm">
                        {movement}
                      </Badge>
                    ) : (
                      <Badge variant="default" size="sm">
                        -
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
