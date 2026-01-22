'use client';

import { Badge } from '@/components/bb/data-display';
import { formatCurrency, getOrdinalSuffix } from '@/utils/format';
import { TradablePlayer, TradableDraftPick, calculateDraftPickValue } from './types';

export interface TradeSummaryProps {
  teamName: string;
  playersOut: TradablePlayer[];
  playersIn: TradablePlayer[];
  picksOut: TradableDraftPick[];
  picksIn: TradableDraftPick[];
  currentYear: number;
}

interface AssetItemProps {
  type: 'out' | 'in';
  children: React.ReactNode;
}

function AssetItem({ type, children }: AssetItemProps) {
  return (
    <div
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded text-sm
        ${type === 'out' ? 'bg-danger-500/10 text-danger-400' : 'bg-success-500/10 text-success-400'}
      `}
    >
      <span className="text-xs font-medium opacity-75">
        {type === 'out' ? '−' : '+'}
      </span>
      {children}
    </div>
  );
}

export function TradeSummary({
  teamName,
  playersOut,
  playersIn,
  picksOut,
  picksIn,
  currentYear,
}: TradeSummaryProps) {
  const hasOutgoing = playersOut.length > 0 || picksOut.length > 0;
  const hasIncoming = playersIn.length > 0 || picksIn.length > 0;

  if (!hasOutgoing && !hasIncoming) {
    return null;
  }

  const totalSalaryOut = playersOut.reduce((sum, p) => sum + p.salary, 0);
  const totalSalaryIn = playersIn.reduce((sum, p) => sum + p.salary, 0);
  const netSalary = totalSalaryIn - totalSalaryOut;

  return (
    <div className="rounded-lg border border-border bg-surface p-4" data-testid="trade-summary">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-text">{teamName}</h4>
        <Badge
          variant={netSalary > 0 ? 'danger' : netSalary < 0 ? 'success' : 'default'}
          size="sm"
        >
          {netSalary >= 0 ? '+' : ''}{formatCurrency(netSalary)}
        </Badge>
      </div>

      <div className="space-y-3">
        {hasOutgoing && (
          <div>
            <div className="text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Sends
            </div>
            <div className="space-y-1">
              {playersOut.map((player) => (
                <AssetItem key={player.id} type="out">
                  <span className="flex-1 truncate">{player.player.name}</span>
                  <span className="text-xs opacity-75">{formatCurrency(player.salary)}</span>
                </AssetItem>
              ))}
              {picksOut.map((pick) => (
                <AssetItem key={pick.id} type="out">
                  <span className="flex-1">
                    {pick.year} {pick.round}{getOrdinalSuffix(pick.round)}
                    {pick.original_team_id !== pick.current_team_id && (
                      <span className="text-xs opacity-75 ml-1">
                        (via {pick.original_team_name})
                      </span>
                    )}
                  </span>
                </AssetItem>
              ))}
            </div>
          </div>
        )}

        {hasIncoming && (
          <div>
            <div className="text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              Receives
            </div>
            <div className="space-y-1">
              {playersIn.map((player) => (
                <AssetItem key={player.id} type="in">
                  <span className="flex-1 truncate">{player.player.name}</span>
                  <span className="text-xs opacity-75">{formatCurrency(player.salary)}</span>
                </AssetItem>
              ))}
              {picksIn.map((pick) => (
                <AssetItem key={pick.id} type="in">
                  <span className="flex-1">
                    {pick.year} {pick.round}{getOrdinalSuffix(pick.round)}
                    {pick.original_team_id !== pick.current_team_id && (
                      <span className="text-xs opacity-75 ml-1">
                        (via {pick.original_team_name})
                      </span>
                    )}
                  </span>
                  <span className="text-xs opacity-75">
                    {calculateDraftPickValue(pick.year, pick.round, currentYear)} pts
                  </span>
                </AssetItem>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
