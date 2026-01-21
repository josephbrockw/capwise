import logging
from dataclasses import dataclass
from typing import Literal

from django.contrib.auth import get_user_model
from django.db import transaction
from league.models import League, Player, RosterPlayer, Team
from league.utils.espn_utils import (
    create_espn_league_connection,
    ensure_positions_exist,
    extract_player_stats,
    get_espn_player_id,
    get_espn_player_name,
    get_espn_player_team,
    get_player_positions,
    get_position_mapping,
    is_player_injured,
    should_sync,
    update_sync_timestamp,
)

logger = logging.getLogger(__name__)
User = get_user_model()

SyncType = Literal["full", "players", "rosters"]


@dataclass
class SyncResult:
    success: bool
    message: str
    players_created: int = 0
    players_updated: int = 0
    teams_created: int = 0
    teams_updated: int = 0
    roster_players_added: int = 0
    roster_players_removed: int = 0


def sync_players(league: League, espn_league, limit: int = 1000) -> SyncResult:
    """Sync players from ESPN to database."""
    position_mapping = get_position_mapping()
    all_players = {}

    try:
        free_agents = espn_league.free_agents(size=limit)
        for player in free_agents:
            player_id = get_espn_player_id(player)
            if player_id:
                all_players[player_id] = player
    except Exception as e:
        logger.warning(f"Error fetching free agents: {e}")

    try:
        for team in espn_league.teams:
            roster = getattr(team, "roster", [])
            for player in roster:
                player_id = get_espn_player_id(player)
                if player_id and player_id not in all_players:
                    all_players[player_id] = player
    except Exception as e:
        logger.warning(f"Error fetching rostered players: {e}")

    if not all_players:
        return SyncResult(success=True, message="No players found to sync")

    existing_players = {
        p.player_id: p
        for p in Player.objects.filter(
            player_id__in=list(all_players.keys())
        ).prefetch_related("positions")
    }

    players_to_create = []
    players_to_update = []
    position_assignments = []
    created_count = 0
    updated_count = 0

    for espn_id, espn_player in all_players.items():
        name = get_espn_player_name(espn_player)
        nba_team = get_espn_player_team(espn_player)
        injured = is_player_injured(espn_player)
        stats = extract_player_stats(espn_player)
        positions = get_player_positions(espn_player, position_mapping)

        if espn_id in existing_players:
            player = existing_players[espn_id]
            player.name = name
            player.nba_team = nba_team
            player.is_injured = injured
            player.fpts_avg = stats["fpts_avg"]
            player.pts_avg = stats["pts_avg"]
            player.reb_avg = stats["reb_avg"]
            player.ast_avg = stats["ast_avg"]
            player.stl_avg = stats["stl_avg"]
            player.blk_avg = stats["blk_avg"]
            player.to_avg = stats["to_avg"]
            player.fg_pct = stats["fg_pct"]
            player.ft_pct = stats["ft_pct"]
            player.three_pct = stats["three_pct"]
            player.gp = stats["gp"]
            players_to_update.append(player)
            position_assignments.append((player, positions))
            updated_count += 1
        else:
            player = Player(
                player_id=espn_id,
                name=name,
                nba_team=nba_team,
                is_injured=injured,
                fpts_avg=stats["fpts_avg"],
                pts_avg=stats["pts_avg"],
                reb_avg=stats["reb_avg"],
                ast_avg=stats["ast_avg"],
                stl_avg=stats["stl_avg"],
                blk_avg=stats["blk_avg"],
                to_avg=stats["to_avg"],
                fg_pct=stats["fg_pct"],
                ft_pct=stats["ft_pct"],
                three_pct=stats["three_pct"],
                gp=stats["gp"],
            )
            players_to_create.append(player)
            position_assignments.append((player, positions))
            created_count += 1

    with transaction.atomic():
        if players_to_create:
            Player.objects.bulk_create(players_to_create)

        if players_to_update:
            Player.objects.bulk_update(
                players_to_update,
                fields=[
                    "name",
                    "nba_team",
                    "is_injured",
                    "fpts_avg",
                    "pts_avg",
                    "reb_avg",
                    "ast_avg",
                    "stl_avg",
                    "blk_avg",
                    "to_avg",
                    "fg_pct",
                    "ft_pct",
                    "three_pct",
                    "gp",
                ],
            )

        for player, positions in position_assignments:
            if positions:
                player.positions.set(positions)

    return SyncResult(
        success=True,
        message=f"Synced {created_count + updated_count} players",
        players_created=created_count,
        players_updated=updated_count,
    )


