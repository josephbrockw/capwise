from datetime import timedelta
from typing import Any

from django.utils import timezone
from league.models import Position

STANDARD_POSITIONS = ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL"]

ESPN_POSITION_MAP = {
    0: "PG",
    1: "SG",
    2: "SF",
    3: "PF",
    4: "C",
    5: "G",
    6: "F",
    7: "UTIL",
    8: "UTIL",
    9: "UTIL",
    10: "UTIL",
    11: "IR",
    12: "IR",
    13: "IR",
}


def ensure_positions_exist():
    """Create Position records if they don't exist."""
    position_data = {
        "PG": "Point Guard",
        "SG": "Shooting Guard",
        "SF": "Small Forward",
        "PF": "Power Forward",
        "C": "Center",
        "G": "Guard",
        "F": "Forward",
        "UTIL": "Utility",
    }

    for code, name in position_data.items():
        Position.objects.get_or_create(code=code, defaults={"name": name})


def get_position_mapping():
    """Returns dict mapping ESPN position IDs to Position objects."""
    ensure_positions_exist()

    position_objects = {pos.code: pos for pos in Position.objects.all()}

    mapping = {}
    for espn_id, code in ESPN_POSITION_MAP.items():
        if code in position_objects:
            mapping[espn_id] = position_objects[code]

    return mapping


def get_player_positions(espn_player_data: Any, position_mapping: dict):
    """Extract positions from ESPN player data, returns list of Position objects."""
    positions = []

    eligible_slots = getattr(espn_player_data, "eligibleSlots", [])

    for slot_id in eligible_slots:
        if slot_id in position_mapping:
            position = position_mapping[slot_id]
            if position not in positions and position.code != "UTIL":
                positions.append(position)

    return positions


def create_espn_league_connection(league):
    """Create ESPNLeague instance from our League model."""
    from espn_api.basketball import League as ESPNLeague

    return ESPNLeague(
        league_id=league.espn_league_id,
        year=league.year,
        espn_s2=league.espn_s2,
        swid=league.espn_swid,
    )


def extract_player_stats(espn_player) -> dict:
    """Extract stats from ESPN player object, returns dict."""
    stats = {
        "fpts_avg": 0.0,
        "pts_avg": 0.0,
        "reb_avg": 0.0,
        "ast_avg": 0.0,
        "stl_avg": 0.0,
        "blk_avg": 0.0,
        "to_avg": 0.0,
        "fg_pct": 0.0,
        "ft_pct": 0.0,
        "three_pct": 0.0,
        "gp": 0,
    }

    if hasattr(espn_player, "stats") and espn_player.stats:
        player_stats = espn_player.stats

        current_season_stats = None
        for stat_period, stat_data in player_stats.items():
            if "avg" in stat_data:
                current_season_stats = stat_data.get("avg", {})
                break
            if "total" in stat_data:
                current_season_stats = stat_data
                break

        if current_season_stats:
            avg_stats = current_season_stats.get("avg", current_season_stats)

            stats["pts_avg"] = avg_stats.get("PTS", 0.0)
            stats["reb_avg"] = avg_stats.get("REB", 0.0)
            stats["ast_avg"] = avg_stats.get("AST", 0.0)
            stats["stl_avg"] = avg_stats.get("STL", 0.0)
            stats["blk_avg"] = avg_stats.get("BLK", 0.0)
            stats["to_avg"] = avg_stats.get("TO", 0.0)
            stats["fg_pct"] = avg_stats.get("FG%", 0.0)
            stats["ft_pct"] = avg_stats.get("FT%", 0.0)
            stats["three_pct"] = avg_stats.get("3P%", 0.0)
            stats["gp"] = int(avg_stats.get("GP", 0))

            total_stats = current_season_stats.get("total", {})
            if total_stats:
                stats["fpts_avg"] = total_stats.get("FPTS", 0.0)
                if stats["gp"] > 0:
                    stats["fpts_avg"] = stats["fpts_avg"] / stats["gp"]

    if hasattr(espn_player, "avg_points"):
        stats["fpts_avg"] = espn_player.avg_points or 0.0

    return stats


def should_sync(league, hours: int = 6) -> bool:
    """Returns True if league should be synced (hasn't synced in X hours)."""
    if league.last_sync_date is None:
        return True

    threshold = timezone.now() - timedelta(hours=hours)
    return league.last_sync_date < threshold


def update_sync_timestamp(league):
    """Update the last_sync_date for a league."""
    league.last_sync_date = timezone.now()
    league.save(update_fields=["last_sync_date"])


def get_espn_player_id(espn_player) -> int | None:
    """Extract player ID from ESPN player object."""
    return getattr(espn_player, "playerId", None) or getattr(espn_player, "id", None)


def get_espn_player_name(espn_player) -> str:
    """Extract player name from ESPN player object."""
    return getattr(espn_player, "name", "") or ""


def get_espn_player_team(espn_player) -> str:
    """Extract NBA team from ESPN player object."""
    return getattr(espn_player, "proTeam", "") or ""


def is_player_injured(espn_player) -> bool:
    """Check if player is injured based on ESPN data."""
    injury_status = getattr(espn_player, "injuryStatus", "")
    return injury_status in ["OUT", "INJURY_RESERVE", "DOUBTFUL", "QUESTIONABLE"]
