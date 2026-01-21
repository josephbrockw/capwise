# Fantasy Basketball Dynasty League App - Windsurf Prompts

This document contains a series of prompts for Windsurf to build a fantasy basketball dynasty league management application. The app is built on the BaseBuild template (Django + Next.js + PostgreSQL).

**Key Architecture Decisions:**
- Django backend with PostgreSQL (deployed on Render)
- Next.js frontend (deployed on Vercel or Render)
- ESPN API integration via Python `espn_api` library
- Team context header (`X-Team-Context`) for scoping all requests
- Commissioner admin functionality built into the app (not Django admin)

---

## Phase 1: Core Data Models (Done)

### Prompt 1.1: Create Fantasy Basketball Models (Done)

```
I'm building a fantasy basketball dynasty league app on top of the BaseBuild template. Create the core Django models in a new app called `league`.

Create these models following BaseBuild patterns (UUID primary keys, proper relationships):

1. **League**
   - id: UUID (primary key)
   - name: CharField(100)
   - year: IntegerField (the season end year, e.g., 2025 for 2024-25 season)
   - salary_cap: IntegerField (default=1000)
   - min_salary: IntegerField (default=1)
   - roster_size: IntegerField (default=16)
   - commissioner: ForeignKey to User (SET_NULL, nullable)
   - draft_open: BooleanField (default=False)
   - ESPN integration fields:
     - espn_league_id: IntegerField
     - espn_s2: TextField (nullable, for private leagues)
     - espn_swid: CharField(100, nullable)
     - espn_owner_mapping: JSONField (default=dict)
     - last_sync_date: DateTimeField (nullable)
   - Salary escalation settings (JSONField with defaults):
     - rookie_year_salary: 1
     - year_2_4_multiplier: 0.80
     - year_5_plus_multiplier: 0.90
   - unique_together: (name, year), (espn_league_id, year)

2. **Team**
   - id: UUID (primary key)
   - league: ForeignKey to League (CASCADE)
   - name: CharField(100, nullable)
   - owner: ForeignKey to User (CASCADE, nullable)
   - abbreviation: CharField(10, nullable)
   - logo_url: URLField (nullable)
   - wins, losses, standing: IntegerField (default=0)
   - espn_team_id: IntegerField
   - unique_together: (league, espn_team_id)

3. **Position**
   - code: CharField(5, primary_key=True) - e.g., 'PG', 'SG', 'SF', 'PF', 'C'
   - name: CharField(50)

4. **Player**
   - id: UUID (primary key)
   - player_id: IntegerField (unique, nullable) - ESPN player ID
   - name: CharField(100)
   - positions: ManyToMany to Position
   - nba_team: CharField(50, blank)
   - projected_value: FloatField (default=0)
   - rookie_year: IntegerField (nullable)
   - Stats fields (all FloatField, default=0, nullable):
     - fpts_avg, pts_avg, reb_avg, ast_avg, stl_avg, blk_avg, to_avg, fg_pct, ft_pct, three_pct, gp (games played)
   - is_injured: BooleanField (default=False, nullable)

5. **RosterPlayer**
   - id: UUID (primary key)
   - fantasy_team: ForeignKey to Team (CASCADE)
   - player: ForeignKey to Player (CASCADE)
   - salary: IntegerField
   - is_keeper: BooleanField (default=False)
   - keeper_years: IntegerField (default=0)
   - acquired_by_draft: BooleanField (default=False)
   - trade_blocked: BooleanField (default=False)
   - unique_together: (fantasy_team, player)

6. **Rookie**
   - id: UUID (primary key)
   - name: CharField(100)
   - nba_team: CharField(100)
   - player: ForeignKey to Player (SET_NULL, nullable) - linked after drafted
   - rookie_rank: IntegerField (nullable)
   - rookie_year: IntegerField (nullable)
   - positions: ManyToMany to Position

7. **DraftPick**
   - id: UUID (primary key)
   - league: ForeignKey to League (CASCADE)
   - original_team: ForeignKey to Team (CASCADE, related_name='original_picks')
   - current_team: ForeignKey to Team (CASCADE, related_name='current_picks')
   - year: IntegerField
   - round: IntegerField
   - pick_number: IntegerField (nullable) - set after lottery
   - projected_number: IntegerField (nullable)
   - player: ForeignKey to Player (CASCADE, nullable) - set when pick is used
   - rookie: ForeignKey to Rookie (SET_NULL, nullable)
   - is_rostered: BooleanField (default=False)
   - unique_together: (league, year, original_team, round)

Add useful model properties:
- Team.current_salary (sum of roster salaries)
- Team.cap_space (salary_cap - current_salary)
- Player.position_list (comma-separated position codes)
- Player.on_roster (bool if on any roster)
- Player.calculated_salary(years_on_roster) method using league escalation settings
- League.current_season property
- League.get_current_season() classmethod

Create the migration and a data migration to seed the Position table with: PG, SG, SF, PF, C, G, F, UTIL.

Register all models in admin.py for Django admin access.
```

### Prompt 1.2: Create Trade History Models (Done)

