'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/bb/data-display';
import { Button } from '@/components/bb/ui';
import { formatCurrency } from '@/utils/format';

export interface RosterPlayerData {
  id: string;
  playerId: string;
  playerName: string;
  positions: string[];
  nbaTeam: string;
  salary: number;
  fptsAvg: number;
  isKeeper: boolean;
  keeperYears?: number;
  isInjured?: boolean;
  injuryStatus?: string | null;
}

export interface RosterTableProps {
  players: RosterPlayerData[];
  isEditable?: boolean;
  onEditPlayer?: (playerId: string) => void;
}

type SortField = 'playerName' | 'positions' | 'nbaTeam' | 'salary' | 'fptsAvg';
type SortDirection = 'asc' | 'desc';

interface SortHeaderProps {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

function SortHeader({ field, children, sortField, sortDirection, onSort }: SortHeaderProps) {
  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text transition-colors"
      onClick={() => onSort(field)}
      data-testid={`sort-${field}`}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <svg
            className={`h-4 w-4 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    </th>
  );
}

export function RosterTable({
  players,
  isEditable = false,
  onEditPlayer,
}: RosterTableProps) {
  const [sortField, setSortField] = useState<SortField>('salary');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'playerName':
          aVal = a.playerName.toLowerCase();
          bVal = b.playerName.toLowerCase();
          break;
        case 'positions':
          aVal = a.positions.join(',');
          bVal = b.positions.join(',');
          break;
        case 'nbaTeam':
          aVal = a.nbaTeam;
          bVal = b.nbaTeam;
          break;
        case 'salary':
          aVal = a.salary;
          bVal = b.salary;
          break;
        case 'fptsAvg':
          aVal = a.fptsAvg;
          bVal = b.fptsAvg;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (players.length === 0) {
    return (
      <div
        className="text-center py-8 text-text-muted"
        data-testid="roster-table-empty"
      >
        No players on roster
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto" data-testid="roster-table">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-hover">
            <tr>
              <SortHeader field="playerName" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Player</SortHeader>
              <SortHeader field="positions" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Pos</SortHeader>
              <SortHeader field="nbaTeam" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Team</SortHeader>
              <SortHeader field="salary" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Salary</SortHeader>
              <SortHeader field="fptsAvg" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>FPTS</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Status
              </th>
              {isEditable && (
                <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedPlayers.map((player) => (
              <tr
                key={player.id}
                className="hover:bg-surface-hover transition-colors"
                data-testid={`roster-row-${player.id}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text">{player.playerName}</span>
                    {player.isInjured && (
                      <Badge variant="danger" size="sm">
                        {player.injuryStatus || 'INJ'}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                  {player.positions.join('/')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                  {player.nbaTeam}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text font-medium">
                  {formatCurrency(player.salary)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-text">
                  {player.fptsAvg.toFixed(1)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {player.isKeeper ? (
                    <Badge variant="primary" size="sm">
                      Keeper{player.keeperYears ? ` (${player.keeperYears}yr)` : ''}
                    </Badge>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </td>
                {isEditable && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      onClick={() => onEditPlayer?.(player.playerId)}
                      data-testid={`edit-player-${player.id}`}
                      className="text-sm px-2 py-1"
                    >
                      Edit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3" data-testid="roster-cards">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-surface rounded-lg border border-border p-4"
            data-testid={`roster-card-${player.id}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text">{player.playerName}</span>
                  {player.isInjured && (
                    <Badge variant="danger" size="sm">
                      {player.injuryStatus || 'INJ'}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-text-muted">
                  {player.positions.join('/')} - {player.nbaTeam}
                </span>
              </div>
              {player.isKeeper && (
                <Badge variant="primary" size="sm">
                  Keeper
                </Badge>
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">
                Salary: <span className="text-text font-medium">{formatCurrency(player.salary)}</span>
              </span>
              <span className="text-text-muted">
                FPTS: <span className="text-text font-medium">{player.fptsAvg.toFixed(1)}</span>
              </span>
            </div>
            {isEditable && (
              <div className="mt-3 pt-3 border-t border-border">
                <Button
                  variant="secondary"
                  className="w-full text-sm"
                  onClick={() => onEditPlayer?.(player.playerId)}
                >
                  Edit Player
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
