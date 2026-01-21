import logging

from django.core.management.base import BaseCommand
from django.db import transaction
from league.models import League, Player
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
)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Sync NBA players from ESPN to the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--league_id",
            type=str,
            help="Django league UUID (optional, uses first league if not provided)",
        )
        parser.add_argument(
            "--year",
            type=int,
            help="Season year (optional, defaults to current season)",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=1000,
            help="Max players to fetch (default 1000)",
        )

    def handle(self, *args, **options):
        league_id = options.get("league_id")
        year = options.get("year")
        limit = options.get("limit")

        try:
            if league_id:
                league = League.objects.get(id=league_id)
            else:
                league = League.objects.first()
                if not league:
                    self.stderr.write(self.style.ERROR("No leagues found in database"))
                    return

            self.stdout.write(f"Using league: {league.name} (ID: {league.id})")

            if year:
                original_year = league.year
                league.year = year
                self.stdout.write(f"Using year: {year}")

            ensure_positions_exist()
            self.stdout.write("Positions ensured")

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
            finally:
                if year:
                    league.year = original_year

            all_players = {}

            self.stdout.write("Fetching free agents...")
            try:
                free_agents = espn_league.free_agents(size=limit)
                for player in free_agents:
                    player_id = get_espn_player_id(player)
                    if player_id:
                        all_players[player_id] = player
                self.stdout.write(f"Found {len(free_agents)} free agents")
            except Exception as e:
                self.stderr.write(
                    self.style.WARNING(f"Error fetching free agents: {e}")
                )

            self.stdout.write("Fetching rostered players...")
            try:
                for team in espn_league.teams:
                    roster = getattr(team, "roster", [])
                    for player in roster:
                        player_id = get_espn_player_id(player)
                        if player_id and player_id not in all_players:
                            all_players[player_id] = player
                self.stdout.write(f"Total unique players found: {len(all_players)}")
            except Exception as e:
                self.stderr.write(
                    self.style.WARNING(f"Error fetching rostered players: {e}")
                )

            if not all_players:
                self.stderr.write(self.style.WARNING("No players found to sync"))
                return

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

            self.stdout.write(
                f"Processing {created_count} new, {updated_count} existing players..."
            )

            with transaction.atomic():
                if players_to_create:
                    Player.objects.bulk_create(players_to_create)
                    self.stdout.write(f"Created {len(players_to_create)} new players")

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
                    self.stdout.write(
                        f"Updated {len(players_to_update)} existing players"
                    )

                for player, positions in position_assignments:
                    if positions:
                        player.positions.set(positions)

            self.stdout.write(
                self.style.SUCCESS(
                    f"\nSync complete!\n"
                    f"  Created: {created_count}\n"
                    f"  Updated: {updated_count}\n"
                    f"  Total: {created_count + updated_count}"
                )
            )

        except League.DoesNotExist:
            self.stderr.write(
                self.style.ERROR(f"League not found with ID: {league_id}")
            )
        except Exception as e:
            logger.exception("Error during player sync")
            self.stderr.write(self.style.ERROR(f"Sync failed: {e}"))
