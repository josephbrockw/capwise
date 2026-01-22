import config from '@/config';
import { apiClient } from './client';

// ============================================================================
// Types
// ============================================================================

export interface SalaryEscalationSettings {
  rookie_year_salary: number;
  year_2_4_multiplier: number;
  year_5_plus_multiplier: number;
}

export interface League {
  id: string;
  name: string;
  year: number;
  salary_cap: number;
  min_salary: number;
  roster_size: number;
  commissioner_id: string;
  draft_open: boolean;
  last_sync_date: string | null;
  needs_sync: boolean;
  salary_escalation_settings: SalaryEscalationSettings;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  owner_id: string;
  owner_name: string;
  wins: number;
  losses: number;
  standing: number;
  current_salary: number;
  cap_space: number;
  logo_url: string | null;
}

export interface RosterPlayerDetail {
  id: string;
  player: {
    id: string;
    player_id: number;
    name: string;
    positions: string[];
    nba_team: string;
    projected_value: number;
    fpts_avg: number;
    pts_avg: number;
    reb_avg: number;
    ast_avg: number;
    stl_avg: number;
    blk_avg: number;
    to_avg: number;
    fg_pct: number;
    ft_pct: number;
    three_pct: number;
    gp: number;
    is_injured: boolean;
  };
  salary: number;
  is_keeper: boolean;
  keeper_years: number;
  acquired_by_draft: boolean;
  trade_blocked: boolean;
}

export interface TeamDetail extends Team {
  league: League;
  roster: RosterPlayerDetail[];
  draft_picks: TeamDraftPick[];
}

export interface PlayerStats {
  games_played: number;
  minutes_per_game: number;
  points_per_game: number;
  rebounds_per_game: number;
  assists_per_game: number;
  steals_per_game: number;
  blocks_per_game: number;
  turnovers_per_game: number;
  field_goal_pct: number;
  three_point_pct: number;
  free_throw_pct: number;
  fantasy_points_avg: number;
}

export interface Player {
  id: string;
  name: string;
  positions: string[];
  nba_team: string;
  projected_value: number;
  is_injured: boolean;
  injury_status: string | null;
  on_roster: boolean;
  stats: PlayerStats | null;
}

export interface RosterPlayer {
  id: string;
  player: Player;
  team_id: string;
  salary: number;
  contract_years: number;
  is_franchise_tagged: boolean;
  acquired_date: string;
}

export interface DraftPick {
  id: string;
  league_id: string;
  original_team_id: string;
  original_team_name: string;
  current_team_id: string;
  current_team_name: string;
  year: number;
  round: number;
  pick_number: number | null;
  is_owned: boolean;
}

export interface TeamDraftPick {
  id: string;
  year: number;
  round: number;
  pick_number: number | null;
  projected_number: number | null;
  original_team_id: string;
  original_team_name: string;
  current_team_id: string;
  is_rostered: boolean;
}

export interface Rookie {
  id: string;
  player: Player;
  draft_year: number;
  draft_round: number;
  draft_pick: number;
  drafted_by_team_id: string | null;
  drafted_by_team_name: string | null;
}

export interface TradeAsset {
  id: string;
  type: 'player' | 'draft_pick';
  player?: Player;
  draft_pick?: DraftPick;
  from_team_id: string;
  from_team_name: string;
  to_team_id: string;
  to_team_name: string;
}

export interface TradeTeam {
  team_id: string;
  team_name: string;
  assets_sent: TradeAsset[];
  assets_received: TradeAsset[];
}

export interface Trade {
  id: string;
  league_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  proposed_at: string;
  resolved_at: string | null;
  proposed_by_team_id: string;
  teams: TradeTeam[];
  notes: string | null;
}

export interface TradeAnalysis {
  is_valid: boolean;
  validation_errors: string[];
  team_impacts: {
    team_id: string;
    team_name: string;
    salary_change: number;
    cap_space_after: number;
    roster_count_after: number;
  }[];
}

export interface LotteryOdds {
  team_id: string;
  team_name: string;
  position: number;
  odds: number;
  wins: number;
  losses: number;
}

export interface LotteryResult {
  id: string;
  year: number;
  executed_at: string;
  executed_by: string | null;
  first_pick_team_id: string;
  first_pick_team_name: string;
  second_pick_team_id: string;
  second_pick_team_name: string;
  results: {
    lottery_teams: {
      team_id: string;
      team_name: string;
      original_position: number;
      original_odds: number;
    }[];
    final_order: {
      pick_number: number;
      team_id: string;
      team_name: string;
      moved: boolean;
    }[];
  };
}

export interface SyncStatus {
  last_sync_date: string | null;
  needs_sync: boolean;
}

