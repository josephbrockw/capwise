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

export interface UserTeam {
  id: string;
  name: string;
  league_id: string;
  league_name: string;
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
  year: number;
  round: number;
  pick_number: number | null;
  projected_number: number | null;
  original_team_id: string;
  original_team_name: string;
  current_team_id: string;
  current_team_name: string;
  assigned_name: string | null;
  is_rostered: boolean;
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

export interface RookieListItem {
  id: string;
  name: string;
  nba_team: string;
  rookie_rank: number | null;
  rookie_year: number | null;
  positions: string[];
  player_id: string | null;
}

export interface Rookie {
  id: string;
  name: string;
  nba_team: string;
  rookie_rank: number | null;
  rookie_year: number | null;
  positions: string[];
  player: {
    id: string;
    name: string;
    nba_team: string;
  } | null;
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
  status: 'proposed' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  created_at: string;
  executed_at: string | null;
  proposed_by: string;
  proposed_by_name: string;
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
  espn_league_id?: string;
}

export interface SyncResult {
  status: string;
  message: string;
  players_created?: number;
  players_updated?: number;
  teams_created?: number;
  teams_updated?: number;
  roster_players_added?: number;
  roster_players_removed?: number;
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
  name?: string;
  position?: string;
  rostered?: boolean;
  is_injured?: boolean;
  min_projected_value?: number;
  max_projected_value?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface DraftPickParams {
  year?: number;
  round?: number;
  team_id?: string;
  original_team_id?: string;
}

export interface RookieParams {
  rookie_year?: number;
  position?: string;
  available?: boolean;
}

export interface DraftPickDetail {
  id: string;
  year: number;
  round: number;
  pick_number: number | null;
  projected_number: number | null;
  original_team: { id: string; name: string; abbreviation: string };
  current_team: { id: string; name: string; abbreviation: string };
  player: { id: string; name: string; nba_team: string } | null;
  rookie: RookieListItem | null;
  is_rostered: boolean;
}

export interface TradeParams {
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  team_id?: string;
}

export interface TradeAssetPayload {
  from_team: string;
  to_team: string;
  player_id?: string | null;
  draft_pick_id?: string | null;
}

export interface TradeCreatePayload {
  league_id: string;
  teams: string[];
  assets: TradeAssetPayload[];
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
// User Team API Functions
// ============================================================================

export async function getMyTeams(): Promise<UserTeam[]> {
  return apiClient.get<UserTeam[]>(config.api.routes.user.myTeams, true);
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

export async function getRookies(
  teamId: string,
  params: RookieParams = {}
): Promise<RookieListItem[]> {
  const qs = buildQueryString(params);
  return apiClient.get<RookieListItem[]>(
    `${config.api.routes.league.rookies}${qs}`,
    true,
    teamContextHeader(teamId)
  );
}

export async function getDraftPickDetail(
  teamId: string,
  pickId: string
): Promise<DraftPickDetail> {
  return apiClient.get<DraftPickDetail>(
    `${config.api.routes.league.draftPicks}/${pickId}`,
    true,
    teamContextHeader(teamId)
  );
}

export async function makePick(
  teamId: string,
  pickId: string,
  rookieId: string
): Promise<DraftPickDetail> {
  return apiClient.patch<DraftPickDetail>(
    `${config.api.routes.league.draftPicks}/${pickId}`,
    { rookie_id: rookieId },
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

export async function respondToTrade(
  id: string,
  teamId: string,
  action: 'accept' | 'reject' | 'cancel'
): Promise<Trade> {
  return apiClient.post<Trade>(
    `${config.api.routes.league.tradeDetail(id)}/respond`,
    { action },
    true,
    teamContextHeader(teamId)
  );
}

export async function acceptTrade(id: string, teamId: string): Promise<Trade> {
  return respondToTrade(id, teamId, 'accept');
}

export async function rejectTrade(id: string, teamId: string): Promise<Trade> {
  return respondToTrade(id, teamId, 'reject');
}

export async function cancelTrade(id: string, teamId: string): Promise<Trade> {
  return respondToTrade(id, teamId, 'cancel');
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

// ============================================================================
// Admin API Functions
// ============================================================================

export interface RosterPlayerUpdate {
  salary?: number;
  is_keeper?: boolean;
  trade_blocked?: boolean;
}

export async function updateRosterPlayer(
  teamId: string,
  rosterPlayerId: string,
  updates: RosterPlayerUpdate
): Promise<RosterPlayerDetail> {
  return apiClient.patch<RosterPlayerDetail>(
    `${config.api.routes.league.roster}/${rosterPlayerId}`,
    updates,
    true,
    teamContextHeader(teamId)
  );
}

export interface DraftPickUpdate {
  pick_number?: number;
  projected_number?: number;
  current_team_id?: string;
  rookie_id?: string;
}

export async function updateDraftPick(
  teamId: string,
  draftPickId: string,
  updates: DraftPickUpdate
): Promise<DraftPick> {
  return apiClient.patch<DraftPick>(
    `${config.api.routes.league.draftPicks}/${draftPickId}`,
    updates,
    true,
    teamContextHeader(teamId)
  );
}

export interface PlayerUpdate {
  projected_value?: number;
  positions?: string[];
  is_injured?: boolean;
}

export async function updatePlayer(
  teamId: string,
  playerId: string,
  updates: PlayerUpdate
): Promise<Player> {
  return apiClient.patch<Player>(
    `${config.api.routes.league.playerDetail(playerId)}`,
    updates,
    true,
    teamContextHeader(teamId)
  );
}

export interface RookieCreate {
  name: string;
  nba_team: string;
  positions: string[];
  rookie_rank?: number;
  rookie_year: number;
}

export async function createRookie(
  teamId: string,
  data: RookieCreate
): Promise<Rookie> {
  return apiClient.post<Rookie>(
    config.api.routes.league.rookies,
    data,
    true,
    teamContextHeader(teamId)
  );
}

export interface RookieUpdate {
  name?: string;
  nba_team?: string;
  positions?: string[];
  rookie_rank?: number;
  player_id?: string;
}

export async function updateRookie(
  teamId: string,
  rookieId: string,
  updates: RookieUpdate
): Promise<Rookie> {
  return apiClient.patch<Rookie>(
    `${config.api.routes.league.rookies}/${rookieId}`,
    updates,
    true,
    teamContextHeader(teamId)
  );
}

export async function deleteRookie(
  teamId: string,
  rookieId: string
): Promise<void> {
  return apiClient.delete<void>(
    `${config.api.routes.league.rookies}/${rookieId}`,
    true,
    teamContextHeader(teamId)
  );
}

export interface LeagueSettingsUpdate {
  salary_cap?: number;
  min_salary?: number;
  roster_size?: number;
  draft_open?: boolean;
  salary_escalation_settings?: SalaryEscalationSettings;
}

export async function updateLeagueSettings(
  leagueId: string,
  updates: LeagueSettingsUpdate
): Promise<League> {
  return apiClient.patch<League>(
    config.api.routes.league.detail(leagueId),
    updates,
    true
  );
}
