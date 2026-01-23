'use client';

import { LotteryOdds } from '@/api/league';
import { Button } from '@/components/bb/ui';

export interface LotteryOddsDisplayProps {
  odds: LotteryOdds[];
  isCommissioner: boolean;
  isLoading?: boolean;
  onRunLottery?: () => void;
}

export function LotteryOddsDisplay({
  odds,
  isCommissioner,
  isLoading = false,
  onRunLottery,
}: LotteryOddsDisplayProps) {
  if (odds.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        No lottery teams available. All teams may have made the playoffs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text">Lottery Odds</h3>
          <p className="text-sm text-text-muted">
            Teams ranked by record (worst to best)
          </p>
        </div>
        {isCommissioner && onRunLottery && (
          <Button
            variant="primary"
            onClick={onRunLottery}
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run Lottery'}
          </Button>
        )}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-alt">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Record
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                Odds
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {odds.map((team) => (
              <tr key={team.team_id} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-text">
                  #{team.position}
                </td>
                <td className="px-4 py-3 text-sm text-text">
                  {team.team_name}
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {team.wins}-{team.losses}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-primary">
                  {(team.odds * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-text-muted">
        The lottery determines picks 1 and 2. Remaining teams pick in reverse order of record.
      </p>
    </div>
  );
}
