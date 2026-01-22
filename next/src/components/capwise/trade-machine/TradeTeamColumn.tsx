'use client';

import { useState } from 'react';
import { Badge } from '@/components/bb/data-display';
import { Progress } from '@/components/bb/data-display';
import { formatCurrency } from '@/utils/format';
import { TradablePlayer, TradableDraftPick } from './types';
import { TradablePlayerList } from './TradablePlayerList';
import { TradableDraftPickList } from './TradableDraftPickList';

export interface TradeTeamColumnProps {
  teamName: string;
  teamAbbreviation?: string;
  logoUrl?: string | null;
  players: TradablePlayer[];
  draftPicks: TradableDraftPick[];
  currentSalary: number;
  salaryCap: number;
  salaryAfterTrade: number;
  currentYear: number;
  onPlayerSelectionChange: (playerId: string, selected: boolean) => void;
  onPickSelectionChange: (pickId: string, selected: boolean) => void;
  disabled?: boolean;
  isYourTeam?: boolean;
}

export function TradeTeamColumn({
  teamName,
  teamAbbreviation,
  logoUrl,
  players,
  draftPicks,
  currentSalary,
  salaryCap,
  salaryAfterTrade,
  currentYear,
  onPlayerSelectionChange,
  onPickSelectionChange,
  disabled = false,
  isYourTeam = false,
}: TradeTeamColumnProps) {
  const [expandedSection, setExpandedSection] = useState<'players' | 'picks' | null>('players');

  const selectedPlayers = players.filter((p) => p.isSelected);
  const selectedPicks = draftPicks.filter((p) => p.isSelected);
  const capSpaceAfter = salaryCap - salaryAfterTrade;
  const isOverCap = salaryAfterTrade > salaryCap;
  const salaryChange = salaryAfterTrade - currentSalary;

  return (
    <div
      className="rounded-xl border border-border bg-surface overflow-hidden"
      data-testid="trade-team-column"
    >
      <div className={`
        px-4 py-3 border-b border-border
        ${isYourTeam ? 'bg-primary-500/10' : 'bg-surface-hover'}
      `}>
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={teamName}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text truncate">{teamName}</h3>
              {teamAbbreviation && (
                <span className="text-xs text-text-muted">({teamAbbreviation})</span>
              )}
              {isYourTeam && (
                <Badge variant="primary" size="sm">Your Team</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border bg-surface-hover/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">Salary After Trade</span>
          <div className="flex items-center gap-2">
            {salaryChange !== 0 && (
              <span className={`text-xs ${salaryChange > 0 ? 'text-danger-400' : 'text-success-400'}`}>
                {salaryChange > 0 ? '+' : ''}{formatCurrency(salaryChange)}
              </span>
            )}
            <span className={`font-semibold ${isOverCap ? 'text-danger-400' : 'text-text'}`}>
              {formatCurrency(salaryAfterTrade)}
            </span>
          </div>
        </div>
        <Progress
          value={salaryAfterTrade}
          max={salaryCap}
          size="sm"
          variant={isOverCap ? 'danger' : capSpaceAfter < salaryCap * 0.1 ? 'warning' : 'default'}
        />
        <div className="flex justify-between mt-1 text-xs text-text-muted">
          <span>Cap: {formatCurrency(salaryCap)}</span>
          <span className={isOverCap ? 'text-danger-400' : ''}>
            {isOverCap ? 'Over cap by ' : 'Space: '}
            {formatCurrency(Math.abs(capSpaceAfter))}
          </span>
        </div>
        {isOverCap && (
          <Badge variant="danger" size="sm" className="mt-2">
            Exceeds Salary Cap
          </Badge>
        )}
      </div>

      <div className="divide-y divide-border">
        <div>
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'players' ? null : 'players')}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors"
            data-testid="expand-players"
          >
            <span className="font-medium text-sm text-text">
              Players
              {selectedPlayers.length > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {selectedPlayers.length}
                </Badge>
              )}
            </span>
            <svg
              className={`w-5 h-5 text-text-muted transition-transform ${
                expandedSection === 'players' ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${expandedSection === 'players' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-4 pb-4">
              <TradablePlayerList
                players={players}
                onSelectionChange={onPlayerSelectionChange}
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'picks' ? null : 'picks')}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors"
            data-testid="expand-picks"
          >
            <span className="font-medium text-sm text-text">
              Draft Picks
              {selectedPicks.length > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {selectedPicks.length}
                </Badge>
              )}
            </span>
            <svg
              className={`w-5 h-5 text-text-muted transition-transform ${
                expandedSection === 'picks' ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${expandedSection === 'picks' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <div className="px-4 pb-4">
              <TradableDraftPickList
                picks={draftPicks}
                onSelectionChange={onPickSelectionChange}
                currentYear={currentYear}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
