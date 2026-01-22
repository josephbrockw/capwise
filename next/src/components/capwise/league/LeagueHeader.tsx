import { Card } from '@/components/capwise/ui';
import { Flex } from '@/components/bb/layout';
import { Button } from '@/components/bb/ui';
import { Alert } from '@/components/bb/feedback';
import { formatCurrency } from '@/utils/format';
import { League } from '@/api/league';

interface LeagueHeaderProps {
  league: League;
  isCommissioner: boolean;
  isCurrentUserCommissioner: boolean;
  onSync: () => void;
  isSyncing: boolean;
  syncMessage: string | null;
}

export function LeagueHeader({
  league,
  isCommissioner,
  isCurrentUserCommissioner,
  onSync,
  isSyncing,
  syncMessage,
}: LeagueHeaderProps) {
  return (
    <Card variant="elevated" padding="lg">
      <Flex justify="between" align="start" className="flex-col lg:flex-row gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            {league.name}
          </h1>
          <p className="text-text-muted mt-1">{league.year} Season</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div>
              <span className="text-text-muted">Commissioner:</span>{' '}
              <span className="font-medium text-text">
                {isCurrentUserCommissioner ? 'You' : 'League Admin'}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Salary Cap:</span>{' '}
              <span className="font-medium text-text">
                {formatCurrency(league.salary_cap)}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Min Salary:</span>{' '}
              <span className="font-medium text-text">
                {formatCurrency(league.min_salary)}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Roster Size:</span>{' '}
              <span className="font-medium text-text">{league.roster_size}</span>
            </div>
          </div>
        </div>

        {isCommissioner && (
          <Flex gap="sm" className="flex-wrap">
            <Button
              variant="secondary"
              onClick={onSync}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync League'}
            </Button>
            <Button variant="secondary">Run Lottery</Button>
            <Button variant="primary">Settings</Button>
          </Flex>
        )}
      </Flex>

      {syncMessage && (
        <Alert
          variant={syncMessage.includes('failed') ? 'error' : 'success'}
          className="mt-4"
        >
          {syncMessage}
        </Alert>
      )}
    </Card>
  );
}
