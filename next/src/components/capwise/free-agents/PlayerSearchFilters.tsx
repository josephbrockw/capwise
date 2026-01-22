'use client';

import { useState } from 'react';
import { Input, Button, Toggle } from '@/components/bb/ui';
import { Flex, Stack } from '@/components/bb/layout';
import { Badge } from '@/components/bb/data-display';

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface PlayerFilters {
  search: string;
  positions: Position[];
  minProjectedValue: number | null;
  maxProjectedValue: number | null;
  hideInjured: boolean;
}

export interface PlayerSearchFiltersProps {
  filters: PlayerFilters;
  onFiltersChange: (filters: PlayerFilters) => void;
  isLoading?: boolean;
}

const ALL_POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export function PlayerSearchFilters({
  filters,
  onFiltersChange,
  isLoading = false,
}: PlayerSearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const togglePosition = (position: Position) => {
    const newPositions = filters.positions.includes(position)
      ? filters.positions.filter((p) => p !== position)
      : [...filters.positions, position];
    onFiltersChange({ ...filters, positions: newPositions });
  };

  const handleMinValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onFiltersChange({ ...filters, minProjectedValue: value });
  };

  const handleMaxValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onFiltersChange({ ...filters, maxProjectedValue: value });
  };

  const handleHideInjuredChange = (checked: boolean) => {
    onFiltersChange({ ...filters, hideInjured: checked });
  };

  const clearFilters = () => {
    setResetKey((k) => k + 1);
    onFiltersChange({
      search: '',
      positions: [],
      minProjectedValue: null,
      maxProjectedValue: null,
      hideInjured: false,
    });
  };

  const hasActiveFilters =
    filters.positions.length > 0 ||
    filters.minProjectedValue !== null ||
    filters.maxProjectedValue !== null ||
    filters.hideInjured;

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <Stack gap="md">
        <Flex align="center" gap="sm">
          <div className="flex-1">
            <Input
              id="player-search"
              name="search"
              placeholder="Search players..."
              value={filters.search}
              onChange={handleSearchChange}
              debounceTime={300}
              disabled={isLoading}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden px-3 py-1.5 text-sm"
          >
            {isExpanded ? 'Hide Filters' : 'Filters'}
            {hasActiveFilters && (
              <Badge variant="primary" size="sm" className="ml-2">
                {filters.positions.length + (filters.hideInjured ? 1 : 0) + (filters.minProjectedValue !== null || filters.maxProjectedValue !== null ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </Flex>

        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Position</label>
              <Flex gap="xs" wrap>
                {ALL_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => togglePosition(pos)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      filters.positions.includes(pos)
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-hover text-text-muted hover:text-text'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {pos}
                  </button>
                ))}
              </Flex>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Projected Value</label>
              <Flex gap="sm" align="center">
                <Input
                  key={`min-${resetKey}`}
                  id="min-value"
                  name="minValue"
                  type="number"
                  placeholder="Min"
                  value={filters.minProjectedValue ?? ''}
                  onChange={handleMinValueChange}
                  debounceTime={500}
                  disabled={isLoading}
                  className="w-24"
                />
                <span className="text-text-muted">to</span>
                <Input
                  key={`max-${resetKey}`}
                  id="max-value"
                  name="maxValue"
                  type="number"
                  placeholder="Max"
                  value={filters.maxProjectedValue ?? ''}
                  onChange={handleMaxValueChange}
                  debounceTime={500}
                  disabled={isLoading}
                  className="w-24"
                />
              </Flex>
            </div>

            <div className="flex items-end">
              <Toggle
                id="hide-injured"
                name="hideInjured"
                label="Hide Injured"
                checked={filters.hideInjured}
                onChange={handleHideInjuredChange}
                disabled={isLoading}
              />
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="ghost" onClick={clearFilters} disabled={isLoading} className="px-3 py-1.5 text-sm">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Stack>
    </div>
  );
}
