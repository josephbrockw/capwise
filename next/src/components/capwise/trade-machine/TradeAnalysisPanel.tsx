'use client';

import { useMemo } from 'react';
import { Alert } from '@/components/bb/feedback';
import { Progress } from '@/components/bb/data-display';
import { formatCurrency } from '@/utils/format';
import {
  TradablePlayer,
  TradableDraftPick,
  TradeAnalysisResult,
  calculateDraftPickValue
} from './types';

export interface TradeAnalysisPanelProps {
  team1Name: string;
  team2Name: string;
  team1AllPlayers: TradablePlayer[];
  team2AllPlayers: TradablePlayer[];
  team1PlayersOut: TradablePlayer[];
  team1PicksOut: TradableDraftPick[];
  team2PlayersOut: TradablePlayer[];
  team2PicksOut: TradableDraftPick[];
  team1CurrentSalary: number;
  team2CurrentSalary: number;
  salaryCap: number;
  currentYear: number;
  isAnalyzing?: boolean;
}

const STARTERS = 9;
const GAMES_PER_MATCHUP = 3.25;
const TOP_PLAYERS_COUNT = 11;

function calculateProjectedMatchupScore(players: { player: { fpts_avg: number } }[]): number {
  if (players.length === 0) return 0;
  const sorted = [...players].sort((a, b) => b.player.fpts_avg - a.player.fpts_avg);
  const top11 = sorted.slice(0, TOP_PLAYERS_COUNT);
  const avgFpts = top11.reduce((sum, p) => sum + p.player.fpts_avg, 0) / top11.length;
  return avgFpts * STARTERS * GAMES_PER_MATCHUP;
}

interface MatchupImpactCardProps {
  teamName: string;
  beforeScore: number;
  afterScore: number;
  scoreDiff: number;
}

