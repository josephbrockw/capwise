import { Card, CardHeader } from '@/components/capwise/ui';
import { Badge } from '@/components/bb/data-display';
import { Trade } from '@/api/league';

interface RecentTradesProps {
  trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <Card>
      <CardHeader title="Recent Trades" />
      <div className="divide-y divide-border">
        {trades.length > 0 ? (
          trades.map((trade) => (
            <div key={trade.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-text">
                    {trade.teams.map((t) => t.team_name).join(' ↔ ')}
                  </p>
                  <p className="text-sm text-text-muted mt-1">
                    {trade.teams
                      .map((t) => {
                        const assets = t.assets_sent.map((a) =>
                          a.type === 'player'
                            ? a.player?.name || 'Player'
                            : `${a.draft_pick?.year} R${a.draft_pick?.round}`
                        );
                        return assets.length > 0 ? assets.join(', ') : 'Nothing';
                      })
                      .join(' for ')}
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  {trade.status}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-text-muted">
            No recent trades
          </div>
        )}
      </div>
    </Card>
  );
}
