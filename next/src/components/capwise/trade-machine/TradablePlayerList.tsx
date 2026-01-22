'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/bb/ui';
import { Badge } from '@/components/bb/data-display';
import { formatCurrency } from '@/utils/format';
import { TradablePlayer } from './types';

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
              ${player.trade_blocked ? 'opacity-50' : ''}
            `}
            data-testid={`player-item-${player.id}`}
          >
            <Checkbox
              id={`player-${player.id}`}
              name={`player-${player.id}`}
              checked={player.isSelected}
              onChange={(e) => onSelectionChange(player.id, e.target.checked)}
              disabled={disabled || player.trade_blocked}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-text truncate">
                  {player.player.name}
                </span>
                {player.player.is_injured && (
                  <Badge variant="danger" size="sm">INJ</Badge>
                )}
                {player.trade_blocked && (
                  <Badge variant="warning" size="sm">Blocked</Badge>
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