function MatchupImpactCard({ teamName, beforeScore, afterScore, scoreDiff }: MatchupImpactCardProps) {
  const isPositive = scoreDiff > 0;
  const isNeutral = Math.abs(scoreDiff) < 0.1;

  return (
    <div className="rounded-lg border border-border bg-surface-hover/50 p-3 space-y-2">
      <div className="text-xs font-medium text-text truncate" title={teamName}>
        {teamName}
      </div>

      <div className={`text-2xl font-bold text-center ${
        isNeutral ? 'text-text-muted' : isPositive ? 'text-success-500' : 'text-danger-500'
      }`}>
        {isPositive ? '+' : ''}{scoreDiff.toFixed(1)}
      </div>

      <div className="text-xs text-center text-text-muted">
        pts/matchup
      </div>

      <div className="flex items-center justify-center gap-2 text-xs">
        <span className="text-text-muted">{beforeScore.toFixed(0)}</span>
        <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <span className={isNeutral ? 'text-text-muted' : isPositive ? 'text-success-500' : 'text-danger-500'}>
          {afterScore.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

interface ValueComparisonProps {
  label: string;
  team1Value: number;
  team2Value: number;
  team1Name: string;
  team2Name: string;
  formatter?: (value: number) => string;
}

function ValueComparison({
  label,
  team1Value,
  team2Value,
  team1Name,
  team2Name,
  formatter = (v) => v.toFixed(1)
}: ValueComparisonProps) {
  const total = team1Value + team2Value;
  const team1Pct = total > 0 ? (team1Value / total) * 100 : 50;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-text-muted">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-text w-20 text-right truncate" title={team1Name}>
          {formatter(team1Value)}
        </span>
        <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden flex">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${team1Pct}%` }}
          />
          <div
            className="h-full bg-success-500 transition-all duration-300"
            style={{ width: `${100 - team1Pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-text w-20 truncate" title={team2Name}>
          {formatter(team2Value)}
        </span>
      </div>
    </div>
  );
}

export function TradeAnalysisPanel({
  team1Name,
  team2Name,
  team1AllPlayers,
  team2AllPlayers,
  team1PlayersOut,
  team1PicksOut,
  team2PlayersOut,
  team2PicksOut,
  team1CurrentSalary,
  team2CurrentSalary,
  salaryCap,
  currentYear,
  isAnalyzing = false,
}: TradeAnalysisPanelProps) {
  const analysis = useMemo((): TradeAnalysisResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const team1SalaryOut = team1PlayersOut.reduce((sum, p) => sum + p.salary, 0);
    const team1SalaryIn = team2PlayersOut.reduce((sum, p) => sum + p.salary, 0);
    const team2SalaryOut = team2PlayersOut.reduce((sum, p) => sum + p.salary, 0);
    const team2SalaryIn = team1PlayersOut.reduce((sum, p) => sum + p.salary, 0);

    const team1SalaryAfter = team1CurrentSalary - team1SalaryOut + team1SalaryIn;
    const team2SalaryAfter = team2CurrentSalary - team2SalaryOut + team2SalaryIn;

    const team1OverCap = team1SalaryAfter > salaryCap;
    const team2OverCap = team2SalaryAfter > salaryCap;

    if (team1OverCap) {
      errors.push(`${team1Name} would exceed the salary cap by ${formatCurrency(team1SalaryAfter - salaryCap)}`);
    }
    if (team2OverCap) {
      errors.push(`${team2Name} would exceed the salary cap by ${formatCurrency(team2SalaryAfter - salaryCap)}`);
    }

    const team1ValueOut = team1PlayersOut.reduce((sum, p) => sum + p.player.projected_value, 0);
    const team1PickValueOut = team1PicksOut.reduce((sum, p) => sum + calculateDraftPickValue(p.year, p.round, currentYear), 0);
    const team1FptsOut = team1PlayersOut.reduce((sum, p) => sum + p.player.fpts_avg, 0);

    const team2ValueOut = team2PlayersOut.reduce((sum, p) => sum + p.player.projected_value, 0);
    const team2PickValueOut = team2PicksOut.reduce((sum, p) => sum + calculateDraftPickValue(p.year, p.round, currentYear), 0);
    const team2FptsOut = team2PlayersOut.reduce((sum, p) => sum + p.player.fpts_avg, 0);

    const hasAssets = team1PlayersOut.length > 0 || team1PicksOut.length > 0 ||
                      team2PlayersOut.length > 0 || team2PicksOut.length > 0;

    if (!hasAssets) {
      errors.push('Select players or picks to trade');
    } else if (team1PlayersOut.length === 0 && team1PicksOut.length === 0) {
      errors.push(`${team1Name} must include at least one asset`);
    } else if (team2PlayersOut.length === 0 && team2PicksOut.length === 0) {
      errors.push(`${team2Name} must include at least one asset`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      teamImpacts: [
        {
          teamId: '',
          teamName: team1Name,
          salaryOut: team1SalaryOut,
          salaryIn: team1SalaryIn,
          netSalaryChange: team1SalaryIn - team1SalaryOut,
          capSpaceAfter: salaryCap - team1SalaryAfter,
          isOverCap: team1OverCap,
          playersOut: team1PlayersOut,
          playersIn: team2PlayersOut,
          picksOut: team1PicksOut,
          picksIn: team2PicksOut,
          totalValueOut: team1ValueOut,
          totalValueIn: team2ValueOut,
          totalFptsOut: team1FptsOut,
          totalFptsIn: team2FptsOut,
          draftPickValueOut: team1PickValueOut,
          draftPickValueIn: team2PickValueOut,
        },
        {
          teamId: '',
          teamName: team2Name,
          salaryOut: team2SalaryOut,
          salaryIn: team2SalaryIn,
          netSalaryChange: team2SalaryIn - team2SalaryOut,
          capSpaceAfter: salaryCap - team2SalaryAfter,
          isOverCap: team2OverCap,
          playersOut: team2PlayersOut,
          playersIn: team1PlayersOut,
          picksOut: team2PicksOut,
          picksIn: team1PicksOut,
          totalValueOut: team2ValueOut,
          totalValueIn: team1ValueOut,
          totalFptsOut: team2FptsOut,
          totalFptsIn: team1FptsOut,
          draftPickValueOut: team2PickValueOut,
          draftPickValueIn: team1PickValueOut,
        },
      ],
    };
  }, [
    team1Name, team2Name,
    team1PlayersOut, team1PicksOut,
    team2PlayersOut, team2PicksOut,
    team1CurrentSalary, team2CurrentSalary,
    salaryCap, currentYear
  ]);

  const team1PickValue = analysis.teamImpacts[0].draftPickValueOut;
  const team2PickValue = analysis.teamImpacts[1].draftPickValueOut;

  // Calculate projected matchup scores before and after trade
  const team1BeforeScore = useMemo(() =>
    calculateProjectedMatchupScore(team1AllPlayers),
    [team1AllPlayers]
  );

  const team2BeforeScore = useMemo(() =>
    calculateProjectedMatchupScore(team2AllPlayers),
    [team2AllPlayers]
  );

  // After trade: remove outgoing players, add incoming players
  const team1AfterPlayers = useMemo(() => {
    const outIds = new Set(team1PlayersOut.map(p => p.id));
    const remaining = team1AllPlayers.filter(p => !outIds.has(p.id));
    return [...remaining, ...team2PlayersOut];
  }, [team1AllPlayers, team1PlayersOut, team2PlayersOut]);

  const team2AfterPlayers = useMemo(() => {
    const outIds = new Set(team2PlayersOut.map(p => p.id));
    const remaining = team2AllPlayers.filter(p => !outIds.has(p.id));
    return [...remaining, ...team1PlayersOut];
  }, [team2AllPlayers, team2PlayersOut, team1PlayersOut]);

  const team1AfterScore = useMemo(() =>
    calculateProjectedMatchupScore(team1AfterPlayers),
    [team1AfterPlayers]
  );

  const team2AfterScore = useMemo(() =>
    calculateProjectedMatchupScore(team2AfterPlayers),
    [team2AfterPlayers]
  );

  const team1ScoreDiff = team1AfterScore - team1BeforeScore;
  const team2ScoreDiff = team2AfterScore - team2BeforeScore;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4" data-testid="trade-analysis-panel">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-text">Trade Analysis</h3>
        {isAnalyzing && (
          <span className="text-xs text-text-muted animate-pulse">Analyzing...</span>
        )}
      </div>

      {analysis.errors.length > 0 && (
        <Alert variant="error" data-testid="analysis-errors">
          <ul className="list-disc list-inside space-y-1">
            {analysis.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {analysis.warnings.length > 0 && (
        <Alert variant="warning" data-testid="analysis-warnings">
          <ul className="list-disc list-inside space-y-1">
            {analysis.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text">Projected Matchup Impact</h4>
        <p className="text-xs text-text-muted">
          Based on top 11 players avg x 9 starters x 3.25 games
        </p>

        <div className="grid grid-cols-2 gap-4">
          <MatchupImpactCard
            teamName={team1Name}
            beforeScore={team1BeforeScore}
            afterScore={team1AfterScore}
            scoreDiff={team1ScoreDiff}
          />
          <MatchupImpactCard
            teamName={team2Name}
            beforeScore={team2BeforeScore}
            afterScore={team2AfterScore}
            scoreDiff={team2ScoreDiff}
          />
        </div>

        {(team1PickValue > 0 || team2PickValue > 0) && (
          <ValueComparison
            label="Draft Pick Value"
            team1Value={team1PickValue}
            team2Value={team2PickValue}
            team1Name={team1Name}
            team2Name={team2Name}
            formatter={(v) => `${v.toFixed(0)} pts`}
          />
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <h4 className="text-sm font-medium text-text">Salary Impact</h4>
        {analysis.teamImpacts.map((impact, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">{impact.teamName}</span>
              <span className={impact.isOverCap ? 'text-danger-400' : 'text-text'}>
                {formatCurrency(impact.capSpaceAfter)} cap space
              </span>
            </div>
            <Progress
              value={salaryCap - impact.capSpaceAfter}
              max={salaryCap}
              size="sm"
              variant={impact.isOverCap ? 'danger' : impact.capSpaceAfter < salaryCap * 0.1 ? 'warning' : 'default'}
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>
                {impact.netSalaryChange >= 0 ? '+' : ''}{formatCurrency(impact.netSalaryChange)}
              </span>
              <span>{formatCurrency(salaryCap - impact.capSpaceAfter)} / {formatCurrency(salaryCap)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
