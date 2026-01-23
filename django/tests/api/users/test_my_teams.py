from rest_framework import status
from rest_framework.test import APIClient

from django.contrib.auth import get_user_model
from django.test import TestCase
from league.models import League, Team


class MyTeamsEndpointTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            is_active=True,
        )
        self.other_user = get_user_model().objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="testpass123",
            is_active=True,
        )
        self.league1 = League.objects.create(
            name="League One",
            year=2026,
            espn_league_id=111,
        )
        self.league2 = League.objects.create(
            name="League Two",
            year=2026,
            espn_league_id=222,
        )
        self.team1 = Team.objects.create(
            league=self.league1,
            name="Team One",
            owner=self.user,
            espn_team_id=1,
        )
        self.team2 = Team.objects.create(
            league=self.league2,
            name="Team Two",
            owner=self.user,
            espn_team_id=2,
        )
        self.other_team = Team.objects.create(
            league=self.league1,
            name="Other Team",
            owner=self.other_user,
            espn_team_id=3,
        )

    def test_my_teams_requires_authentication(self):
        response = self.client.get("/api/users/my-teams")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_my_teams_returns_only_user_teams(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/users/my-teams")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(len(data), 2)
        team_ids = [t["id"] for t in data]
        self.assertIn(str(self.team1.id), team_ids)
        self.assertIn(str(self.team2.id), team_ids)
        self.assertNotIn(str(self.other_team.id), team_ids)

    def test_my_teams_includes_league_info(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/users/my-teams")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        team1_data = next(t for t in data if t["id"] == str(self.team1.id))
        self.assertEqual(team1_data["name"], "Team One")
        self.assertEqual(team1_data["league_id"], str(self.league1.id))
        self.assertEqual(team1_data["league_name"], "League One")

    def test_my_teams_empty_for_user_without_teams(self):
        new_user = get_user_model().objects.create_user(
            username="newuser",
            email="new@example.com",
            password="testpass123",
            is_active=True,
        )
        self.client.force_authenticate(user=new_user)
        response = self.client.get("/api/users/my-teams")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(len(data), 0)
