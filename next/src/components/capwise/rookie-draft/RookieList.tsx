'use client';

import { useState, useMemo } from 'react';
import { RookieListItem } from '@/api/league';
import { Input, Select } from '@/components/bb/ui';
import { Badge } from '@/components/bb/data-display';

const ALL_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

export interface RookieListProps {
  rookies: RookieListItem[];
  onSelectRookie?: (rookie: RookieListItem) => void;
  selectedRookieId?: string | null;
}

export function RookieList({
  rookies,
  onSelectRookie,
  selectedRookieId,
}: RookieListProps) {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('');

  const positionOptions = useMemo(() => {
    return [
      { label: 'All Positions', value: '' },
      ...ALL_POSITIONS.map((pos) => ({ label: pos, value: pos })),
    ];
  }, []);

  const filteredRookies = useMemo(() => {
    return rookies
      .filter((rookie) => {
        if (rookie.player_id) return false;

        const matchesSearch = search === '' ||
          rookie.name.toLowerCase().includes(search.toLowerCase()) ||
          rookie.nba_team.toLowerCase().includes(search.toLowerCase());

        const matchesPosition = positionFilter === '' ||
          rookie.positions.includes(positionFilter);

        return matchesSearch && matchesPosition;
      })
      .sort((a, b) => {
        const rankA = a.rookie_rank ?? 999;
        const rankB = b.rookie_rank ?? 999;
        return rankA - rankB;
      });
  }, [rookies, search, positionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text">Available Rookies</h3>
        <p className="text-sm text-text-muted">
          Rookies available to be selected in the draft
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="rookie-search"
            name="rookie-search"
            placeholder="Search by name or NBA team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            id="position-filter"
            name="position"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            options={positionOptions}
            placeholder="All Positions"
          />
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-alt">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                NBA Team
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRookies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No available rookies found.
                </td>
              </tr>
            ) : (
              filteredRookies.map((rookie) => (
                <tr
                  key={rookie.id}
                  className={`
                    transition-colors
                    ${onSelectRookie ? 'cursor-pointer hover:bg-surface-hover' : ''}
                    ${selectedRookieId === rookie.id ? 'bg-primary/10' : ''}
                  `}
                  onClick={() => onSelectRookie?.(rookie)}
                >
                  <td className="px-4 py-3 text-sm text-text">
                    {rookie.rookie_rank ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-text">
                    {rookie.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {rookie.positions.map((pos) => (
                        <Badge key={pos} variant="default" size="sm">
                          {pos}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted">
                    {rookie.nba_team}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-text-muted">
        Showing {filteredRookies.length} of {rookies.filter(r => r.player_id === null).length} available rookies
      </p>
    </div>
  );
}
