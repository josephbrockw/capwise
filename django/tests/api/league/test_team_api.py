import os

from rest_framework import status
from rest_framework.test import APIClient

from account.models import User
from django.test import TestCase
from league.models import League, Team


class TeamViewSetTest(TestCase):
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
        self.other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="other123",
        )
        self.league = League.objects.get(name="90s Legends Dynasty League")
        self.league.commissioner = self.commissioner
        self.league.save()

        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.bulls.owner = self.user
        self.bulls.save()

        self.sonics = Team.objects.get(name="Seattle SuperSonics")

    def test_list_teams_without_team_context(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/league/teams")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_teams_with_team_context(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/teams",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 3)

    def test_list_teams_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.get(
            "/api/league/teams",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 3)

    def test_list_teams_unauthenticated(self):
        response = self.client.get(
            "/api/league/teams",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_team_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/teams/{self.bulls.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["name"], "Chicago Bulls Dynasty")
        self.assertIn("roster_summary", response.json()["data"])

    def test_retrieve_team_in_same_league(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/teams/{self.sonics.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["name"], "Seattle SuperSonics")

    def test_retrieve_team_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/teams/00000000-0000-0000-0000-000000000000",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_roster_action_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/teams/{self.bulls.id}/roster",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("roster_players", response.json()["data"])
        self.assertEqual(len(response.json()["data"]["roster_players"]), 3)

    def test_roster_action_with_player_details(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/teams/{self.bulls.id}/roster",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        roster_player = response.json()["data"]["roster_players"][0]
        self.assertIn("player", roster_player)
        self.assertIn("name", roster_player["player"])
        self.assertIn("positions", roster_player["player"])

    def test_roster_action_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/teams/00000000-0000-0000-0000-000000000000/roster",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_team_includes_salary_info(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/teams/{self.bulls.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("current_salary", response.json()["data"])
        self.assertIn("cap_space", response.json()["data"])

    def test_team_detail_includes_league_object(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/teams/{self.bulls.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("league", data)
        league = data["league"]
        self.assertEqual(league["id"], str(self.league.id))
        self.assertEqual(league["name"], self.league.name)
        self.assertIn("year", league)
        self.assertIn("salary_cap", league)
        self.assertIn("min_salary", league)
        self.assertIn("roster_size", league)
        self.assertIn("commissioner_id", league)
        self.assertIn("draft_open", league)
        self.assertIn("needs_sync", league)

    def test_team_detail_includes_owner_id(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/teams/{self.bulls.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("owner_id", data)
        self.assertEqual(data["owner_id"], str(self.user.id))
