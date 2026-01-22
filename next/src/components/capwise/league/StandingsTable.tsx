import Link from 'next/link';
import { Card, CardHeader } from '@/components/capwise/ui';
import { Flex } from '@/components/bb/layout';
import { Badge } from '@/components/bb/data-display';
import { formatCurrency, getOrdinalSuffix } from '@/utils/format';
import { Team } from '@/api/league';
import config from '@/config';

interface StandingsTableProps {
  teams: Team[];
  currentTeamId: string;
}

export function StandingsTable({ teams, currentTeamId }: StandingsTableProps) {
  return (
    <Card>
      <CardHeader title="Standings" />
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-hover">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">
                Owner
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">
                W
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">
                L
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">
                Cap Space
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams.map((team, index) => {
              const isCurrentTeam = team.id === currentTeamId;
              return (
                <tr
                  key={team.id}
                  className={`hover:bg-surface-hover transition-colors ${
                    isCurrentTeam ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-text-muted">
                    {index + 1}
                    {getOrdinalSuffix(index + 1).replace(String(index + 1), '')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={config.routes.team(team.id)}
                      className="font-medium text-text hover:text-primary-600 transition-colors"
                    >
                      {team.name}
                      {isCurrentTeam && (
                        <Badge variant="primary" size="sm" className="ml-2">
                          You
                        </Badge>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted hidden sm:table-cell">
                    {team.owner_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-text">
                    {team.wins}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-text">
                    {team.losses}
                  </td>
                  <td className="px-4 py-3 text-sm text-right hidden md:table-cell">
                    <span
                      className={
                        team.cap_space >= 0
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-danger-600 dark:text-danger-400'
                      }
                    >
                      {formatCurrency(team.cap_space)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden divide-y divide-border">
        {teams.map((team, index) => {
          const isCurrentTeam = team.id === currentTeamId;
          return (
            <Link
              key={team.id}
              href={config.routes.team(team.id)}
              className={`block p-4 hover:bg-surface-hover transition-colors ${
                isCurrentTeam ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <Flex justify="between" align="center">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-text-muted w-8">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-text">
                      {team.name}
                      {isCurrentTeam && (
                        <Badge variant="primary" size="sm" className="ml-2">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-text-muted">{team.owner_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text">
                    {team.wins}-{team.losses}
                  </p>
                  <p
                    className={`text-sm ${
                      team.cap_space >= 0
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }`}
                  >
                    {formatCurrency(team.cap_space)}
                  </p>
                </div>
              </Flex>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
