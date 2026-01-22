'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/bb/ui';
import { Badge } from '@/components/bb/data-display';
import { TradableDraftPick, calculateDraftPickValue } from './types';
import { getOrdinalSuffix } from '@/utils/format';

export interface TradableDraftPickListProps {
  picks: TradableDraftPick[];
  onSelectionChange: (pickId: string, selected: boolean) => void;
  currentYear: number;
  disabled?: boolean;
}

type SortField = 'year' | 'round' | 'value';
type SortDirection = 'asc' | 'desc';

export function TradableDraftPickList({
  picks,
  onSelectionChange,
  currentYear,
  disabled = false,
}: TradableDraftPickListProps) {
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedPicks = useMemo(() => {
    return [...picks].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortField) {
        case 'year':
          aVal = a.year * 10 + a.round;
          bVal = b.year * 10 + b.round;
          break;
        case 'round':
          aVal = a.round * 1000 + a.year;
          bVal = b.round * 1000 + b.year;
          break;
        case 'value':
          aVal = calculateDraftPickValue(a.year, a.round, currentYear);
          bVal = calculateDraftPickValue(b.year, b.round, currentYear);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [picks, sortField, sortDirection, currentYear]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'value' ? 'desc' : 'asc');
    }
  };

  const selectedCount = picks.filter((p) => p.isSelected).length;

  if (picks.length === 0) {
    return (
      <div className="text-center py-6 text-text-muted text-sm" data-testid="empty-pick-list">
        No draft picks available
      </div>
    );
  }

  return (
    <div data-testid="tradable-pick-list">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">
          {selectedCount > 0 && `${selectedCount} selected`}
        </span>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleSort('year')}
            className={`px-2 py-1 rounded transition-colors ${
              sortField === 'year' ? 'bg-primary-500/20 text-primary-500' : 'text-text-muted hover:text-text'
            }`}
            data-testid="sort-year"
          >
            Year {sortField === 'year' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            onClick={() => handleSort('round')}
            className={`px-2 py-1 rounded transition-colors ${
              sortField === 'round' ? 'bg-primary-500/20 text-primary-500' : 'text-text-muted hover:text-text'
            }`}
            data-testid="sort-round"
          >
            Round {sortField === 'round' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            onClick={() => handleSort('value')}
            className={`px-2 py-1 rounded transition-colors ${
              sortField === 'value' ? 'bg-primary-500/20 text-primary-500' : 'text-text-muted hover:text-text'
            }`}
            data-testid="sort-value"
          >
            Value {sortField === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {sortedPicks.map((pick) => {
          const value = calculateDraftPickValue(pick.year, pick.round, currentYear);
          const isOwnPick = pick.original_team_id === pick.current_team_id;

          return (
            <label
              key={pick.id}
              className={`
                flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all
                ${pick.isSelected
                  ? 'bg-primary-500/10 border border-primary-500/30'
                  : 'bg-surface-hover/50 border border-transparent hover:border-border'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              data-testid={`pick-item-${pick.id}`}
            >
              <Checkbox
                id={`pick-${pick.id}`}
                name={`pick-${pick.id}`}
                checked={pick.isSelected}
                onChange={(e) => onSelectionChange(pick.id, e.target.checked)}
                disabled={disabled}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-text">
                    {pick.year} {pick.round}{getOrdinalSuffix(pick.round)} Round
                  </span>
                  {!isOwnPick && (
                    <Badge variant="info" size="sm">
                      via {pick.original_team_name}
                    </Badge>
                  )}
                </div>
                {pick.projected_number && (
                  <div className="text-xs text-text-muted">
                    Projected: #{pick.projected_number}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-medium text-sm text-text">
                  {value} pts
                </div>
                <div className="text-xs text-text-muted">
                  Value
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
