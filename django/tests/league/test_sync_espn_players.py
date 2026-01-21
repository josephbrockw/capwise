from io import StringIO
from unittest.mock import MagicMock, patch

from django.core.management import call_command
from django.test import TestCase
from league.models import League, Player, Position


class SyncEspnPlayersCommandTest(TestCase):
    def setUp(self):
        self.league = League.objects.create(
            name="Test League",
            year=2024,
            salary_cap=1000,
            min_salary=1,
            roster_size=15,
            espn_league_id=12345,
            espn_s2="test_s2",
            espn_swid="test_swid",
        )

        Position.objects.get_or_create(code="PG", defaults={"name": "Point Guard"})
        Position.objects.get_or_create(code="SG", defaults={"name": "Shooting Guard"})

    def _create_mock_espn_player(
        self, player_id, name, pro_team="LAL", injury_status="ACTIVE"
    ):
        mock_player = MagicMock()
        mock_player.playerId = player_id
        mock_player.name = name
        mock_player.proTeam = pro_team
        mock_player.injuryStatus = injury_status
        mock_player.eligibleSlots = [0, 1]
        mock_player.stats = {}
        mock_player.avg_points = 25.0
        return mock_player

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_creates_new_players(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = [
            self._create_mock_espn_player(1001, "LeBron James"),
            self._create_mock_espn_player(1002, "Stephen Curry", "GSW"),
        ]
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.assertEqual(Player.objects.count(), 2)
        self.assertTrue(Player.objects.filter(player_id=1001).exists())
        self.assertTrue(Player.objects.filter(player_id=1002).exists())

        lebron = Player.objects.get(player_id=1001)
        self.assertEqual(lebron.name, "LeBron James")
        self.assertEqual(lebron.nba_team, "LAL")

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_updates_existing_players(self, mock_create_connection):
        existing_player = Player.objects.create(
            player_id=1001,
            name="LeBron James",
            nba_team="CLE",
            fpts_avg=20.0,
        )

        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = [
            self._create_mock_espn_player(1001, "LeBron James", "LAL"),
        ]
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            stdout=out,
        )

        existing_player.refresh_from_db()
        self.assertEqual(existing_player.nba_team, "LAL")
        self.assertEqual(existing_player.fpts_avg, 25.0)

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_includes_rostered_players(self, mock_create_connection):
        mock_team = MagicMock()
        mock_team.roster = [
            self._create_mock_espn_player(2001, "Kevin Durant", "PHX"),
        ]

        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = [
            self._create_mock_espn_player(1001, "LeBron James"),
        ]
        mock_espn_league.teams = [mock_team]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.assertEqual(Player.objects.count(), 2)
        self.assertTrue(Player.objects.filter(player_id=2001).exists())

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_deduplicates_players(self, mock_create_connection):
        mock_team = MagicMock()
        mock_team.roster = [
            self._create_mock_espn_player(1001, "LeBron James"),
        ]

        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = [
            self._create_mock_espn_player(1001, "LeBron James"),
        ]
        mock_espn_league.teams = [mock_team]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.assertEqual(Player.objects.count(), 1)

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_sets_injury_status(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = [
            self._create_mock_espn_player(1001, "Injured Player", injury_status="OUT"),
            self._create_mock_espn_player(
                1002, "Healthy Player", injury_status="ACTIVE"
            ),
        ]
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            stdout=out,
        )

        injured = Player.objects.get(player_id=1001)
        healthy = Player.objects.get(player_id=1002)

        self.assertTrue(injured.is_injured)
        self.assertFalse(healthy.is_injured)

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_assigns_positions(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = [
            self._create_mock_espn_player(1001, "LeBron James"),
        ]
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            stdout=out,
        )

        player = Player.objects.get(player_id=1001)
        position_codes = list(player.positions.values_list("code", flat=True))

        self.assertIn("PG", position_codes)
        self.assertIn("SG", position_codes)

    def test_sync_no_league_found(self):
        League.objects.all().delete()

        out = StringIO()
        err = StringIO()
        call_command("sync_espn_players", stdout=out, stderr=err)

        self.assertIn("No leagues found", err.getvalue())

    def test_sync_league_not_found_by_id(self):
        out = StringIO()
        err = StringIO()
        call_command(
            "sync_espn_players",
            league_id="00000000-0000-0000-0000-000000000000",
            stdout=out,
            stderr=err,
        )

        self.assertIn("League not found", err.getvalue())

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_handles_espn_connection_error(self, mock_create_connection):
        mock_create_connection.side_effect = Exception("ESPN API error")

        out = StringIO()
        err = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            stdout=out,
            stderr=err,
        )

        self.assertIn("Failed to connect to ESPN API", err.getvalue())

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_with_year_override(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = []
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_players",
            league_id=str(self.league.id),
            year=2023,
            stdout=out,
        )

        self.assertIn("Using year: 2023", out.getvalue())

    @patch("league.management.commands.sync_espn_players.create_espn_league_connection")
    def test_sync_uses_first_league_when_no_id(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.free_agents.return_value = []
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command("sync_espn_players", stdout=out)

        self.assertIn(self.league.name, out.getvalue())
