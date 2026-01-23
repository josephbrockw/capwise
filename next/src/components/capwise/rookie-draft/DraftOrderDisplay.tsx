'use client';

import { Fragment } from 'react';
import { DraftPick } from '@/api/league';

export interface DraftOrderDisplayProps {
  picks: DraftPick[];
  currentTeamId?: string;
}

export function DraftOrderDisplay({ picks, currentTeamId }: DraftOrderDisplayProps) {
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
        <h3 className="text-lg font-semibold text-text">Projected Draft Order</h3>
        <p className="text-sm text-text-muted">
          Draft order based on current standings. Order may change after lottery.
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-20" />
            <col className="w-[35%]" />
            <col className="w-[35%]" />
            <col />
          </colgroup>
          <thead className="bg-surface-alt">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Pick
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Original Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                Selection
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rounds.map((round) => (
              <Fragment key={`round-${round}`}>
                <tr className="bg-surface-alt/50">
                  <td colSpan={4} className="px-4 py-2">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Round {round}
                    </span>
                  </td>
                </tr>
                {picksByRound[round].map((pick) => {
                  const pickNum = pick.pick_number ?? pick.projected_number ?? '-';
                  const isMyPick = pick.current_team_id === currentTeamId;
                  const wasTraded = pick.original_team_id !== pick.current_team_id;

                  return (
                    <tr
                      key={pick.id}
                      className={`
                        transition-colors
                        ${isMyPick ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-hover'}
                      `}
                    >
                      <td className="px-4 py-3">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                          ${isMyPick ? 'bg-primary text-white' : 'bg-surface-alt text-text'}
                        `}>
                          {pickNum}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${isMyPick ? 'text-primary' : 'text-text'}`}>
                          {pick.current_team_name}
                        </span>
                        {wasTraded && (
                          <span className="ml-2 text-xs text-warning font-medium">
                            (traded)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {wasTraded ? pick.original_team_name : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {pick.assigned_name ? (
                          <span className="font-medium text-success">{pick.assigned_name}</span>
                        ) : (
                          <span className="text-text-muted italic">TBD</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