```
Add trade tracking models to the league app:

1. **Trade**
   - id: UUID (primary key)
   - league: ForeignKey to League (CASCADE)
   - created_at: DateTimeField (auto_now_add)
   - executed_at: DateTimeField (nullable) - when trade was completed
   - status: CharField with choices: 'proposed', 'accepted', 'rejected', 'completed', 'cancelled'
   - proposed_by: ForeignKey to User (SET_NULL, nullable)
   - notes: TextField (blank)

2. **TradeTeam**
   - id: UUID (primary key)
   - trade: ForeignKey to Trade (CASCADE, related_name='trade_teams')
   - team: ForeignKey to Team (CASCADE)
   - Represents each team involved in the trade

3. **TradeAsset**
   - id: UUID (primary key)
   - trade: ForeignKey to Trade (CASCADE, related_name='assets')
   - from_team: ForeignKey to Team (CASCADE, related_name='outgoing_trade_assets')
   - to_team: ForeignKey to Team (CASCADE, related_name='incoming_trade_assets')
   - player: ForeignKey to Player (SET_NULL, nullable)
   - draft_pick: ForeignKey to DraftPick (SET_NULL, nullable)
   - Either player OR draft_pick should be set, not both

Add a method on Trade model:
- execute() - moves players between rosters, updates draft pick ownership, sets status to 'completed'
- validate() - checks salary cap implications, returns dict with warnings/errors

Create the migration.
```

---

## Phase 2: Team Context & Permissions (Done)

### Prompt 2.1: Team Context Middleware and Permissions (Done)

```
Create middleware and permissions for team context in the api app:

1. **TeamContextMiddleware** (api/middleware.py):
   - Reads `X-Team-Context` header from requests
   - Looks up the Team by UUID
   - Attaches `request.team` to the request object
   - If header is missing or invalid, `request.team` is None
   - For authenticated users, validate they own the team or are league commissioner

2. **Permission Classes** (api/permissions.py):
   - `HasTeamContext` - requires valid team context header
   - `IsTeamOwner` - user must own the team in context
   - `IsLeagueCommissioner` - user must be commissioner of the team's league
   - `IsTeamOwnerOrCommissioner` - either of the above

3. **User model extension**:
   Add to the User model (or create a profile):
   - `default_team`: ForeignKey to Team (nullable) - user's last selected team
   - Method `get_teams()` - returns all teams user owns across all leagues
   - Method `get_leagues()` - returns all leagues user participates in

4. Add the middleware to Django settings MIDDLEWARE list.

Create a simple mixin for views that require team context:
```python
class TeamContextMixin:
    def get_team(self):
        return getattr(self.request, 'team', None)

    def get_league(self):
        team = self.get_team()
        return team.league if team else None
