'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/bb/data-display';
import { Dropdown } from '@/components/bb/navigation';
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
  acquiredByDraft?: boolean;
  tradeBlocked?: boolean;
}

export interface RosterTableProps {
  players: RosterPlayerData[];
  isEditable?: boolean;
  onToggleTradeBlock?: (rosterPlayerId: string, currentlyBlocked: boolean) => void;
  onToggleKeeper?: (rosterPlayerId: string, currentlyKeeper: boolean) => void;
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

function PlayerStatusIcons({ player }: { player: RosterPlayerData }) {
  const icons = [];

  if (player.isKeeper) {
    icons.push(
      <span key="keeper" title={`Keeper${player.keeperYears ? ` (${player.keeperYears} yr)` : ''}`} className="text-warning-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </span>
    );
  }

  if (player.tradeBlocked) {
    icons.push(
      <span key="blocked" title="On Trade Block" className="text-success-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
        </svg>
      </span>
    );
  }

  if (player.acquiredByDraft) {
    icons.push(
      <span key="drafted" title="Acquired by Draft" className="text-primary-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
        </svg>
      </span>
    );
  }

  if (icons.length === 0) return null;

  return <span className="flex items-center gap-1 ml-1">{icons}</span>;
}

export function RosterTable({
  players,
  isEditable = false,
  onToggleTradeBlock,
  onToggleKeeper,
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
              {isEditable && (
                <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider w-12">
                  <span className="sr-only">Actions</span>
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
                  <div className="flex items-center">
                    <span className="font-medium text-text">{player.playerName}</span>
                    <PlayerStatusIcons player={player} />
                    {player.isInjured && (
                      <Badge variant="danger" size="sm" className="ml-2">
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
                {isEditable && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Dropdown
                      trigger={
                        <div className="p-1.5 hover:bg-surface-hover rounded-md transition-colors cursor-pointer inline-flex">
                          <svg className="w-4 h-4 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </div>
                      }
                      align="right"
                      items={[
                        {
                          id: 'keeper',
                          label: player.isKeeper ? 'Remove as Keeper' : 'Add as Keeper',
                          icon: player.isKeeper ? (
                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ),
                          onClick: () => onToggleKeeper?.(player.id, player.isKeeper || false),
                        },
                        {
                          id: 'trade-block',
                          label: player.tradeBlocked ? 'Remove from Trade Block' : 'Add to Trade Block',
                          icon: player.tradeBlocked ? (
                            <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ),
                          onClick: () => onToggleTradeBlock?.(player.id, player.tradeBlocked || false),
                        },
                      ]}
                    />
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
                <div className="flex items-center">
                  <span className="font-medium text-text">{player.playerName}</span>
                  <PlayerStatusIcons player={player} />
                  {player.isInjured && (
                    <Badge variant="danger" size="sm" className="ml-2">
                      {player.injuryStatus || 'INJ'}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-text-muted">
                  {player.positions.join('/')} - {player.nbaTeam}
                </span>
              </div>
              {isEditable && (
                <Dropdown
                  trigger={
                    <div className="p-1.5 hover:bg-surface-hover rounded-md transition-colors cursor-pointer">
                      <svg className="w-4 h-4 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </div>
                  }
                  align="right"
                  items={[
                    {
                      id: 'keeper',
                      label: player.isKeeper ? 'Remove as Keeper' : 'Add as Keeper',
                      onClick: () => onToggleKeeper?.(player.id, player.isKeeper || false),
                    },
                    {
                      id: 'trade-block',
                      label: player.tradeBlocked ? 'Remove from Trade Block' : 'Add to Trade Block',
                      onClick: () => onToggleTradeBlock?.(player.id, player.tradeBlocked || false),
                    },
                  ]}
                />
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
          </div>
        ))}
      </div>
    </>
  );
}
