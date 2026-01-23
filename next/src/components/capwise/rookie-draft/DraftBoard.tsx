'use client';

import { DraftPick } from '@/api/league';
import { DraftPickCell } from './DraftPickCell';

export interface DraftBoardProps {
  picks: DraftPick[];
  currentPickNumber: number | null;
  isCommissioner: boolean;
  onMakePick?: (pick: DraftPick) => void;
}

export function DraftBoard({
  picks,
  currentPickNumber,
  isCommissioner,
  onMakePick,
}: DraftBoardProps) {
  const rounds = [...new Set(picks.map((p) => p.round))].sort((a, b) => a - b);

  const picksByRound = rounds.reduce(
    (acc, round) => {
      acc[round] = picks
        .filter((p) => p.round === round)
        .sort((a, b) => {
          const aNum = a.pick_number ?? a.projected_number ?? 999;
          const bNum = b.pick_number ?? b.projected_number ?? 999;
          return aNum - bNum;
        });
      return acc;
    },
    {} as Record<number, DraftPick[]>
  );

  const maxPicksPerRound = Math.max(...rounds.map((r) => picksByRound[r].length));

  if (picks.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        No draft picks found for this year.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text">Draft Board</h3>
        <p className="text-sm text-text-muted">
          {currentPickNumber ? `Pick ${currentPickNumber} is on the clock` : 'View all draft picks by round'}
        </p>
      </div>

      {rounds.map((round) => (
        <div key={round}>
          <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Round {round}</h4>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(maxPicksPerRound, 6)}, minmax(140px, 1fr))`,
            }}
          >
            {picksByRound[round].map((pick) => {
              const pickNum = pick.pick_number ?? pick.projected_number;
              const isOnTheClock = currentPickNumber !== null &&
                pickNum === currentPickNumber &&
                pick.assigned_name === null;

              return (
                <DraftPickCell
                  key={pick.id}
                  pick={pick}
                  isOnTheClock={isOnTheClock}
                  isCommissioner={isCommissioner}
                  onMakePick={onMakePick}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
