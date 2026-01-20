import os

from rest_framework import status
from rest_framework.test import APIClient

from account.models import User
from django.test import TestCase
from league.models import League, Team


class LeagueViewSetTest(TestCase):
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

    def test_list_leagues_unauthenticated(self):
        response = self.client.get("/api/league/leagues")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_leagues_authenticated_with_team(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/league/leagues")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 1)
        self.assertEqual(
            response.json()["data"][0]["name"], "90s Legends Dynasty League"
        )

    def test_list_leagues_authenticated_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.get("/api/league/leagues")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 1)

    def test_list_leagues_authenticated_no_participation(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get("/api/league/leagues")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 0)

    def test_retrieve_league_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f"/api/league/leagues/{self.league.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["name"], "90s Legends Dynasty League")
        self.assertEqual(response.json()["data"]["team_count"], 3)
        self.assertIn("teams", response.json()["data"])

    def test_retrieve_league_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/leagues/00000000-0000-0000-0000-000000000000"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_league_no_access(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f"/api/league/leagues/{self.league.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_league_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            f"/api/league/leagues/{self.league.id}",
            {"salary_cap": 1500},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.league.refresh_from_db()
        self.assertEqual(self.league.salary_cap, 1500)

    def test_partial_update_league_as_non_commissioner(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/league/leagues/{self.league.id}",
            {"salary_cap": 1500},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_league_not_found(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            "/api/league/leagues/00000000-0000-0000-0000-000000000000",
            {"salary_cap": 1500},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_salary_escalation_settings(self):
        self.client.force_authenticate(user=self.commissioner)
        new_settings = {
            "rookie_year_salary": 5,
            "year_2_4_multiplier": 0.70,
            "year_5_plus_multiplier": 0.85,
        }
        response = self.client.patch(
            f"/api/league/leagues/{self.league.id}",
            {"salary_escalation_settings": new_settings},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.league.refresh_from_db()
        self.assertEqual(
            self.league.salary_escalation_settings["rookie_year_salary"], 5
        )
