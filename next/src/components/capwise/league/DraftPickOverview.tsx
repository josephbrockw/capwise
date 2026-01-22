import Link from 'next/link';
import { Card, CardHeader } from '@/components/capwise/ui';
import { Flex } from '@/components/bb/layout';
import { Badge } from '@/components/bb/data-display';
import { DraftPick } from '@/api/league';
import config from '@/config';

interface DraftPickOverviewProps {
  draftPicks: DraftPick[];
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  currentTeamId: string;
}

export function DraftPickOverview({
  draftPicks,
  years,
  selectedYear,
  onYearChange,
  currentTeamId,
}: DraftPickOverviewProps) {
  return (
    <Card>
      <CardHeader
        title="Draft Pick Overview"
        action={
          <Flex gap="sm">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => onYearChange(year)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedYear === year
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-hover text-text-muted hover:text-text'
                }`}
              >
                {year}
              </button>
            ))}
          </Flex>
        }
      />
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-hover">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Pick
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Original Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Current Owner
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">
                Traded
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {draftPicks.length > 0 ? (
              draftPicks.map((pick) => {
                const isTraded = pick.original_team_id !== pick.current_team_id;
                const isOwned = pick.current_team_id === currentTeamId;
                return (
                  <tr
                    key={pick.id}
                    className={`hover:bg-surface-hover transition-colors ${
                      isOwned ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-text">
                      R{pick.round}
                      {pick.pick_number ? ` #${pick.pick_number}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-text">
                      {pick.original_team_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-text">
                      <Link
                        href={config.routes.team(pick.current_team_id)}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {pick.current_team_name}
                        {isOwned && (
                          <Badge variant="primary" size="sm" className="ml-2">
                            You
                          </Badge>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isTraded && (
                        <Badge variant="warning" size="sm">
                          Traded
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No draft picks for {selectedYear}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
