from datetime import timedelta
from io import StringIO
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from league.models import League, Player, Position, RosterPlayer, Team

User = get_user_model()


class SyncEspnLeagueCommandTest(TestCase):
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
            last_sync_date=None,
        )

        Position.objects.get_or_create(code="PG", defaults={"name": "Point Guard"})
        Position.objects.get_or_create(code="SG", defaults={"name": "Shooting Guard"})

    def _create_mock_espn_team(self, team_id, team_name, roster=None):
        mock_team = MagicMock()
        mock_team.team_id = team_id
        mock_team.team_name = team_name
        mock_team.team_abbrev = team_name[:3].upper()
        mock_team.logo_url = f"http://example.com/logo_{team_id}.png"
        mock_team.wins = 10
        mock_team.losses = 5
        mock_team.standing = 1
        mock_team.roster = roster or []
        return mock_team

    def _create_mock_espn_player(self, player_id, name, pro_team="LAL"):
        mock_player = MagicMock()
        mock_player.playerId = player_id
        mock_player.name = name
        mock_player.proTeam = pro_team
        mock_player.injuryStatus = "ACTIVE"
        mock_player.eligibleSlots = [0, 1]
        mock_player.stats = {}
        mock_player.avg_points = 20.0
        return mock_player

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_creates_teams(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = [
            self._create_mock_espn_team(1, "Team Alpha"),
            self._create_mock_espn_team(2, "Team Beta"),
        ]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.assertEqual(Team.objects.filter(league=self.league).count(), 2)
        self.assertTrue(Team.objects.filter(espn_team_id=1).exists())
        self.assertTrue(Team.objects.filter(espn_team_id=2).exists())

        team_alpha = Team.objects.get(espn_team_id=1)
        self.assertEqual(team_alpha.name, "Team Alpha")
        self.assertEqual(team_alpha.wins, 10)
        self.assertEqual(team_alpha.losses, 5)

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_creates_placeholder_user_for_new_team(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = [self._create_mock_espn_team(1, "Team Alpha")]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        team = Team.objects.get(espn_team_id=1)
        self.assertIsNotNone(team.owner)
        self.assertEqual(team.owner.email, "espn_user_1@placeholder.local")

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_updates_existing_team(self, mock_create_connection):
        owner = User.objects.create_user(
            email="existing@test.com", username="existing", password="test123"
        )
        existing_team = Team.objects.create(
            league=self.league,
            espn_team_id=1,
            name="Old Name",
            owner=owner,
            wins=0,
            losses=0,
        )

        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = [self._create_mock_espn_team(1, "New Name")]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        existing_team.refresh_from_db()
        self.assertEqual(existing_team.name, "New Name")
        self.assertEqual(existing_team.wins, 10)
        self.assertEqual(existing_team.owner, owner)

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_adds_roster_players(self, mock_create_connection):
        roster = [
            self._create_mock_espn_player(1001, "LeBron James"),
            self._create_mock_espn_player(1002, "Anthony Davis"),
        ]
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = [self._create_mock_espn_team(1, "Lakers", roster)]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        team = Team.objects.get(espn_team_id=1)
        self.assertEqual(RosterPlayer.objects.filter(fantasy_team=team).count(), 2)
        self.assertTrue(Player.objects.filter(player_id=1001).exists())
        self.assertTrue(Player.objects.filter(player_id=1002).exists())

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_removes_players_no_longer_on_roster(self, mock_create_connection):
        owner = User.objects.create_user(
            email="test@test.com", username="test", password="test123"
        )
        team = Team.objects.create(
            league=self.league,
            espn_team_id=1,
            name="Test Team",
            owner=owner,
        )
        old_player = Player.objects.create(player_id=9999, name="Old Player")
        RosterPlayer.objects.create(
            fantasy_team=team, player=old_player, salary=self.league.min_salary
        )

        new_roster = [self._create_mock_espn_player(1001, "New Player")]
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = [
            self._create_mock_espn_team(1, "Test Team", new_roster)
        ]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.assertEqual(RosterPlayer.objects.filter(fantasy_team=team).count(), 1)
        self.assertFalse(
            RosterPlayer.objects.filter(fantasy_team=team, player=old_player).exists()
        )

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_preserves_existing_salaries(self, mock_create_connection):
        owner = User.objects.create_user(
            email="test@test.com", username="test", password="test123"
        )
        team = Team.objects.create(
            league=self.league,
            espn_team_id=1,
            name="Test Team",
            owner=owner,
        )
        existing_player = Player.objects.create(player_id=1001, name="LeBron James")
        roster_player = RosterPlayer.objects.create(
            fantasy_team=team, player=existing_player, salary=50
        )

        roster = [self._create_mock_espn_player(1001, "LeBron James")]
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = [self._create_mock_espn_team(1, "Test Team", roster)]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        roster_player.refresh_from_db()
        self.assertEqual(roster_player.salary, 50)

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_sets_min_salary_for_new_roster_players(self, mock_create_connection):
        roster = [self._create_mock_espn_player(1001, "New Player")]
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = [self._create_mock_espn_team(1, "Test Team", roster)]
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        roster_player = RosterPlayer.objects.get(player__player_id=1001)
        self.assertEqual(roster_player.salary, self.league.min_salary)

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_skipped_when_recently_synced(self, mock_create_connection):
        self.league.last_sync_date = timezone.now() - timedelta(hours=1)
        self.league.save()

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.assertIn("synced recently", out.getvalue())
        mock_create_connection.assert_not_called()

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_force_update_bypasses_cooldown(self, mock_create_connection):
        self.league.last_sync_date = timezone.now() - timedelta(hours=1)
        self.league.save()

        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            force_update=True,
            stdout=out,
        )

        mock_create_connection.assert_called_once()

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_updates_league_name(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "New ESPN League Name"
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.league.refresh_from_db()
        self.assertEqual(self.league.name, "New ESPN League Name")

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_updates_last_sync_date(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        self.assertIsNone(self.league.last_sync_date)

        out = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
        )

        self.league.refresh_from_db()
        self.assertIsNotNone(self.league.last_sync_date)

    def test_sync_no_league_found(self):
        League.objects.all().delete()

        out = StringIO()
        err = StringIO()
        call_command("sync_espn_league", stdout=out, stderr=err)

        self.assertIn("No leagues found", err.getvalue())

    @patch("league.management.commands.sync_espn_league.create_espn_league_connection")
    def test_sync_handles_espn_connection_error(self, mock_create_connection):
        mock_create_connection.side_effect = Exception("ESPN API error")

        out = StringIO()
        err = StringIO()
        call_command(
            "sync_espn_league",
            league_id=str(self.league.id),
            stdout=out,
            stderr=err,
        )

        self.assertIn("Failed to connect to ESPN API", err.getvalue())