```


---

## Phase 3: Core API Endpoints (Done)

### Prompt 3.1: League and Team API Endpoints (Done)

Create API endpoints for leagues and teams following BaseBuild patterns (StandardViewSet, StandardResponse):

**File: api/views/league.py**

1. **LeagueViewSet** (StandardViewSet):
   - list: Returns leagues the authenticated user participates in
   - retrieve: Returns league details with teams, settings
   - partial_update: Commissioner only - update league settings

   Serializers needed:
   - LeagueListSerializer (id, name, year, team_count)
   - LeagueDetailSerializer (all fields, nested teams summary)
   - LeagueSettingsSerializer (salary_cap, min_salary, roster_size, salary_escalation_settings)

2. **TeamViewSet** (StandardViewSet):
   - Requires team context via `HasTeamContext` permission
   - list: Returns all teams in the current league context
   - retrieve: Returns team details with full roster
   - Nested route: /teams/{id}/roster/ - detailed roster with player stats

   Serializers needed:
   - TeamListSerializer (id, name, abbreviation, owner_name, wins, losses, standing, current_salary, cap_space)
   - TeamDetailSerializer (all fields, roster summary)
   - TeamRosterSerializer (roster_players with full player details and salary)

**File: api/views/player.py**

3. **PlayerViewSet** (StandardViewSet):
   - list: Search/filter players (name, position, team, rostered status, min/max projected_value)
   - retrieve: Player details with stats, current roster status
   - partial_update: Commissioner only - update projected_value, positions

   Serializers:
   - PlayerListSerializer (id, name, positions, nba_team, projected_value, fpts_avg, is_injured, on_roster)
   - PlayerDetailSerializer (all fields including stats, roster_entry if exists)

Add pagination (StandardPagination with page_size=50) for player list.

Register routes in config/urls.py under /api/league/.

### Prompt 3.2: Roster Management API (Done)

Create roster management endpoints in api/views/roster.py:

1. **RosterViewSet** (StandardViewSet):
   - Requires `IsTeamOwnerOrCommissioner` permission
   - list: Returns roster for team in context
   - create: Add a free agent to roster (validates salary cap in-season)
   - destroy: Release player from roster

   POST /roster/
   - player_id: UUID
   - salary: Integer
   - Validates: player not already rostered, salary >= min_salary
   - If pre-season (draft_open=False), no cap check
   - If in-season, check cap space

   DELETE /roster/{roster_player_id}/
   - Removes player from roster

2. **RosterPlayer update** (PATCH /roster/{id}/):
   - Update salary (commissioner only)
   - Update is_keeper, keeper_years, trade_blocked

Serializers:
- RosterPlayerSerializer (id, player details, salary, is_keeper, keeper_years, acquired_by_draft, trade_blocked)
- RosterPlayerCreateSerializer (player_id, salary)
- RosterPlayerUpdateSerializer (salary, is_keeper, keeper_years, trade_blocked)

Add a batch endpoint for commissioner:
POST /roster/batch-update/
- Updates multiple roster entries at once (useful for bulk salary changes)

### Prompt 3.3: Draft Picks API (Done)

Create draft pick management endpoints in api/views/draft.py:

1. **DraftPickViewSet** (StandardViewSet):
   - list: Filter by league, year, team (original or current), round
   - retrieve: Pick details with rookie if assigned
   - partial_update: Commissioner can update pick_number, projected_number, assign rookie

   Query params for list:
   - league_id (required via team context)
   - year (optional, defaults to next 3 years)
   - team_id (optional, filter by current_team)
   - original_team_id (optional)
   - round (optional)

2. **RookieViewSet** (StandardViewSet):
   - list: Filter by rookie_year, position, available (not linked to player)
   - retrieve: Rookie details
   - create: Commissioner only - add new rookie
   - partial_update: Commissioner only - update rank, link to player
   - destroy: Commissioner only

Serializers:
- DraftPickListSerializer (id, year, round, pick_number, original_team, current_team, player/rookie name if assigned)
- DraftPickDetailSerializer (all fields with nested team and player/rookie details)
- RookieSerializer (all fields with positions)

Add endpoint for draft pick ownership history (if we want to track trades):
GET /draft-picks/{id}/history


### Prompt 3.4: Trade API Endpoints (Done)


Create trade management endpoints in api/views/trade.py:

1. **TradeViewSet** (StandardViewSet):
   - list: Trades involving teams in user's leagues, filter by status
   - retrieve: Full trade details with all assets
   - create: Propose a new trade
   - partial_update: Update status (accept, reject, cancel)

   POST /trades/ - Create trade proposal:
   ```json
   {
     "league_id": "uuid",
     "teams": ["team_uuid_1", "team_uuid_2"],
     "assets": [
       {"from_team": "uuid", "to_team": "uuid", "player_id": "uuid"},
       {"from_team": "uuid", "to_team": "uuid", "draft_pick_id": "uuid"}
     ],
     "notes": "optional note"
   }
   ```

2. **Trade Analysis endpoint**:
   POST /trades/analyze/
   - Same payload as create but doesn't save
   - Returns: salary impact for each team, cap warnings, trade value analysis

   Response includes:
   - Per team: current_salary, salary_after_trade, cap_space_after
   - Warnings: over cap, under min roster, etc.
   - Player stats comparison (total fpts, etc.)

3. **Execute trade** (commissioner only):
   POST /trades/{id}/execute/
   - Validates trade is in 'accepted' status
   - Calls trade.execute() method
   - Returns updated trade

Serializers:
- TradeListSerializer (id, status, created_at, teams involved, summary)
- TradeDetailSerializer (all fields with nested assets and team details)
- TradeAssetSerializer (player/pick details, from/to teams)
- TradeAnalysisSerializer (salary impacts, warnings, value analysis)

Filter trades by:
- league (via team context)
- status
- team_id (any involvement)
- date range


---

## Phase 4: ESPN Sync Integration

### Prompt 4.1: ESPN Utility Functions (Done)

Create ESPN integration utilities in league/utils/espn_utils.py:

1. **Position mapping**:
```python
STANDARD_POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL']

ESPN_POSITION_MAP = {
    0: 'PG', 1: 'SG', 2: 'SF', 3: 'PF', 4: 'C',
    5: 'G',   # PG/SG
    6: 'F',   # SF/PF
    7: 'UTIL',
    # Add other ESPN slot IDs as needed
}

def ensure_positions_exist():
    """Create Position records if they don't exist"""

def get_position_mapping():
    """Returns dict mapping ESPN position IDs to Position objects"""

def get_player_positions(espn_player_data, position_mapping):
    """Extract positions from ESPN player data, returns list of Position objects"""
```

2. **ESPN API helpers**:
```python
def create_espn_league_connection(league):
    """Create ESPNLeague instance from our League model"""
    from espn_api.basketball import League as ESPNLeague
    return ESPNLeague(
        league_id=league.espn_league_id,
        year=league.year,
        espn_s2=league.espn_s2,
        swid=league.espn_swid
    )

def extract_player_stats(espn_player):
    """Extract stats from ESPN player object, returns dict"""
    # fpts_avg, pts, reb, ast, stl, blk, to, fg%, ft%, 3p%, gp
```

3. **Sync status tracking** (optional model or use League.last_sync_date):
```python
def should_sync(league, hours=6):
    """Returns True if league should be synced (hasn't synced in X hours)"""