def sync_rosters(league: League, espn_league) -> SyncResult:
    """Sync teams and rosters from ESPN to database."""
    position_mapping = get_position_mapping()
    teams_created = 0
    teams_updated = 0
    players_added = 0
    players_removed = 0

    with transaction.atomic():
        if hasattr(espn_league, "settings") and espn_league.settings:
            espn_name = getattr(espn_league.settings, "name", None)
            if espn_name and espn_name != league.name:
                league.name = espn_name
                league.save(update_fields=["name"])

        for espn_team in espn_league.teams:
            espn_team_id = getattr(espn_team, "team_id", None)
            if not espn_team_id:
                continue

            team, created = Team.objects.get_or_create(
                league=league,
                espn_team_id=espn_team_id,
                defaults={
                    "name": getattr(espn_team, "team_name", f"Team {espn_team_id}")
                },
            )

            if created:
                placeholder_email = f"espn_user_{espn_team_id}@placeholder.local"
                owner, _ = User.objects.get_or_create(
                    email=placeholder_email,
                    defaults={"username": f"espn_user_{espn_team_id}"},
                )
                team.owner = owner
                teams_created += 1
            else:
                teams_updated += 1

            team.name = getattr(espn_team, "team_name", team.name)
            team.abbreviation = getattr(espn_team, "team_abbrev", team.abbreviation)
            team.logo_url = getattr(espn_team, "logo_url", team.logo_url)
            team.wins = getattr(espn_team, "wins", team.wins)
            team.losses = getattr(espn_team, "losses", team.losses)
            team.standing = getattr(espn_team, "standing", team.standing)
            team.save()

            roster = getattr(espn_team, "roster", [])
            current_roster_player_ids = set()

            for espn_player in roster:
                player_id = get_espn_player_id(espn_player)
                if not player_id:
                    continue

                player, player_created = Player.objects.get_or_create(
                    player_id=player_id,
                    defaults={
                        "name": get_espn_player_name(espn_player),
                        "nba_team": get_espn_player_team(espn_player),
                        "is_injured": is_player_injured(espn_player),
                    },
                )

                if not player_created:
                    player.name = get_espn_player_name(espn_player)
                    player.nba_team = get_espn_player_team(espn_player)
                    player.is_injured = is_player_injured(espn_player)

                    stats = extract_player_stats(espn_player)
                    player.fpts_avg = stats["fpts_avg"]
                    player.pts_avg = stats["pts_avg"]
                    player.reb_avg = stats["reb_avg"]
                    player.ast_avg = stats["ast_avg"]
                    player.stl_avg = stats["stl_avg"]
                    player.blk_avg = stats["blk_avg"]
                    player.to_avg = stats["to_avg"]
                    player.fg_pct = stats["fg_pct"]
                    player.ft_pct = stats["ft_pct"]
                    player.three_pct = stats["three_pct"]
                    player.gp = stats["gp"]
                    player.save()

                positions = get_player_positions(espn_player, position_mapping)
                if positions:
                    player.positions.set(positions)

                roster_player, rp_created = RosterPlayer.objects.get_or_create(
                    fantasy_team=team,
                    player=player,
                    defaults={"salary": league.min_salary},
                )

                if rp_created:
                    players_added += 1

                current_roster_player_ids.add(roster_player.id)

            removed_count = (
                RosterPlayer.objects.filter(fantasy_team=team)
                .exclude(id__in=current_roster_player_ids)
                .delete()[0]
            )
            players_removed += removed_count

        update_sync_timestamp(league)

    return SyncResult(
        success=True,
        message="Roster sync completed",
        teams_created=teams_created,
        teams_updated=teams_updated,
        roster_players_added=players_added,
        roster_players_removed=players_removed,
    )


def run_espn_sync(
    league: League,
    sync_type: SyncType = "full",
    force: bool = False,
) -> SyncResult:
    """
    Run ESPN sync for a league.

    This function is designed to be easily converted to a Celery task later.

    Args:
        league: The League to sync
        sync_type: Type of sync - "full", "players", or "rosters"
        force: Bypass sync cooldown check

    Returns:
        SyncResult with status and counts
    """
    if not force and not should_sync(league):
        return SyncResult(
            success=False,
            message="League was synced recently. Use force=True to bypass.",
        )

    ensure_positions_exist()

    try:
        espn_league = create_espn_league_connection(league)
    except Exception as e:
        logger.exception("Failed to connect to ESPN API")
        return SyncResult(success=False, message=f"ESPN connection failed: {str(e)}")

    try:
        if sync_type == "players":
            result = sync_players(league, espn_league)
        elif sync_type == "rosters":
            result = sync_rosters(league, espn_league)
        else:
            players_result = sync_players(league, espn_league)
            rosters_result = sync_rosters(league, espn_league)
            result = SyncResult(
                success=players_result.success and rosters_result.success,
                message="Full sync completed",
                players_created=players_result.players_created,
                players_updated=players_result.players_updated,
                teams_created=rosters_result.teams_created,
                teams_updated=rosters_result.teams_updated,
                roster_players_added=rosters_result.roster_players_added,
                roster_players_removed=rosters_result.roster_players_removed,
            )

        return result

    except Exception as e:
        logger.exception("Sync failed")
        return SyncResult(success=False, message=f"Sync failed: {str(e)}")
