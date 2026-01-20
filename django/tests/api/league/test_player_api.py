import os

from rest_framework import status
from rest_framework.test import APIClient

from account.models import User
from django.test import TestCase
from league.models import League, Player, Team


class PlayerViewSetTest(TestCase):
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="mjordan",
            email="mj@bulls.com",
            password="airjordan23",
        )
        self.commissioner = User.objects.create_user(
            username="commissioner",
            email="commish@league.com",
            password="commissioner123",
        )
        self.league = League.objects.get(name="90s Legends Dynasty League")
        self.league.commissioner = self.commissioner
        self.league.save()

        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.bulls.owner = self.user
        self.bulls.save()

        self.jordan = Player.objects.get(name="Michael Jordan")
        self.olajuwon = Player.objects.get(name="Hakeem Olajuwon")

    def test_list_players_without_team_context(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/league/players")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_players_with_team_context(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.json()["data"])
        self.assertIn("count", response.json()["data"])

    def test_list_players_unauthenticated(self):
        response = self.client.get(
            "/api/league/players",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_players_filter_by_name(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players?name=Jordan",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["count"], 1)
        self.assertEqual(
            response.json()["data"]["results"][0]["name"], "Michael Jordan"
        )

    def test_list_players_filter_by_nba_team(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players?nba_team=CHI",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["count"], 3)

    def test_list_players_filter_by_rostered(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players?rostered=true",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["data"]["count"] > 0)

    def test_list_players_filter_by_not_rostered(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players?rostered=false",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.json()["data"])

    def test_list_players_filter_by_min_projected_value(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players?min_projected_value=80",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for player in response.json()["data"]["results"]:
            self.assertGreaterEqual(player["projected_value"], 80)

    def test_list_players_filter_by_max_projected_value(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players?max_projected_value=50",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for player in response.json()["data"]["results"]:
            self.assertLessEqual(player["projected_value"], 50)

    def test_retrieve_player_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/players/{self.jordan.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["name"], "Michael Jordan")
        self.assertIn("roster_entry", response.json()["data"])
        self.assertIsNotNone(response.json()["data"]["roster_entry"])

    def test_retrieve_player_not_rostered(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/players/{self.olajuwon.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["name"], "Hakeem Olajuwon")
        self.assertIsNone(response.json()["data"]["roster_entry"])

    def test_retrieve_player_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/players/00000000-0000-0000-0000-000000000000",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_player_includes_stats(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/players/{self.jordan.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("pts_avg", response.json()["data"])
        self.assertIn("reb_avg", response.json()["data"])
        self.assertIn("ast_avg", response.json()["data"])

    def test_partial_update_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            f"/api/league/players/{self.jordan.id}",
            {"projected_value": 150.0},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.jordan.refresh_from_db()
        self.assertEqual(self.jordan.projected_value, 150.0)

    def test_partial_update_as_non_commissioner(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/league/players/{self.jordan.id}",
            {"projected_value": 150.0},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_positions(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            f"/api/league/players/{self.jordan.id}",
            {"positions": ["SG", "SF"]},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.jordan.refresh_from_db()
        position_codes = list(self.jordan.positions.values_list("code", flat=True))
        self.assertIn("SG", position_codes)
        self.assertIn("SF", position_codes)

    def test_partial_update_player_not_found(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            "/api/league/players/00000000-0000-0000-0000-000000000000",
            {"projected_value": 150.0},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
