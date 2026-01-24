'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/bb/ui';
import { Badge } from '@/components/bb/data-display';
import { formatCurrency } from '@/utils/format';
import { TradablePlayer } from './types';

function PlayerStatusIcons({ player }: { player: TradablePlayer }) {
  const icons = [];

  if (player.is_keeper) {
    icons.push(
      <span key="keeper" title={`Keeper${player.keeper_years ? ` (${player.keeper_years} yr)` : ''}`} className="text-warning-500">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </span>
    );
  }

  if (player.trade_blocked) {
    icons.push(
      <span key="blocked" title="On Trade Block" className="text-success-500">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
        </svg>
      </span>
    );
  }

  if (player.acquired_by_draft) {
    icons.push(
      <span key="drafted" title="Acquired by Draft" className="text-primary-500">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
        </svg>
      </span>
    );
  }

  if (icons.length === 0) return null;

  return <span className="flex items-center gap-0.5">{icons}</span>;
}

export interface TradablePlayerListProps {
  players: TradablePlayer[];
  onSelectionChange: (playerId: string, selected: boolean) => void;
  disabled?: boolean;
}

type SortField = 'name' | 'salary' | 'fpts';
type SortDirection = 'asc' | 'desc';

export function TradablePlayerList({
  players,
  onSelectionChange,
  disabled = false,
}: TradablePlayerListProps) {
  const [sortField, setSortField] = useState<SortField>('salary');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'name':
          aVal = a.player.name.toLowerCase();
          bVal = b.player.name.toLowerCase();
          break;
        case 'salary':
          aVal = a.salary;
          bVal = b.salary;
          break;
        case 'fpts':
          aVal = a.player.fpts_avg;
          bVal = b.player.fpts_avg;
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

  const selectedCount = players.filter((p) => p.isSelected).length;

  if (players.length === 0) {
    return (
      <div className="text-center py-6 text-text-muted text-sm" data-testid="empty-player-list">
        No players available
      </div>
    );
  }

  return (
    <div data-testid="tradable-player-list">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">
          {selectedCount > 0 && `${selectedCount} selected`}
        </span>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleSort('name')}
            className={`px-2 py-1 rounded transition-colors ${
              sortField === 'name' ? 'bg-primary-500/20 text-primary-500' : 'text-text-muted hover:text-text'
            }`}
            data-testid="sort-name"
          >
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            onClick={() => handleSort('salary')}
            className={`px-2 py-1 rounded transition-colors ${
              sortField === 'salary' ? 'bg-primary-500/20 text-primary-500' : 'text-text-muted hover:text-text'
            }`}
            data-testid="sort-salary"
          >
            Salary {sortField === 'salary' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            onClick={() => handleSort('fpts')}
            className={`px-2 py-1 rounded transition-colors ${
              sortField === 'fpts' ? 'bg-primary-500/20 text-primary-500' : 'text-text-muted hover:text-text'
            }`}
            data-testid="sort-fpts"
          >
            FPTS {sortField === 'fpts' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {sortedPlayers.map((player) => (
          <label
            key={player.id}
            className={`
              flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
              ${player.isSelected
                ? 'bg-primary-500/10 border border-primary-500/30'
                : 'bg-surface-hover/50 border border-transparent hover:border-border'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            data-testid={`player-item-${player.id}`}
          >
            <Checkbox
              id={`player-${player.id}`}
              name={`player-${player.id}`}
              checked={player.isSelected}
              onChange={(e) => onSelectionChange(player.id, e.target.checked)}
              disabled={disabled}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-text truncate">
                  {player.player.name}
                </span>
                <PlayerStatusIcons player={player} />
                {player.player.is_injured && (
                  <Badge variant="danger" size="sm">INJ</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{player.player.positions.join('/')}</span>
                <span>•</span>
                <span>{player.player.nba_team}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-medium text-sm text-text">
                {formatCurrency(player.salary)}
              </div>
              <div className="text-xs text-text-muted">
                {player.player.fpts_avg.toFixed(1)} FPTS
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
