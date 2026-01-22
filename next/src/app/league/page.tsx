'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTeams,
  getTrades,
  getDraftPicks,
  getPlayers,
  triggerSync,
  Team,
  Trade,
  DraftPick,
  Player,
} from '@/api/league';
import {
  LeagueHeader,
  StandingsTable,
  LeagueLeaders,
  RecentTrades,
  DraftPickOverview,
  StatCategory,
  LeagueLeader,
} from '@/components/capwise/league';
import { Container, Stack } from '@/components/bb/layout';
import { Spinner, Alert } from '@/components/bb/feedback';

export default function LeaguePage() {
  const { currentTeam, currentLeague, isCommissioner } = useTeam();
  const { user } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatCategory, setSelectedStatCategory] = useState<StatCategory>('pts');
  const [selectedDraftYear, setSelectedDraftYear] = useState<number>(new Date().getFullYear());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentTeam?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const [teamsData, tradesData, picksData, playersData] = await Promise.all([
          getTeams(currentTeam.id),
          getTrades(currentTeam.id, { status: 'accepted' }).catch(() => []),
          getDraftPicks(currentTeam.id).catch(() => []),
          getPlayers(currentTeam.id, { rostered: true, page_size: 100 }).catch(() => ({ results: [] })),
        ]);

        setTeams(teamsData.sort((a, b) => a.standing - b.standing));
        setTrades(tradesData.slice(0, 5));
        setDraftPicks(picksData);
        setPlayers(playersData.results || []);
      } catch (err) {
        setError('Failed to load league data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentTeam?.id]);

  const draftYears = useMemo(() => {
    const years = [...new Set(draftPicks.map((p) => p.year))].sort();
    return years.length > 0 ? years : [new Date().getFullYear()];
  }, [draftPicks]);

  const filteredDraftPicks = useMemo(() => {
    return draftPicks
      .filter((p) => p.year === selectedDraftYear)
      .sort((a, b) => {
        if (a.round !== b.round) return a.round - b.round;
        return (a.pick_number || 99) - (b.pick_number || 99);
      });
  }, [draftPicks, selectedDraftYear]);

  const leagueLeaders = useMemo((): LeagueLeader[] => {
    const getStatValue = (player: Player): number => {
      switch (selectedStatCategory) {
        case 'pts': return player.stats?.points_per_game || 0;
        case 'reb': return player.stats?.rebounds_per_game || 0;
        case 'ast': return player.stats?.assists_per_game || 0;
        case 'stl': return player.stats?.steals_per_game || 0;
        case 'blk': return player.stats?.blocks_per_game || 0;
        default: return 0;
      }
    };

    return players
      .filter((p) => p.on_roster)
      .map((player) => ({
        player,
        teamName: 'Rostered',
        value: getStatValue(player),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [players, selectedStatCategory]);

  const handleSync = async () => {
    if (!currentTeam?.id) return;

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await triggerSync(currentTeam.id, { sync_type: 'full' });
      setSyncMessage(result.message || 'Sync completed successfully');
    } catch (err) {
      setSyncMessage('Sync failed. Please try again.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="py-8">
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" label="Loading league..." />
          </div>
        </Container>
      </main>
    );
  }

  if (!currentTeam || !currentLeague) {
    return (
      <main className="py-8">
        <Container>
          <Alert variant="warning" title="No League Selected">
            Please select a team to view league information.
          </Alert>
        </Container>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-8">
        <Container>
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-6 lg:py-8">
      <Container>
        <Stack gap="lg">
          <LeagueHeader
            league={currentLeague}
            isCommissioner={isCommissioner}
            isCurrentUserCommissioner={currentLeague.commissioner_id === user?.id}
            onSync={handleSync}
            isSyncing={isSyncing}
            syncMessage={syncMessage}
          />

          <StandingsTable teams={teams} currentTeamId={currentTeam.id} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeagueLeaders
              leaders={leagueLeaders}
              selectedCategory={selectedStatCategory}
              onCategoryChange={setSelectedStatCategory}
            />
            <RecentTrades trades={trades} />
          </div>

          <DraftPickOverview
            draftPicks={filteredDraftPicks}
            years={draftYears}
            selectedYear={selectedDraftYear}
            onYearChange={setSelectedDraftYear}
            currentTeamId={currentTeam.id}
          />
        </Stack>
      </Container>
    </main>
  );
}