export interface SyncResult {
  status: string;
  message: string;
  players_created?: number;
  players_updated?: number;
  rosters_synced?: number;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PlayerSearchParams {
  search?: string;
  position?: string;
  on_roster?: boolean;
  is_injured?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface DraftPickParams {
  year?: number;
  round?: number;
  team_id?: string;
}

export interface TradeParams {
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  team_id?: string;
}

export interface TradeCreatePayload {
  teams: {
    team_id: string;
    players_to_send: string[];
    draft_picks_to_send: string[];
  }[];
  notes?: string;
}

export interface TradeAnalysisPayload {
  teams: {
    team_id: string;
    players_to_send: string[];
    draft_picks_to_send: string[];
  }[];
}

export interface SyncRequestPayload {
  sync_type: 'full' | 'players' | 'rosters';
  force?: boolean;
}

// ============================================================================
// Helper to create team context header
// ============================================================================

function teamContextHeader(teamId: string): Record<string, string> {
  return { 'X-Team-Context': teamId };
}

function buildQueryString(params: object): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================================
// League API Functions
// ============================================================================

export async function getLeagues(): Promise<League[]> {
  return apiClient.get<League[]>(config.api.routes.league.list, true);
}

export async function getLeague(id: string): Promise<League> {
  return apiClient.get<League>(config.api.routes.league.detail(id), true);
}

// ============================================================================
// Team API Functions
// ============================================================================

export async function getTeams(teamId: string): Promise<Team[]> {
  return apiClient.get<Team[]>(
    config.api.routes.league.teams,
    true,
    teamContextHeader(teamId)
  );
}

export async function getTeam(id: string, teamId: string): Promise<TeamDetail> {
  return apiClient.get<TeamDetail>(
    config.api.routes.league.teamDetail(id),
    true,
    teamContextHeader(teamId)
  );
}

// ============================================================================
// Player API Functions
// ============================================================================

export async function getPlayers(
  teamId: string,
  params: PlayerSearchParams = {}
): Promise<PaginatedResponse<Player>> {
  const qs = buildQueryString(params);
  return apiClient.get<PaginatedResponse<Player>>(
    `${config.api.routes.league.players}${qs}`,
    true,
    teamContextHeader(teamId)
  );
}

export async function getPlayer(id: string, teamId: string): Promise<Player> {
  return apiClient.get<Player>(
    config.api.routes.league.playerDetail(id),
    true,
    teamContextHeader(teamId)
  );
}

// ============================================================================
// Roster API Functions
// ============================================================================

export async function getRoster(teamId: string): Promise<RosterPlayer[]> {
  return apiClient.get<RosterPlayer[]>(
    config.api.routes.league.roster,
    true,
    teamContextHeader(teamId)
  );
}

// ============================================================================
// Draft Pick API Functions
// ============================================================================

export async function getDraftPicks(
  teamId: string,
  params: DraftPickParams = {}
): Promise<DraftPick[]> {
  const qs = buildQueryString(params);
  return apiClient.get<DraftPick[]>(
    `${config.api.routes.league.draftPicks}${qs}`,
    true,
    teamContextHeader(teamId)
  );
}

// ============================================================================
// Rookie API Functions
// ============================================================================

export async function getRookies(teamId: string): Promise<Rookie[]> {
  return apiClient.get<Rookie[]>(
    config.api.routes.league.rookies,
    true,
    teamContextHeader(teamId)
  );
}

// ============================================================================
// Trade API Functions
// ============================================================================

export async function getTrades(
  teamId: string,
  params: TradeParams = {}
): Promise<Trade[]> {
  const qs = buildQueryString(params);
  return apiClient.get<Trade[]>(
    `${config.api.routes.league.trades}${qs}`,
    true,
    teamContextHeader(teamId)
  );
}

export async function getTrade(id: string, teamId: string): Promise<Trade> {
  return apiClient.get<Trade>(
    config.api.routes.league.tradeDetail(id),
    true,
    teamContextHeader(teamId)
  );
}

export async function createTrade(
  teamId: string,
  payload: TradeCreatePayload
): Promise<Trade> {
  return apiClient.post<Trade>(
    config.api.routes.league.trades,
    payload,
    true,
    teamContextHeader(teamId)
  );
}

export async function acceptTrade(id: string, teamId: string): Promise<Trade> {
  return apiClient.post<Trade>(
    `${config.api.routes.league.tradeDetail(id)}/accept`,
    undefined,
    true,
    teamContextHeader(teamId)
  );
}

export async function rejectTrade(id: string, teamId: string): Promise<Trade> {
  return apiClient.post<Trade>(
    `${config.api.routes.league.tradeDetail(id)}/reject`,
    undefined,
    true,
    teamContextHeader(teamId)
  );
}

export async function cancelTrade(id: string, teamId: string): Promise<Trade> {
  return apiClient.post<Trade>(
    `${config.api.routes.league.tradeDetail(id)}/cancel`,
    undefined,
    true,
    teamContextHeader(teamId)
  );
}

export async function analyzeTrade(
  teamId: string,
  payload: TradeAnalysisPayload
): Promise<TradeAnalysis> {
  return apiClient.post<TradeAnalysis>(
    `${config.api.routes.league.trades}/analyze`,
    payload,
    true,
    teamContextHeader(teamId)
  );
}

// ============================================================================
// ESPN Sync API Functions
// ============================================================================

export async function triggerSync(
  teamId: string,
  payload: SyncRequestPayload
): Promise<SyncResult> {
  return apiClient.post<SyncResult>(
    config.api.routes.league.sync,
    payload,
    true,
    teamContextHeader(teamId)
  );
}

export async function getSyncStatus(teamId: string): Promise<SyncStatus> {
  return apiClient.get<SyncStatus>(
    config.api.routes.league.syncStatus,
    true,
    teamContextHeader(teamId)
  );
}

// ============================================================================
// Lottery API Functions
// ============================================================================

export async function runLottery(teamId: string): Promise<LotteryResult> {
  return apiClient.post<LotteryResult>(
    config.api.routes.league.lotteryRun,
    undefined,
    true,
    teamContextHeader(teamId)
  );
}

export async function getLotteryOdds(teamId: string): Promise<LotteryOdds[]> {
  return apiClient.get<LotteryOdds[]>(
    config.api.routes.league.lotteryOdds,
    true,
    teamContextHeader(teamId)
  );
}

export async function getLotteryResults(
  teamId: string,
  year?: number
): Promise<LotteryResult> {
  const qs = year ? `?year=${year}` : '';
  return apiClient.get<LotteryResult>(
    `${config.api.routes.league.lotteryResults}${qs}`,
    true,
    teamContextHeader(teamId)
  );
}
