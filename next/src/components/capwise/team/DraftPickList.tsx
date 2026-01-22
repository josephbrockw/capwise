'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/bb/ui';

export interface DraftPickData {
  id: string;
  year: number;
  round: number;
  pickNumber: number | null;
  originalTeamId: string;
  originalTeamName: string;
  currentTeamId: string;
  isOwned: boolean;
  isFromTrade?: boolean;
}

export interface DraftPickListProps {
  picks: DraftPickData[];
  teamId: string;
  defaultYearsToShow?: number;
}

export function DraftPickList({
  picks,
  teamId,
  defaultYearsToShow = 3,
}: DraftPickListProps) {
  const [showAllYears, setShowAllYears] = useState(false);

  const picksByYear = useMemo(() => {
    const grouped: Record<number, DraftPickData[]> = {};
    picks.forEach((pick) => {
      if (!grouped[pick.year]) {
        grouped[pick.year] = [];
      }
      grouped[pick.year].push(pick);
    });

    Object.keys(grouped).forEach((year) => {
      grouped[Number(year)].sort((a, b) => a.round - b.round);
    });

    return grouped;
  }, [picks]);

  const years = useMemo(() => {
    return Object.keys(picksByYear)
      .map(Number)
      .sort((a, b) => a - b);
  }, [picksByYear]);

  const visibleYears = showAllYears ? years : years.slice(0, defaultYearsToShow);
  const hasMoreYears = years.length > defaultYearsToShow;

  const getRoundLabel = (round: number): string => {
    if (round === 1) return '1st';
    if (round === 2) return '2nd';
    if (round === 3) return '3rd';
    return `${round}th`;
  };

  if (picks.length === 0) {
    return (
      <div
        className="text-center py-8 text-text-muted"
        data-testid="draft-pick-list-empty"
      >
        No draft picks
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="draft-pick-list">
      {visibleYears.map((year) => (
        <div key={year} data-testid={`draft-year-${year}`}>
          <h4 className="text-sm font-semibold text-text-muted mb-2">{year} Draft</h4>
          <div className="space-y-2">
            {picksByYear[year]?.map((pick) => {
              const isFromTrade = pick.originalTeamId !== teamId;
              const isTradedAway = pick.originalTeamId === teamId && !pick.isOwned;

              if (isTradedAway) return null;

              return (
                <div
                  key={pick.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isFromTrade
                      ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                      : 'border-border bg-surface'
                  }`}
                  data-testid={`draft-pick-${pick.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-text">
                      {getRoundLabel(pick.round)} Round
                    </span>
                    {pick.pickNumber && (
                      <span className="text-text-muted text-sm">
                        (Pick #{pick.pickNumber})
                      </span>
                    )}
                    {isFromTrade && (
                      <span
                        className="relative group cursor-help text-primary-500"
                        data-testid={`trade-icon-${pick.id}`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                          Acquired via trade from {pick.originalTeamName}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {hasMoreYears && (
        <Button
          variant="ghost"
          onClick={() => setShowAllYears(!showAllYears)}
          className="w-full text-sm"
          data-testid="toggle-years-button"
        >
          {showAllYears
            ? 'Show Less'
            : `Show ${years.length - defaultYearsToShow} More Year${years.length - defaultYearsToShow > 1 ? 's' : ''}`}
        </Button>
      )}
    </div>
  );
}
