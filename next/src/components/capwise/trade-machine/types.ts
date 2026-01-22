import { RosterPlayerDetail, TeamDraftPick, Team } from '@/api/league';

export interface TradablePlayer extends RosterPlayerDetail {
  isSelected: boolean;
}

export interface TradableDraftPick extends TeamDraftPick {
  isSelected: boolean;
}

export interface TradeTeamData {
  team: Team;
  players: TradablePlayer[];
  draftPicks: TradableDraftPick[];
  currentSalary: number;
  salaryCap: number;
}

export interface TradeSelection {
  teamId: string;
  playerIds: string[];
  draftPickIds: string[];
}

export interface TeamTradeImpact {
  teamId: string;
  teamName: string;
  salaryOut: number;
  salaryIn: number;
  netSalaryChange: number;
  capSpaceAfter: number;
  isOverCap: boolean;
  playersOut: TradablePlayer[];
  playersIn: TradablePlayer[];
  picksOut: TradableDraftPick[];
  picksIn: TradableDraftPick[];
  totalValueOut: number;
  totalValueIn: number;
  totalFptsOut: number;
  totalFptsIn: number;
  draftPickValueOut: number;
  draftPickValueIn: number;
}

export interface TradeAnalysisResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  teamImpacts: TeamTradeImpact[];
}

export function calculateDraftPickValue(year: number, round: number, currentYear: number): number {
  const yearsAway = year - currentYear;
  const baseValue = round === 1 ? 100 : round === 2 ? 50 : round === 3 ? 25 : 10;
  const depreciationFactor = Math.max(0.5, 1 - yearsAway * 0.1);
  return Math.round(baseValue * depreciationFactor);
}
