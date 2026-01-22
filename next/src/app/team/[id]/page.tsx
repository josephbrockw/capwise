'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { getTeam, getTrades, TeamDetail, Trade } from '@/api/league';
import { Card, CardHeader } from '@/components/capwise/ui';
import {
  TeamHeader,
  SalaryCapBar,
  RosterTable,
  DraftPickList,
  RosterPlayerData,
  DraftPickData,
} from '@/components/capwise/team';
import { Container, Stack, Flex } from '@/components/bb/layout';
import { Button } from '@/components/bb/ui';
import { Spinner, Alert } from '@/components/bb/feedback';
import { Badge } from '@/components/bb/data-display';
import { formatCurrency } from '@/utils/format';
import config from '@/config';

interface TradeHistoryRowProps {
  trade: Trade;
  statusVariant: 'success' | 'danger' | 'warning' | 'default';
}

function TradeHistoryRow({ trade, statusVariant }: TradeHistoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 hover:bg-surface-hover/50 transition-colors text-left"
      >
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg
              className={`w-4 h-4 text-text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <p className="font-medium text-text truncate">
              {trade.teams.map((t) => t.team_name).join(' & ')}
            </p>
          </div>
          <Badge variant={statusVariant} size="sm">
            {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
          </Badge>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {new Date(trade.created_at).toLocaleDateString()}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="bg-surface-hover/30 rounded-lg p-3 space-y-3">
            {trade.teams.map((team) => (
              <div key={team.team_id} className="space-y-1">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {team.team_name} sends:
                </p>
                {team.assets_sent.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {team.assets_sent.map((asset) => (
                      <span
                        key={asset.id}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-surface text-xs text-text border border-border"
                      >
                        {asset.type === 'player'
                          ? asset.player?.name || 'Player'
                          : `${asset.draft_pick?.year} R${asset.draft_pick?.round}`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-text-muted italic">Nothing</span>
                )}
              </div>
            ))}
            {trade.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-text-muted">
                  <span className="font-medium">Notes:</span> {trade.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const { currentTeam } = useTeam();
  const { user } = useAuth();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnTeam = currentTeam?.id === teamId;
  const isCommissioner = currentTeam?.league?.commissioner_id === user?.id;
  const canEdit = isOwnTeam || isCommissioner;

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!currentTeam?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const [teamData, tradesData] = await Promise.all([
          getTeam(teamId, currentTeam.id),
          getTrades(currentTeam.id, { team_id: teamId }).catch(() => []),
        ]);
        setTeam(teamData);
        setTrades(tradesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId, currentTeam?.id]);

  if (isLoading) {
    return (
      <main className="py-8">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" label="Loading team..." />
          </div>
        </Container>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="py-8">
        <Container>
          <Alert variant="error">{error || 'Team not found'}</Alert>
          <div className="mt-4">
            <Link href={config.routes.dashboard}>
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const rosterPlayers: RosterPlayerData[] = (team.roster || []).map((rp) => ({
    id: rp.id,
    playerId: rp.player.id,
    playerName: rp.player.name,
    positions: rp.player.positions,
    nbaTeam: rp.player.nba_team,
    salary: rp.salary,
    fptsAvg: rp.player.fpts_avg || 0,
    isKeeper: rp.is_keeper,
    keeperYears: rp.keeper_years,
    isInjured: rp.player.is_injured,
    injuryStatus: null,
  }));

  const draftPicks: DraftPickData[] = (team.draft_picks || []).map((dp) => ({
    id: dp.id,
    year: dp.year,
    round: dp.round,
    pickNumber: dp.pick_number ?? dp.projected_number,
    originalTeamId: dp.original_team_id,
    originalTeamName: dp.original_team_name,
    currentTeamId: dp.current_team_id,
    isOwned: true,
    isFromTrade: dp.original_team_id !== teamId,
  }));

  const totalProjectedValue = rosterPlayers.reduce(
    (sum, p) => sum + (p.fptsAvg || 0),
    0
  );
  const avgFpts =
    rosterPlayers.length > 0 ? totalProjectedValue / rosterPlayers.length : 0;

  const handleEditPlayer = (playerId: string) => {
    console.log('Edit player:', playerId);
  };

  return (
    <main className="py-6 lg:py-8">
      <Container>
        <Stack gap="lg">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Link href={config.routes.dashboard} className="hover:text-text">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-text">{team.name}</span>
          </div>

          <Card variant="elevated" padding="lg">
            <div className="space-y-6">
              <TeamHeader
                name={team.name}
                ownerName={team.owner_name}
                logoUrl={team.logo_url}
                wins={team.wins}
                losses={team.losses}
                standing={team.standing}
                isOwnTeam={isOwnTeam}
                isCommissioner={isCommissioner}
              />

              <div className="pt-4 border-t border-border">
                <SalaryCapBar
                  currentSalary={team.current_salary}
                  salaryCap={team.league?.salary_cap || 0}
                />
              </div>

              {canEdit && (
                <Flex gap="sm" className="pt-4 border-t border-border">
                  <Button variant="primary">Edit Roster</Button>
                  <Link href={config.routes.tradeMachine}>
                    <Button variant="secondary">Propose Trade</Button>
                  </Link>
                </Flex>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card
                variant="elevated"
                padding="none"
                header={
                  <CardHeader
                    title="Roster"
                    subtitle={`${rosterPlayers.length} players`}
                  />
                }
              >
                <div className="p-4 lg:p-6">
                  <RosterTable
                    players={rosterPlayers}
                    isEditable={canEdit}
                    onEditPlayer={handleEditPlayer}
                  />
                </div>
              </Card>

              {trades.length > 0 && (
                <Card
                  variant="elevated"
                  padding="none"
                  header={<CardHeader title="Trade History" />}
                >
                  <div>
                    {trades.slice(0, 5).map((trade) => {
                      const statusVariant =
                        trade.status === 'accepted' ? 'success' :
                        trade.status === 'rejected' ? 'danger' :
                        trade.status === 'cancelled' ? 'default' : 'warning';

                      return (
                        <TradeHistoryRow
                          key={trade.id}
                          trade={trade}
                          statusVariant={statusVariant}
                        />
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card
                variant="elevated"
                padding="none"
                header={<CardHeader title="Team Stats" />}
              >
                <div className="p-4 lg:p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Salary</span>
                    <span className="font-medium text-text">
                      {formatCurrency(team.current_salary)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Cap Space</span>
                    <span
                      className={`font-medium ${
                        team.cap_space >= 0 ? 'text-success-500' : 'text-danger-500'
                      }`}
                    >
                      {formatCurrency(team.cap_space)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Roster Size</span>
                    <span className="font-medium text-text">
                      {rosterPlayers.length}/{team.league?.roster_size || '-'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Avg FPTS</span>
                      <span className="font-medium text-text">
                        {avgFpts.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-text-muted">Total Projected</span>
                      <span className="font-medium text-text">
                        {totalProjectedValue.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                variant="elevated"
                padding="none"
                header={
                  <CardHeader
                    title="Draft Capital"
                    subtitle={`${draftPicks.length} picks`}
                  />
                }
              >
                <div className="p-4 lg:p-6">
                  <DraftPickList
                    picks={draftPicks}
                    teamId={teamId}
                    defaultYearsToShow={3}
                  />
                </div>
              </Card>
            </div>
          </div>
        </Stack>
      </Container>
    </main>
  );
}
