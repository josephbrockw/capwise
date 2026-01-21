from rest_framework.test import APIClient

from django.contrib.auth import get_user_model
from django.test import TestCase
from league.models import League, Team

User = get_user_model()


class LotteryAPITest(TestCase):
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
            commissioner=self.commissioner,
            draft_open=False,
        )

        self.commissioner_team = Team.objects.create(
            league=self.league,
            name="Commissioner Team",
            owner=self.commissioner,
            espn_team_id=1,
            wins=10,
            losses=0,
            standing=1,
        )

        self.regular_team = Team.objects.create(
            league=self.league,
            name="Regular Team",
            owner=self.regular_user,
            espn_team_id=2,
            wins=5,
            losses=5,
            standing=2,
        )

        self.lottery_teams = []
        for i in range(6):
            user = User.objects.create_user(
                email=f"lottery{i}@test.com",
                username=f"lottery{i}",
                password="test123",
            )
            team = Team.objects.create(
                league=self.league,
                name=f"Lottery Team {i}",
                owner=user,
                espn_team_id=10 + i,
                wins=4 - i,
                losses=6 + i,
                standing=3 + i,
            )
            self.lottery_teams.append(team)

    def _auth_as(self, user):
        self.client.force_authenticate(user=user)

    def _set_team_context(self, team):
        self.client.credentials(HTTP_X_TEAM_CONTEXT=str(team.id))

    def test_run_lottery_requires_authentication(self):
        response = self.client.post("/api/league/lottery/run")
        self.assertEqual(response.status_code, 401)

    def test_run_lottery_requires_team_context(self):
        self._auth_as(self.commissioner)

        response = self.client.post("/api/league/lottery/run")
        self.assertEqual(response.status_code, 403)

    def test_run_lottery_requires_commissioner(self):
        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.post("/api/league/lottery/run")
        self.assertEqual(response.status_code, 403)

    def test_run_lottery_success(self):
        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post("/api/league/lottery/run")

        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertIn("first_pick_team_id", data["data"])
        self.assertIn("second_pick_team_id", data["data"])
        self.assertIn("results", data["data"])

    def test_run_lottery_fails_if_already_run(self):
        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        self.client.post("/api/league/lottery/run")

        response = self.client.post("/api/league/lottery/run")

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("already run", data["error"])

    def test_run_lottery_fails_if_draft_open(self):
        self.league.draft_open = True
        self.league.save()

        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)

        response = self.client.post("/api/league/lottery/run")

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("draft has started", data["error"])

    def test_get_odds_requires_authentication(self):
        response = self.client.get("/api/league/lottery/odds")
        self.assertEqual(response.status_code, 401)

    def test_get_odds_requires_team_context(self):
        self._auth_as(self.regular_user)

        response = self.client.get("/api/league/lottery/odds")
        self.assertEqual(response.status_code, 403)

    def test_get_odds_success(self):
        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/lottery/odds")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data["data"], list)

        for team_odds in data["data"]:
            self.assertIn("team_id", team_odds)
            self.assertIn("team_name", team_odds)
            self.assertIn("position", team_odds)
            self.assertIn("odds", team_odds)
            self.assertIn("wins", team_odds)
            self.assertIn("losses", team_odds)

    def test_get_results_requires_authentication(self):
        response = self.client.get("/api/league/lottery/results")
        self.assertEqual(response.status_code, 401)

    def test_get_results_requires_team_context(self):
        self._auth_as(self.regular_user)

        response = self.client.get("/api/league/lottery/results")
        self.assertEqual(response.status_code, 403)

    def test_get_results_not_found(self):
        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/lottery/results")

        self.assertEqual(response.status_code, 404)

    def test_get_results_success(self):
        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)
        self.client.post("/api/league/lottery/run")

        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/lottery/results")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("first_pick_team_id", data["data"])
        self.assertIn("second_pick_team_id", data["data"])
        self.assertIn("results", data["data"])

    def test_get_results_with_year_param(self):
        self._auth_as(self.commissioner)
        self._set_team_context(self.commissioner_team)
        self.client.post("/api/league/lottery/run")

        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/lottery/results?year=2024")
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/league/lottery/results?year=2023")
        self.assertEqual(response.status_code, 404)

    def test_get_results_invalid_year(self):
        self._auth_as(self.regular_user)
        self._set_team_context(self.regular_team)

        response = self.client.get("/api/league/lottery/results?year=invalid")

        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Invalid year", data["error"])
