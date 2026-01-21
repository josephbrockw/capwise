from datetime import timedelta
from unittest.mock import MagicMock, patch

from rest_framework.test import APIClient

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from league.models import League, Position, Team

User = get_user_model()


class ESPNSyncAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.commissioner = User.objects.create_user(
            email="commissioner@test.com",
            username="commissioner",
            password="testpass123",
        )
        self.regular_user = User.objects.create_user(
            email="user@test.com",
            username="regular",
            password="testpass123",
        )

        self.league = League.objects.create(
            name="Test League",
            year=2024,
            salary_cap=1000,
            min_salary=1,
            roster_size=15,
            espn_league_id=12345,
            espn_s2="test_s2",
            espn_swid="test_swid",
            commissioner=self.commissioner,
            last_sync_date=None,
        )

        self.commissioner_team = Team.objects.create(
            league=self.league,
            name="Commissioner Team",
            owner=self.commissioner,
            espn_team_id=1,
        )

        self.regular_team = Team.objects.create(
            league=self.league,
            name="Regular Team",
            owner=self.regular_user,
            espn_team_id=2,
        )

        Position.objects.get_or_create(code="PG", defaults={"name": "Point Guard"})

    def _auth_as(self, user):
        self.client.force_authenticate(user=user)

    def _set_team_context(self, team):
        self.client.credentials(HTTP_X_TEAM_CONTEXT=str(team.id))

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_requires_authentication(self, mock_create_connection):
        response = self.client.post("/api/league/sync")
        self.assertEqual(response.status_code, 401)

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_requires_team_context(self, mock_create_connection):
        self._auth_as(self.commissioner)

        response = self.client.post("/api/league/sync")
        self.assertEqual(response.status_code, 403)

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_requires_commissioner(self, mock_create_connection):
        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.post("/api/league/sync")
        self.assertEqual(response.status_code, 403)

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_success_full(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = []
        mock_espn_league.free_agents.return_value = []
        mock_create_connection.return_value = mock_espn_league

        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post(
            "/api/league/sync",
            {"sync_type": "full", "force": False},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["data"]["status"], "completed")

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_players_only(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.teams = []
        mock_espn_league.free_agents.return_value = []
        mock_create_connection.return_value = mock_espn_league

        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post(
            "/api/league/sync",
            {"sync_type": "players"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_rosters_only(self, mock_create_connection):
        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = []
        mock_create_connection.return_value = mock_espn_league

        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post(
            "/api/league/sync",
            {"sync_type": "rosters"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_respects_cooldown(self, mock_create_connection):
        self.league.last_sync_date = timezone.now() - timedelta(hours=1)
        self.league.save()

        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post(
            "/api/league/sync",
            {"sync_type": "full", "force": False},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("synced recently", data["error"])
        mock_create_connection.assert_not_called()

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_force_bypasses_cooldown(self, mock_create_connection):
        self.league.last_sync_date = timezone.now() - timedelta(hours=1)
        self.league.save()

        mock_espn_league = MagicMock()
        mock_espn_league.settings = MagicMock()
        mock_espn_league.settings.name = "Test League"
        mock_espn_league.teams = []
        mock_espn_league.free_agents.return_value = []
        mock_create_connection.return_value = mock_espn_league

        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post(
            "/api/league/sync",
            {"sync_type": "full", "force": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        mock_create_connection.assert_called_once()

    @patch("league.services.espn_sync.create_espn_league_connection")
    def test_sync_handles_espn_error(self, mock_create_connection):
        mock_create_connection.side_effect = Exception("ESPN API error")

        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post(
            "/api/league/sync",
            {"sync_type": "full"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("ESPN connection failed", data["error"])

    def test_sync_status_requires_authentication(self):
        response = self.client.get("/api/league/sync/status")
        self.assertEqual(response.status_code, 401)

    def test_sync_status_requires_team_context(self):
        self._auth_as(self.regular_user)

        response = self.client.get("/api/league/sync/status")
        self.assertEqual(response.status_code, 403)

    def test_sync_status_success(self):
        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/sync/status")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("last_sync_date", data["data"])
        self.assertIn("needs_sync", data["data"])
        self.assertIn("espn_league_id", data["data"])

    def test_sync_status_needs_sync_when_never_synced(self):
        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/sync/status")

        data = response.json()
        self.assertTrue(data["data"]["needs_sync"])

    def test_sync_status_needs_sync_when_stale(self):
        self.league.last_sync_date = timezone.now() - timedelta(hours=25)
        self.league.save()

        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/sync/status")

        data = response.json()
        self.assertTrue(data["data"]["needs_sync"])

    def test_sync_status_no_sync_needed_when_recent(self):
        self.league.last_sync_date = timezone.now() - timedelta(hours=12)
        self.league.save()

        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/sync/status")

        data = response.json()
        self.assertFalse(data["data"]["needs_sync"])
