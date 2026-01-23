'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { getPlayers, Player, PlayerSearchParams } from '@/api/league';
import { Stack } from '@/components/bb/layout';
import { Spinner, Alert } from '@/components/bb/feedback';
import { Card } from '@/components/capwise/ui';
import { AppLayout, PageContainer } from '@/components/capwise/layout';
import {
  PlayerSearchFilters,
  PlayerFilters,
  PlayerTable,
} from '@/components/capwise/free-agents';

const PAGE_SIZE = 50;

export default function FreeAgentsPage() {
  const { currentTeam } = useTeam();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<PlayerFilters>({
    search: '',
    positions: [],
    minProjectedValue: null,
    maxProjectedValue: null,
    hideInjured: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);


  const totalPages = useMemo(() => Math.ceil(totalCount / PAGE_SIZE), [totalCount]);

  const fetchPlayers = useCallback(async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: PlayerSearchParams = {
        rostered: false,
        page: currentPage,
        page_size: PAGE_SIZE,
      };

      if (filters.search) {
        params.name = filters.search;
      }

      if (filters.positions.length > 0) {
        params.position = filters.positions.join(',');
      }

      if (filters.hideInjured) {
        params.is_injured = false;
      }

      if (filters.minProjectedValue !== null) {
        params.min_projected_value = filters.minProjectedValue;
      }

      if (filters.maxProjectedValue !== null) {
        params.max_projected_value = filters.maxProjectedValue;
      }

      const response = await getPlayers(currentTeam.id, params);

      setPlayers(response.results);
      setTotalCount(response.count);
    } catch (err) {
      setError('Failed to load players');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam?.id, currentPage, filters]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFiltersChange = (newFilters: PlayerFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!currentTeam) {
    return (
      <AppLayout>
        <Alert variant="warning" title="No Team Selected">
          Please select a team to view free agents.
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer>
        <Stack gap="lg">
            <FreeAgentsHeader totalCount={totalCount} />

            <PlayerSearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
            />

            {error ? (
              <Alert variant="error" title="Error">
                {error}
              </Alert>
            ) : isLoading && players.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Spinner size="lg" label="Loading players..." />
              </div>
            ) : (
              <Card>
                <PlayerTable
                  players={players}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={handlePageChange}
                />
              </Card>
            )}
        </Stack>
      </PageContainer>
    </AppLayout>
  );
}

interface FreeAgentsHeaderProps {
  totalCount: number;
}

function FreeAgentsHeader({ totalCount }: FreeAgentsHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Free Agents</h1>
      <p className="text-text-muted mt-1">
        {totalCount.toLocaleString()} available players
      </p>
    </div>
  );
}
