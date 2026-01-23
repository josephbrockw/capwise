'use client';

import { DraftPick } from '@/api/league';

export interface DraftPickCellProps {
  pick: DraftPick;
  isOnTheClock: boolean;
  isCommissioner: boolean;
  onMakePick?: (pick: DraftPick) => void;
}

export function DraftPickCell({
  pick,
  isOnTheClock,
  isCommissioner,
  onMakePick,
}: DraftPickCellProps) {
  const isUsed = pick.assigned_name !== null;
  const canMakePick = isOnTheClock && isCommissioner && !isUsed;

  const handleClick = () => {
    if (canMakePick && onMakePick) {
      onMakePick(pick);
    }
  };

  return (
    <div
      className={`
        relative p-3 border rounded-lg min-h-[90px] flex flex-col
        ${isOnTheClock && !isUsed ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-border'}
        ${isUsed ? 'bg-success/5 border-success/30' : 'bg-surface'}
        ${canMakePick ? 'cursor-pointer hover:bg-primary/10' : ''}
      `}
      onClick={handleClick}
      role={canMakePick ? 'button' : undefined}
      tabIndex={canMakePick ? 0 : undefined}
      onKeyDown={(e) => {
        if (canMakePick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-text bg-surface-alt px-2 py-0.5 rounded">
          #{pick.pick_number ?? pick.projected_number ?? '-'}
        </span>
        {isOnTheClock && !isUsed && (
          <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded animate-pulse">
            NOW
          </span>
        )}
        {isUsed && (
          <span className="text-[10px] font-medium text-success">
            PICKED
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <p className="text-xs text-text-muted truncate mb-1" title={pick.current_team_name}>
          {pick.current_team_name}
        </p>
        {isUsed ? (
          <p className="text-sm font-semibold text-text truncate" title={pick.assigned_name ?? ''}>
            {pick.assigned_name}
          </p>
        ) : (
          <p className="text-xs text-text-muted">
            {isOnTheClock ? (canMakePick ? 'Click to select' : 'Selecting...') : 'Waiting'}
          </p>
        )}
      </div>

      {pick.original_team_name !== pick.current_team_name && (
        <div className="mt-1 pt-1 border-t border-border/50">
          <span className="text-[10px] text-text-muted">
            via {pick.original_team_name}
          </span>
        </div>
      )}
    </div>
  );
}