```

### Prompt 4.2: ESPN Player Sync Command (Done)

Create Django management command: league/management/commands/sync_espn_players.py

This command syncs NBA players from ESPN to our database.

Arguments:
- --league_id: Django league UUID (optional, uses first league if not provided)
- --year: Season year (optional, defaults to current year)
- --limit: Max players to fetch (default 1000)

Logic:
1. Get league from database (by ID or first available)
2. Ensure positions exist via ensure_positions_exist()
3. Connect to ESPN API via create_espn_league_connection()
4. Fetch all players:
   - Free agents from espn_league.free_agents()
   - Rostered players from each team's roster
   - Deduplicate by playerId
5. For each player:
   - If new: bulk create list
   - If exists: update name, nba_team, stats, is_injured
   - Map and save positions
6. Use transaction.atomic() for database operations
7. Log progress and summary

Handle errors gracefully with logging. Use the existing sync_espn_players.py as reference but adapt to the new model structure with stats fields.

Example usage:
```bash
python manage.py sync_espn_players --league_id=abc123 --limit=500
```

### Prompt 4.3: ESPN League Sync Command (Done)

Create Django management command: league/management/commands/sync_espn_league.py

This command syncs teams and rosters from ESPN.

Arguments:
- --league_id: Django league UUID (optional)
- --force-update: Bypass the 6-hour sync cooldown

Logic:
1. Get league from database
2. Check sync cooldown (skip if synced within 6 hours unless --force-update)
3. Connect to ESPN API
4. Update league name if changed on ESPN
5. For each ESPN team:
   - Find existing team by espn_team_id OR create new
   - If creating new team, create a placeholder user (espn_user_{team_id}@placeholder.local)
   - Update team: name, abbreviation, logo_url, wins, losses, standing
6. For each team's roster:
   - Get or create Player record
   - Set player positions from ESPN data
   - Get or create RosterPlayer with min_salary for new players
   - Track current roster IDs
   - Remove RosterPlayer entries for players no longer on roster
7. Update league.last_sync_date
8. Log all operations

Important: Do NOT reset salaries for existing roster players - only set min_salary for newly added players.

Use the existing sync_espn_league.py as reference.

### Prompt 4.4: ESPN Sync API Endpoint (Done)

Create an API endpoint for commissioners to trigger ESPN sync:

**File: api/views/espn_sync.py**

POST /api/league/sync
- Requires `IsLeagueCommissioner` permission
- Request body:
  ```json
  {
    "sync_type": "full" | "players" | "rosters",
    "force": false
  }
  ```
- Runs the appropriate sync in the background (use Celery if enabled, otherwise synchronous)
- Returns: { "status": "started", "message": "Sync initiated" }

GET /api/league/sync/status/
- Returns last_sync_date and whether sync is needed

For synchronous execution (if Celery not enabled):
- Call the management command logic directly
- Return results in response

Add to League serializer: `last_sync_date`, `needs_sync` (computed from last_sync_date > 24 hours ago)

---

## Phase 5: Draft Lottery System

### Prompt 5.1: Draft Lottery Implementation

Create draft lottery system in league/services/lottery.py:

The lottery determines the top 2 picks for the rookie draft. Non-playoff teams participate, with worse records having better odds.

1. **Lottery odds configuration** (store in League model or settings):
```python
DEFAULT_LOTTERY_ODDS = {
    # Position by record (1 = worst): percentage chance for #1 pick
    1: 25.0,  # Worst record
    2: 20.0,
    3: 15.0,
    4: 12.0,
    5: 10.0,
    6: 8.0,
    7: 5.0,
    8: 3.0,
    9: 1.5,
    10: 0.5,
}
```

2. **LotteryResult model**:
- id: UUID
- league: ForeignKey to League
- year: IntegerField
- executed_at: DateTimeField
- executed_by: ForeignKey to User
- results: JSONField - stores full lottery results
- first_pick_team: ForeignKey to Team
- second_pick_team: ForeignKey to Team

3. **Lottery service functions**:
```python
def get_lottery_teams(league):
    """Returns non-playoff teams ordered by record (worst first)"""
    # Determine playoff teams (top X by standing)
    # Return remaining teams

def run_lottery(league, user):
    """
    Executes the draft lottery.
    Returns LotteryResult with first and second pick winners.
    Also updates DraftPick.pick_number for all first-round picks.
    """
    # 1. Get eligible teams
    # 2. Run weighted random selection for pick 1
    # 3. Remove winner, run again for pick 2
    # 4. Assign remaining picks by inverse record
    # 5. Create LotteryResult record
    # 6. Update DraftPick records for the year

def get_lottery_odds(league):
    """Returns dict of team -> odds for display"""
