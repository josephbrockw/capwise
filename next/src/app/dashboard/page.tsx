'use client';

import Link from 'next/link';
import { useTeam } from '@/contexts/TeamContext';
import { Card, CardHeader, StatCard } from '@/components/capwise/ui';
import { SalaryCapChart, RosterValueChart, RosterPlayer } from '@/components/capwise/charts';
import { Badge } from '@/components/bb/data-display';
import { Container, Stack, Flex } from '@/components/bb/layout';
import { Button } from '@/components/bb/ui';
import { Spinner } from '@/components/bb/feedback';
import { formatCurrency, getOrdinalSuffix } from '@/utils/format';
import config from '@/config';

type LeaguePhase = 'free_agency' | 'regular_season' | 'playoffs' | 'draft';

function getPhaseInfo(phase: LeaguePhase): { label: string; variant: 'primary' | 'success' | 'warning' | 'info' } {
  const phases = {
    free_agency: { label: 'Free Agency', variant: 'primary' as const },
    regular_season: { label: 'Regular Season', variant: 'success' as const },
    playoffs: { label: 'Playoffs', variant: 'warning' as const },
    draft: { label: 'Rookie Draft', variant: 'info' as const },
  };
  return phases[phase];
}

export default function DashboardPage() {
  const { currentTeam, currentLeague, isCommissioner, isLoading } = useTeam();

  if (isLoading) {
    return (
      <main className="py-8">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" label="Loading dashboard..." />
          </div>
        </Container>
      </main>
    );
  }

  if (!currentTeam || !currentLeague) {
    return (
      <main className="py-8">
        <Container>
          <Card variant="elevated" padding="lg">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
                <svg className="h-8 w-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">No Team Selected</h2>
              <p className="text-text-muted mb-6">You don&apos;t have any teams yet or haven&apos;t selected one.</p>
              <Button>Join a League</Button>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  const mockPhase: LeaguePhase = 'regular_season';
  const phaseInfo = getPhaseInfo(mockPhase);
  const daysUntilNextPhase = 23;
  const needsSync = currentLeague.needs_sync;

  const mockTopPlayers: RosterPlayer[] = [
    { id: '1', name: 'Luka Doncic', positions: 'PG/SG', projectedValue: 58.4, salary: 45000000, status: 'healthy' },
    { id: '2', name: 'Anthony Davis', positions: 'PF/C', projectedValue: 52.1, salary: 40000000, status: 'questionable' },
    { id: '3', name: 'Jayson Tatum', positions: 'SF/PF', projectedValue: 48.7, salary: 37000000, status: 'healthy' },
    { id: '4', name: 'Tyrese Haliburton', positions: 'PG', projectedValue: 45.2, salary: 28000000, status: 'healthy' },
    { id: '5', name: 'Paolo Banchero', positions: 'PF', projectedValue: 42.8, salary: 12000000, status: 'injured' },
  ];

  const mockRecentTrades = [
    { id: '1', teams: 'Ballers traded with Dynasty', summary: 'J. Brown for 2 picks', time: '2 hours ago' },
    { id: '2', teams: 'Hoops traded with Slam', summary: 'D. Fox + pick for T. Young', time: '1 day ago' },
    { id: '3', teams: 'Dynasty traded with Nets', summary: 'B. Ingram for J. Poole + pick', time: '3 days ago' },
  ];

  const injuredPlayers = mockTopPlayers.filter(p => p.status === 'injured' || p.status === 'questionable');

  return (
    <main className="py-6 lg:py-8">
      <Container>
        <Stack gap="lg">
          {/* Header */}
          <div>
            <Flex justify="between" align="start" className="flex-col sm:flex-row gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text">{currentTeam.name}</h1>
                <p className="text-text-muted mt-1">{currentLeague.name} - {currentLeague.year} Season</p>
              </div>
              <Flex gap="sm" className="flex-wrap">
                <Badge variant={phaseInfo.variant} size="lg" dot>
                  {phaseInfo.label}
                </Badge>
                {isCommissioner && (
                  <Badge variant="primary" size="lg">Commissioner</Badge>
                )}
              </Flex>
            </Flex>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md">
              <StatCard
                label="Record"
                value={`${currentTeam.wins}-${currentTeam.losses}`}
                subtext={`${currentTeam.standing}${getOrdinalSuffix(currentTeam.standing)} place`}
                icon={
                  <svg className="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </Card>
            <Card padding="md">
              <StatCard
                label="Roster"
                value={`${currentTeam.roster?.length || 0}/${currentLeague.roster_size}`}
                subtext="players"
                icon={
                  <svg className="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </Card>
            <Card padding="md">
              <StatCard
                label="Cap Space"
                value={formatCurrency(currentTeam.cap_space)}
                subtext={currentTeam.cap_space > 0 ? 'available' : 'over cap'}
                icon={
                  <svg className="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </Card>
            <Card padding="md">
              <StatCard
                label="Draft Picks"
                value={`${currentTeam.draft_picks?.length || 0}`}
                subtext="owned"
                icon={
                  <svg className="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
              />
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width on desktop */}
            <div className="lg:col-span-2 space-y-6">
              {/* Team Summary Card */}
              <Card
                variant="elevated"
                padding="none"
                header={
                  <CardHeader
                    title="Salary Cap"
                    subtitle={`${currentLeague.year} Season`}
                    action={
                      <Link href={config.routes.team(currentTeam.id)}>
                        <Button variant="ghost" className="text-sm px-3 py-1">View Roster</Button>
                      </Link>
                    }
                  />
                }
              >
                <div className="p-6">
                  <SalaryCapChart
                    used={currentTeam.current_salary}
                    total={currentLeague.salary_cap}
                  />
                </div>
              </Card>

              {/* Roster Snapshot */}
              <Card
                variant="elevated"
                padding="none"
                header={
                  <CardHeader
                    title="Top Players by Value"
                    action={
                      <Link href={config.routes.team(currentTeam.id)}>
                        <Button variant="ghost" className="text-sm px-3 py-1">Full Roster</Button>
                      </Link>
                    }
                  />
                }
              >
                <div className="p-6">
                  <RosterValueChart players={mockTopPlayers} />
                </div>
              </Card>

              {/* Alerts */}
              {injuredPlayers.length > 0 && (
                <Card variant="outlined" padding="md" className="border-warning-300 dark:border-warning-700 bg-warning-50 dark:bg-warning-900/10">
                  <Flex gap="sm" align="start">
                    <svg className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-warning-700 dark:text-warning-400">Injury Alert</p>
                      <p className="text-sm text-warning-600 dark:text-warning-500 mt-1">
                        {injuredPlayers.map(p => p.name).join(', ')} {injuredPlayers.length === 1 ? 'is' : 'are'} currently {injuredPlayers.some(p => p.status === 'injured') ? 'injured' : 'questionable'}.
                      </p>
                    </div>
                  </Flex>
                </Card>
              )}
            </div>

            {/* Right Column - 1/3 width on desktop */}
            <div className="space-y-6">
              {/* League Status */}
              <Card
                variant="elevated"
                padding="none"
                header={<CardHeader title="League Status" />}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Current Phase</span>
                    <Badge variant={phaseInfo.variant}>{phaseInfo.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Next Phase</span>
                    <span className="text-text font-medium">{daysUntilNextPhase} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Last Sync</span>
                    <span className="text-text-secondary text-sm">
                      {currentLeague.last_sync_date
                        ? new Date(currentLeague.last_sync_date).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </div>
                  {isCommissioner && needsSync && (
                    <Button variant="secondary" className="w-full mt-2">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync from ESPN
                    </Button>
                  )}
                </div>
              </Card>

              {/* Recent Trades */}
              <Card
                variant="elevated"
                padding="none"
                header={
                  <CardHeader
                    title="Recent Trades"
                    action={
                      <Link href={config.routes.tradeMachine}>
                        <Button variant="ghost" className="text-sm px-3 py-1">View All</Button>
                      </Link>
                    }
                  />
                }
              >
                <div className="divide-y divide-border">
                  {mockRecentTrades.map((trade) => (
                    <div key={trade.id} className="p-4">
                      <p className="text-sm font-medium text-text">{trade.teams}</p>
                      <p className="text-sm text-text-muted mt-0.5">{trade.summary}</p>
                      <p className="text-xs text-text-muted mt-1">{trade.time}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card
                variant="elevated"
                padding="none"
                header={<CardHeader title="Quick Actions" />}
              >
                <div className="p-4 space-y-2">
                  <Link href={config.routes.freeAgents} className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Free Agents
                    </Button>
                  </Link>
                  <Link href={config.routes.rookieDraft} className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      View Draft Picks
                    </Button>
                  </Link>
                  <Link href={config.routes.tradeMachine} className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Propose Trade
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Stack>
      </Container>
    </main>
  );
}
