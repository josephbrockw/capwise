'use client';

import { useMemo } from 'react';
import { Table, TableColumn, Badge, EmptyState } from '@/components/bb/data-display';
import { Button } from '@/components/bb/ui';
import { Flex } from '@/components/bb/layout';
import { Player } from '@/api/league';

export type SortField = 'name' | 'positions' | 'nba_team' | 'projected_value' | 'fpts' | 'pts' | 'reb' | 'ast';
export type SortDirection = 'asc' | 'desc';

export interface PlayerTableProps {
  players: Player[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

interface PlayerRow extends Record<string, unknown> {
  id: string;
  name: string;
  positions: string;
  nba_team: string;
  projected_value: number;
  fpts: number;
  pts: number;
  reb: number;
  ast: number;
  is_injured: boolean;
  injury_status: string | null;
  player: Player;
}

export function PlayerTable({
  players,
  isLoading = false,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: PlayerTableProps) {
  const tableData: PlayerRow[] = useMemo(
    () =>
      players.map((player) => ({
        id: player.id,
        name: player.name,
        positions: player.positions?.join(', ') || '-',
        nba_team: player.nba_team || '-',
        projected_value: player.projected_value || 0,
        fpts: player.stats?.fantasy_points_avg || 0,
        pts: player.stats?.points_per_game || 0,
        reb: player.stats?.rebounds_per_game || 0,
        ast: player.stats?.assists_per_game || 0,
        is_injured: player.is_injured,
        injury_status: player.injury_status,
        player,
      })),
    [players]
  );

  const columns: TableColumn<PlayerRow>[] = useMemo(
    () => [
      {
        field: 'name',
        label: 'Name',
        sortable: true,
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-text">{row.name}</span>
            {row.is_injured && (
              <Badge variant="danger" size="sm">
                {row.injury_status || 'INJ'}
              </Badge>
            )}
          </div>
        ),
      },
      {
        field: 'positions',
        label: 'Pos',
        sortable: true,
        className: 'w-20',
      },
      {
        field: 'nba_team',
        label: 'Team',
        sortable: true,
        className: 'w-24',
      },
      {
        field: 'projected_value',
        label: 'Proj $',
        sortable: true,
        className: 'w-24 text-right whitespace-nowrap',
        render: (value) => (
          <span className="font-medium">${Number(value).toLocaleString()}</span>
        ),
      },
      {
        field: 'fpts',
        label: 'FPTS',
        sortable: true,
        className: 'w-16 text-right',
        render: (value) => <span>{Number(value).toFixed(1)}</span>,
      },
      {
        field: 'pts',
        label: 'PTS',
        sortable: true,
        className: 'w-14 text-right',
        render: (value) => <span>{Number(value).toFixed(1)}</span>,
      },
      {
        field: 'reb',
        label: 'REB',
        sortable: true,
        className: 'w-14 text-right',
        render: (value) => <span>{Number(value).toFixed(1)}</span>,
      },
      {
        field: 'ast',
        label: 'AST',
        sortable: true,
        className: 'w-14 text-right',
        render: (value) => <span>{Number(value).toFixed(1)}</span>,
      },
    ],
    []
  );

  if (!isLoading && players.length === 0) {
    return (
      <EmptyState
        title="No players found"
        message="Try adjusting your search or filters to find players."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Table<PlayerRow>
        columns={columns}
        data={tableData}
        keyField="id"
        hover
        sortable
        emptyMessage="No players found"
        className={isLoading ? 'opacity-50' : ''}
      />

      {totalPages > 1 && (
        <Flex justify="between" align="center" className="px-4 py-3 border-t border-border">
          <span className="text-sm text-text-muted">
            Showing {(currentPage - 1) * 50 + 1}-{Math.min(currentPage * 50, totalCount)} of {totalCount} players
          </span>
          <Flex gap="sm">
            <Button
              variant="ghost"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-1.5 text-sm"
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-text">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-1.5 text-sm"
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}
    </div>
  );
}
