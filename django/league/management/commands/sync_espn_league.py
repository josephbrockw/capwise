import logging

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
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


class Command(BaseCommand):
    help = "Sync teams and rosters from ESPN to the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--league_id",
            type=str,
            help="Django league UUID (optional, uses first league if not provided)",
        )
        parser.add_argument(
            "--force-update",
            action="store_true",
            help="Bypass the 6-hour sync cooldown",
        )

    def handle(self, *args, **options):
        league_id = options.get("league_id")
        force_update = options.get("force_update", False)

        try:
            if league_id:
                league = League.objects.get(id=league_id)
            else:
                league = League.objects.first()
                if not league:
                    self.stderr.write(self.style.ERROR("No leagues found in database"))
                    return

            self.stdout.write(f"Using league: {league.name} (ID: {league.id})")

            if not force_update and not should_sync(league):
                self.stdout.write(
                    self.style.WARNING(
                        "League was synced recently. Use --force-update to bypass."
                    )
                )
                return

            ensure_positions_exist()
            position_mapping = get_position_mapping()

            try:
                espn_league = create_espn_league_connection(league)
                self.stdout.write(
                    self.style.SUCCESS("Connected to ESPN API successfully")
                )
            except Exception as e:
                self.stderr.write(
                    self.style.ERROR(f"Failed to connect to ESPN API: {e}")
                )
                return

            with transaction.atomic():
                if hasattr(espn_league, "settings") and espn_league.settings:
                    espn_name = getattr(espn_league.settings, "name", None)
                    if espn_name and espn_name != league.name:
                        old_name = league.name
                        league.name = espn_name
                        league.save(update_fields=["name"])
                        self.stdout.write(
                            f"Updated league name: '{old_name}' -> '{espn_name}'"
                        )

                teams_created = 0
                teams_updated = 0
                players_added = 0
                players_removed = 0

                for espn_team in espn_league.teams:
                    espn_team_id = getattr(espn_team, "team_id", None)
                    if not espn_team_id:
                        continue

                    team, created = Team.objects.get_or_create(
                        league=league,
                        espn_team_id=espn_team_id,
                        defaults={
                            "name": getattr(
                                espn_team, "team_name", f"Team {espn_team_id}"
                            )
                        },
                    )

                    if created:
                        placeholder_email = (
                            f"espn_user_{espn_team_id}@placeholder.local"
                        )
                        owner, _ = User.objects.get_or_create(
                            email=placeholder_email,
                            defaults={"username": f"espn_user_{espn_team_id}"},
                        )
                        team.owner = owner
                        teams_created += 1
                        self.stdout.write(f"Created team: {team.name}")
                    else:
                        teams_updated += 1

                    team.name = getattr(espn_team, "team_name", team.name)
                    team.abbreviation = getattr(
                        espn_team, "team_abbrev", team.abbreviation
                    )
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

            self.stdout.write(
                self.style.SUCCESS(
                    f"\nSync complete!\n"
                    f"  Teams created: {teams_created}\n"
                    f"  Teams updated: {teams_updated}\n"
                    f"  Roster players added: {players_added}\n"
                    f"  Roster players removed: {players_removed}"
                )
            )

        except League.DoesNotExist:
            self.stderr.write(
                self.style.ERROR(f"League not found with ID: {league_id}")
            )
        except Exception as e:
            logger.exception("Error during league sync")
            self.stderr.write(self.style.ERROR(f"Sync failed: {e}"))