```

4. **API Endpoint** (api/views/lottery.py):

POST /api/league/lottery/run/
- Requires `IsLeagueCommissioner`
- Validates: lottery hasn't been run for this year, draft not yet started
- Returns: LotteryResult with all pick assignments

GET /api/league/lottery/odds/
- Returns current teams and their lottery odds

GET /api/league/lottery/results/
- Returns LotteryResult for current/specified year

---

## Phase 6: Frontend - Foundation

### Prompt 6.1: API Client Extensions

Extend the Next.js API client (next/src/api/) to support the fantasy basketball endpoints:

**File: next/src/api/league.ts**

Create typed API functions following the existing client.ts patterns:

```typescript
// Types
interface League {
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
  salary_escalation_settings: {
    rookie_year_salary: number;
    year_2_4_multiplier: number;
    year_5_plus_multiplier: number;
  };
}

interface Team {
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

interface Player {
  id: string;
  name: string;
  positions: string[];
  nba_team: string;
  projected_value: number;
  is_injured: boolean;
  on_roster: boolean;
  stats: PlayerStats;
}

// ... more types for RosterPlayer, DraftPick, Trade, etc.

// API Functions
export async function getLeagues(): Promise<League[]>
export async function getLeague(id: string): Promise<League>
export async function getTeams(leagueId: string): Promise<Team[]>
export async function getTeam(id: string): Promise<TeamDetail>
export async function getPlayers(params: PlayerSearchParams): Promise<PaginatedResponse<Player>>
export async function getRoster(teamId: string): Promise<RosterPlayer[]>
export async function getDraftPicks(params: DraftPickParams): Promise<DraftPick[]>
export async function getTrades(params: TradeParams): Promise<Trade[]>
export async function analyzeTrade(payload: TradeAnalysisPayload): Promise<TradeAnalysis>
// ... etc
```

All API calls should:
1. Include the X-Team-Context header from context (see next prompt)
2. Use the existing auth token handling from client.ts
3. Return typed responses
```

### Prompt 6.2: Team Context Provider

```
Create a React context for managing team selection:

**File: next/src/contexts/TeamContext.tsx**

```typescript
interface TeamContextValue {
  currentTeam: Team | null;
  currentLeague: League | null;
  userTeams: Team[];
  userLeagues: League[];
  setCurrentTeam: (team: Team) => void;
  switchLeague: (leagueId: string) => void;
  isCommissioner: boolean;
  isLoading: boolean;
}
```

Features:
1. Fetches user's teams and leagues on mount (when authenticated)
2. Persists selected team ID to localStorage
3. Restores selection on page load
4. Provides `isCommissioner` computed from currentTeam.league.commissioner_id === user.id
5. Exposes team ID for API requests

**File: next/src/api/client.ts** (modification)

Add team context header to all requests:
```typescript
// In the fetch wrapper, add:
const teamId = getTeamContextId(); // from localStorage or context
if (teamId) {
  headers['X-Team-Context'] = teamId;
}
```

Create a hook for easy access:
```typescript
// next/src/hooks/useTeam.ts
export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}
```

Wrap the app with TeamProvider in the root layout (after AuthProvider).

### Prompt 6.3: Navigation and Layout Updates

Update the navigation and layout for the fantasy basketball app:

**File: next/src/components/layout/AppLayout.tsx**

Create a new layout component for authenticated pages:
1. Navbar with:
   - App logo/name
   - Team selector dropdown (shows current team, allows switching)
   - League selector (if user is in multiple leagues)
   - User menu (profile, logout)
2. Sidebar navigation (collapsible on mobile):
   - Dashboard
   - My Team
   - League
   - Trade Machine
   - Rookie Draft
   - Free Agents
   - Admin (only if isCommissioner)
3. Mobile: Bottom navigation bar with key sections

Use existing bb/ components:
- Navbar, NavLink from bb/navigation
- Dropdown for team/league selectors
- Avatar for user menu

**File: next/src/config.ts**

Add routes configuration:
```typescript
export const routes = {
  dashboard: '/dashboard',
  team: (id: string) => `/team/${id}`,
  league: '/league',
  tradeMachine: '/trade-machine',
  rookieDraft: '/rookie-draft',
  freeAgents: '/free-agents',
  admin: '/admin',
};
```

Update the existing dashboard page to use AppLayout.

---

## Phase 7: Frontend - Core Pages

### Prompt 7.1: Dashboard Page

Create the main dashboard page at next/src/app/dashboard/page.tsx:

The dashboard shows an overview of the user's team and league status.

Sections:
1. **Team Summary Card**
   - Team name, record (W-L), standing
   - Salary: $X / $Y cap ($Z space)
   - Visual salary cap bar (progress bar component)
   - Quick links: View Roster, Trade Machine

2. **League Status Card**
   - Current phase indicator (Free Agency / Regular Season / Playoffs / Draft)
   - Days until next phase (if applicable)
   - League sync status with "Sync Now" button for commissioner

3. **Roster Snapshot**
   - Top 5 players by projected value
   - Injured player alerts
   - Expiring keepers or salary concerns

4. **Recent Activity**
   - Recent trades in the league (last 5)
   - Recent roster moves

5. **Quick Actions**
   - Search Free Agents
   - View Draft Picks
   - Propose Trade

Use components:
- Container, Stack, Flex from bb/layout
- Card component (create if not exists, or use styled div)
- Progress from bb/data-display for salary bar
- Badge for status indicators
- Table for roster snapshot

Make it mobile-responsive with a single-column layout on small screens.

### Prompt 7.2: Team Detail Page

Create the team detail page at next/src/app/team/[id]/page.tsx:

This page shows full details for any team (own or other teams in league).

**URL params:** id (team UUID)

Sections:
1. **Team Header**
   - Team logo (or placeholder), name, owner name
   - Record and standing
   - Salary situation with cap bar

2. **Roster Table**
   - Columns: Player Name, Position(s), NBA Team, Salary, FPTS Avg, Keeper Status
   - Sortable columns
   - If viewing own team: Edit button for each player (opens modal)
   - Mobile: Card view instead of table

3. **Draft Capital**
   - Upcoming draft picks (next 3 years)
   - Show: Year, Round, Original Team (if different)
   - Picks received via trade highlighted

4. **Team Stats Summary**
   - Total projected value
   - Average FPTS
   - Position breakdown chart (optional)

5. **Trade History**
   - Trades involving this team
   - Expandable to see details

For own team, add action buttons:
- Edit Roster (commissioner or owner)
- Propose Trade

Create reusable components:
- RosterTable
- DraftPickList
- SalaryCapBar
- TeamHeader

### Prompt 7.3: League Page

Create the league overview page at next/src/app/league/page.tsx:

Shows league-wide information and standings.

Sections:
1. **League Header**
   - League name and year
   - Commissioner name
   - Key settings: Salary Cap, Min Salary, Roster Size

2. **Standings Table**
   - All teams ranked by standing
   - Columns: Rank, Team, Owner, W, L, Cap Space
   - Click team to go to team detail
   - Highlight current user's team
   - Mobile-friendly with horizontal scroll or card view

3. **League Leaders**
   - Tabs: Points, Rebounds, Assists, Steals, Blocks
   - Top 5 rostered players in each category
   - Shows player name, team, stat

4. **Recent Trades**
   - Last 10 trades with summary
   - Click to expand details

5. **Draft Pick Overview**
   - Visual draft board for upcoming year
   - Shows current pick owners
   - Tab to switch years

For commissioners, add:
- Settings button (opens modal/page to edit league settings)
- Sync button
- Run Lottery button (if applicable)

### Prompt 7.4: Free Agents Page

Create the free agents search page at next/src/app/free-agents/page.tsx:

Searchable, filterable list of available players.

Features:
1. **Search Bar**
   - Text search by player name
   - Debounced search (300ms)

2. **Filters** (collapsible on mobile)
   - Position: Multi-select (PG, SG, SF, PF, C)
   - NBA Team: Dropdown
   - Projected Value: Min/Max range inputs
   - Hide Injured: Toggle

3. **Results Table**
   - Columns: Name, Pos, NBA Team, Proj Value, FPTS, PTS, REB, AST
   - Sortable by any column
   - Pagination (50 per page)
   - "Add to Team" button (if user has cap space and roster space)

4. **Player Quick View**
   - Click player row to expand or show side panel
   - Full stats, injury status
   - "Add to Roster" button with salary input

5. **Comparison Mode** (nice to have)
   - Checkbox to select players
   - Compare button shows side-by-side stats

Create components:
- PlayerSearchFilters
- PlayerTable (reusable)
- PlayerQuickView modal/panel
- AddToRosterModal

Handle loading and empty states appropriately.

---

## Phase 8: Frontend - Trade Machine

### Prompt 8.1: Trade Machine Page

Create the trade machine at next/src/app/trade-machine/page.tsx:

Interactive tool for building and analyzing trades.

**Layout:**
Two-column layout (stacked on mobile) for the two teams involved.

**Team Selection:**
1. Left column: Your team (pre-selected from context)
2. Right column: Dropdown to select other team

**For each team column:**
1. **Available Players**
   - List of roster players
   - Checkbox to include in trade
   - Shows: Name, Salary, FPTS

2. **Available Draft Picks**
   - List of picks owned by team (next 7 years)
   - Checkbox to include in trade
   - Shows: Year, Round, Original Team

3. **Salary Summary**
   - Current salary
   - Salary after trade
   - Cap space after trade
   - Warning badge if over cap

**Trade Analysis Panel** (below or side):
1. Summary of what each team gives/receives
2. Salary impact visualization
3. Value analysis:
   - Total projected value exchanged
   - Total FPTS exchanged
   - Draft pick value (use simple round-based value)
4. Warnings/Errors:
   - Over salary cap (if in-season)
   - Under minimum roster
   - Trade blocked players

**Actions:**
- "Analyze Trade" button - refreshes analysis
- "Propose Trade" button - creates trade proposal
- "Reset" button - clears selections

Create components:
- TradeTeamColumn
- TradablePlayerList
- TradableDraftPickList
- TradeAnalysisPanel
- TradeSummary

### Prompt 8.2: Trade History and Detail Pages

Create trade-related pages:

**1. Trade History Page** (next/src/app/trades/page.tsx):

List of all trades in the league.

Features:
- Filter by status (all, completed, pending, rejected)
- Filter by team (any involvement)
- Sort by date
- Each trade shows:
  - Date
  - Teams involved
  - Brief summary (e.g., "Team A receives Player X, Team B receives Pick Y")
  - Status badge
  - Click to view details

**2. Trade Detail Page** (next/src/app/trades/[id]/page.tsx):

Full trade details.

Sections:
1. **Trade Header**
   - Status badge
   - Date created/executed
   - Proposed by user name

2. **Trade Breakdown**
   - For each team: what they give up, what they receive
   - Player cards with salary and stats
   - Draft pick cards

3. **Analysis at Time of Trade**
   - Salary impact
   - Value exchanged

4. **Actions** (based on status and user role):
   - If pending and user is other team's owner: Accept/Reject buttons
   - If pending and user is proposer: Cancel button
   - If accepted and user is commissioner: Execute button

Create components:
- TradeCard (for list view)
- TradeDetailView
- TradeActionButtons

---

## Phase 9: Frontend - Rookie Draft

### Prompt 9.1: Rookie Draft Page

Create the rookie draft page at next/src/app/rookie-draft/page.tsx:

Manages the rookie draft process.

**Tabs:**
1. Draft Board
2. Available Rookies
3. Draft Order / Lottery

**Tab 1: Draft Board**
- Visual draft board showing all picks
- Grid layout: Rounds as rows, pick positions as columns (or transpose on mobile)
- Each cell shows:
  - Pick number
  - Team with pick
  - If pick used: Rookie name selected
  - If pick available: "On the clock" indicator for current pick
- Commissioner can click available pick to make selection

**Tab 2: Available Rookies**
- List of rookies not yet drafted
- Columns: Rank, Name, Position, NBA Team
- Sortable and searchable
- Commissioner can drag-and-drop to reorder ranks
- Filter by position

**Tab 3: Draft Order / Lottery**
- If lottery not run:
  - Show teams and their odds
  - Commissioner sees "Run Lottery" button
- If lottery complete:
  - Show lottery results (who won picks 1 and 2)
  - Full draft order

**Commissioner Actions:**
- Run lottery (with confirmation modal)
- Make pick: Select rookie for current pick
- Reset draft (with major confirmation)

**Non-commissioner View:**
- Read-only draft board
- Can see available rookies
- Can see lottery odds/results

Create components:
- DraftBoard
- DraftPick cell
- RookieList
- LotteryOddsDisplay
- LotteryResultsDisplay
- MakePickModal

---

## Phase 10: Admin Section

### Prompt 10.1: Commissioner Admin Pages

Create admin section for commissioners at next/src/app/admin/:

**Layout:**
- Only accessible if isCommissioner is true
- Redirect to dashboard if not commissioner
- Sub-navigation: Roster Management, Draft Picks, Players, League Settings, Sync

**1. Roster Management** (/admin/rosters):
- Dropdown to select team
- Full roster table with edit capabilities
- For each player: Edit salary, keeper status, trade blocked
- Inline editing or modal
- Batch actions: Apply salary increases, mark keepers

**2. Draft Pick Management** (/admin/draft-picks):
- Filter by year
- Full list of picks
- Edit pick ownership (for recording trades made outside system)
- Set pick numbers manually
- Assign players to picks

**3. Player Management** (/admin/players):
- Search all players
- Edit: Projected value, positions, injury status
- Bulk update projected values (CSV import nice to have)
- Link/unlink players to rookies

**4. Rookie Management** (/admin/rookies):
- Add new rookies
- Edit rank, positions, link to player
- Delete rookies
- Import rookies (manual form for now)

**5. League Settings** (/admin/settings):
- Edit: salary_cap, min_salary, roster_size
- Edit salary escalation settings
- Edit ESPN credentials (masked)
- Toggle draft_open

**6. Sync Controls** (/admin/sync):
- Last sync date display
- Buttons: Sync Players, Sync Rosters, Full Sync
- Sync log/status display

Create components:
- AdminLayout (with sub-nav)
- EditableRosterTable
- DraftPickEditor
- PlayerEditor
- RookieForm
- LeagueSettingsForm
- SyncControls

### Prompt 10.2: Confirmation Modals and Audit Trail

Add safety features for admin actions:

**1. Confirmation Modals**

Create a reusable ConfirmActionModal that requires typing a confirmation phrase for destructive actions:

```typescript
interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmPhrase?: string; // If set, user must type this to confirm
  variant: 'warning' | 'danger';
}
```

Use for:
- Running lottery
- Executing trades
- Resetting draft
- Bulk roster changes
- Deleting data

**2. Admin Action Logging**

Create Django model for audit trail:

```python
class AdminAction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    league = models.ForeignKey(League, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action_type = models.CharField(max_length=50)  # 'roster_update', 'trade_execute', etc.
    description = models.TextField()
    details = models.JSONField(default=dict)  # Store before/after states
    created_at = models.DateTimeField(auto_now_add=True)
```

Add API endpoint:
GET /api/admin/actions/ - List recent admin actions (commissioner only)

Display recent actions in admin dashboard.

---

## Phase 11: Polish and Mobile Optimization

### Prompt 11.1: Mobile-First Refinements

Review and optimize all pages for mobile experience:

**Global Mobile Improvements:**

1. **Navigation**
   - Bottom tab bar for primary navigation on mobile
   - Hamburger menu for secondary items
   - Team selector accessible from header

2. **Tables → Cards**
   - Create CardList alternative view for all tables
   - Auto-switch based on screen size
   - Or provide toggle button

3. **Forms**
   - Full-width inputs on mobile
   - Stack form fields vertically
   - Large touch targets (min 44px)

4. **Modals**
   - Full-screen on mobile (slide up from bottom)
   - Easy dismiss gestures

5. **Trade Machine**
   - Stack team columns vertically on mobile
   - Collapsible sections
   - Sticky analyze button at bottom

**Specific Page Fixes:**

- Dashboard: Single column, collapsible cards
- Team Detail: Tabs for Roster/Draft Picks/Trades on mobile
- Free Agents: Filters in a slide-out drawer
- Draft Board: Horizontal scroll with sticky first column
- Admin: Bottom sheet for actions

Create/update components:
- ResponsiveTable (renders as cards on mobile)
- MobileDrawer (slide-out filter panel)
- BottomSheet (for modals on mobile)
- BottomNav (mobile tab bar)

Use Tailwind breakpoints consistently: sm:, md:, lg:

### Prompt 11.2: Loading States and Error Handling

Add consistent loading and error states across the app:

**1. Loading States**

Create loading skeletons for each main content type:
- TeamCardSkeleton
- PlayerRowSkeleton
- RosterTableSkeleton
- DraftBoardSkeleton
- TradeCardSkeleton

Use the existing Skeleton component from bb/feedback.

Add loading states to:
- All page initial loads
- Filter/search operations
- Form submissions
- Trade analysis

**2. Error Handling**

Create an ErrorBoundary wrapper for pages.

Create error display components:
- PageError (full page error with retry)
- SectionError (inline error for sections)
- FormError (form submission errors)

Handle specific error cases:
- Network errors: "Connection error. Please check your internet."
- 401/403: Redirect to login or show permission error
- 404: "Not found" with back navigation
- 500: "Something went wrong" with retry

**3. Empty States**

Use EmptyState component from bb/data-display for:
- No teams in league
- Empty roster
- No matching players in search
- No trades yet
- No draft picks

Each empty state should have:
- Relevant illustration or icon
- Helpful message
- Action button where applicable

**4. Toast Notifications**

Use Toast from bb/feedback for:
- Successful actions (trade proposed, player added)
- Errors that don't block the page
- Sync completion

Create a global toast context/hook for easy triggering.

---

## Deployment Notes

### Prompt 12.1: Deployment Configuration

Configure the app for deployment:

**Backend (Django on Render):**

1. Create render.yaml for backend service:
```yaml
services:
  - type: web
    name: fantasy-basketball-api
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
    startCommand: gunicorn config.wsgi:application
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: fantasy-basketball-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: "0"
      # ... other env vars

databases:
  - name: fantasy-basketball-db
    plan: free
```

2. Update Django settings for production:
- Use dj-database-url for DATABASE_URL
- Configure ALLOWED_HOSTS from env
- Set up whitenoise for static files
- CORS settings for frontend domain

**Frontend (Vercel or Render):**

1. For Vercel, create vercel.json if needed
2. Environment variables:
   - NEXT_PUBLIC_API_BASE_URL=https://your-api.onrender.com

3. Build settings:
   - Build command: npm run build
   - Output directory: .next

**Celery (if using):**

Add worker service to render.yaml:
```yaml
  - type: worker
    name: fantasy-basketball-worker
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: celery -A config worker --loglevel=info
```

**Environment Variables Checklist:**
- [ ] SECRET_KEY
- [ ] DATABASE_URL
- [ ] ALLOWED_HOSTS
- [ ] CORS_ALLOWED_ORIGINS
- [ ] FRONTEND_URL (for emails)
- [ ] ESPN credentials (if storing centrally)

---

## Summary: Prompt Order

Execute prompts in this order for best results:

1. **Phase 1:** Core models (1.1, 1.2)
2. **Phase 2:** Team context middleware (2.1)
3. **Phase 3:** Core API endpoints (3.1, 3.2, 3.3, 3.4)
4. **Phase 4:** ESPN sync (4.1, 4.2, 4.3, 4.4)
5. **Phase 5:** Draft lottery (5.1)
6. **Phase 6:** Frontend foundation (6.1, 6.2, 6.3)
7. **Phase 7:** Core pages (7.1, 7.2, 7.3, 7.4)
8. **Phase 8:** Trade machine (8.1, 8.2)
9. **Phase 9:** Rookie draft (9.1)
10. **Phase 10:** Admin section (10.1, 10.2)
11. **Phase 11:** Polish (11.1, 11.2)
12. **Phase 12:** Deployment (12.1)

After each phase, test the functionality before moving to the next. The API should be testable via curl/Postman before building frontend pages.
