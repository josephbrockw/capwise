from django.contrib.auth import get_user_model
from django.test import TestCase
from league.models import DraftPick, League, Team
from league.services.lottery import (
    DEFAULT_LOTTERY_ODDS,
    get_lottery_odds,
    get_lottery_result,
    get_lottery_teams,
    run_lottery,
)

User = get_user_model()


class GetLotteryTeamsTest(TestCase):
    def setUp(self):
        self.league = League.objects.create(
            name="Test League",
            year=2024,
            salary_cap=1000,
            min_salary=1,
            roster_size=15,
            espn_league_id=12345,
        )
        self.users = []
        self.teams = []
        for i in range(10):
            user = User.objects.create_user(
                email=f"user{i}@test.com",
                username=f"user{i}",
                password="test123",
            )
            self.users.append(user)
            team = Team.objects.create(
                league=self.league,
                name=f"Team {i}",
                owner=user,
                espn_team_id=i,
                wins=10 - i,
                losses=i,
                standing=i + 1,
            )
            self.teams.append(team)

    def test_get_lottery_teams_excludes_playoff_teams(self):
        lottery_teams = get_lottery_teams(self.league, playoff_teams=6)

        self.assertEqual(len(lottery_teams), 4)

        for team in self.teams[:6]:
            self.assertNotIn(team, lottery_teams)

    def test_get_lottery_teams_ordered_by_worst_record(self):
        lottery_teams = get_lottery_teams(self.league, playoff_teams=6)

        for i in range(len(lottery_teams) - 1):
            current = lottery_teams[i]
            next_team = lottery_teams[i + 1]
            self.assertLessEqual(current.wins, next_team.wins)

    def test_get_lottery_teams_empty_when_all_playoff(self):
        lottery_teams = get_lottery_teams(self.league, playoff_teams=10)

        self.assertEqual(len(lottery_teams), 0)


class GetLotteryOddsTest(TestCase):
    def setUp(self):
        self.league = League.objects.create(
            name="Test League",
            year=2024,
            salary_cap=1000,
            min_salary=1,
            roster_size=15,
            espn_league_id=12345,
        )
        for i in range(10):
            user = User.objects.create_user(
                email=f"user{i}@test.com",
                username=f"user{i}",
                password="test123",
            )
            Team.objects.create(
                league=self.league,
                name=f"Team {i}",
                owner=user,
                espn_team_id=i,
                wins=10 - i,
                losses=i,
                standing=i + 1,
            )

    def test_get_lottery_odds_returns_correct_positions(self):
        odds = get_lottery_odds(self.league, playoff_teams=6)

        self.assertEqual(len(odds), 4)
        for i, team_odds in enumerate(odds, start=1):
            self.assertEqual(team_odds.position, i)

    def test_get_lottery_odds_matches_default_odds(self):
        odds = get_lottery_odds(self.league, playoff_teams=6)

        for team_odds in odds:
            expected_odds = DEFAULT_LOTTERY_ODDS.get(team_odds.position, 0.0)
            self.assertEqual(team_odds.odds, expected_odds)


class RunLotteryTest(TestCase):
    def setUp(self):
        self.commissioner = User.objects.create_user(
            email="commissioner@test.com",
            username="commissioner",
            password="test123",
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
        self.teams = []
        for i in range(10):
            user = User.objects.create_user(
                email=f"user{i}@test.com",
                username=f"user{i}",
                password="test123",
            )
            team = Team.objects.create(
                league=self.league,
                name=f"Team {i}",
                owner=user,
                espn_team_id=i,
                wins=10 - i,
                losses=i,
                standing=i + 1,
            )
            self.teams.append(team)

    def test_run_lottery_creates_result(self):
        result = run_lottery(self.league, self.commissioner)

        self.assertIsNotNone(result)
        self.assertEqual(result.league, self.league)
        self.assertEqual(result.year, 2024)
        self.assertEqual(result.executed_by, self.commissioner)

    def test_run_lottery_selects_first_and_second_pick(self):
        result = run_lottery(self.league, self.commissioner)

        self.assertIsNotNone(result.first_pick_team)
        self.assertIsNotNone(result.second_pick_team)
        self.assertNotEqual(result.first_pick_team, result.second_pick_team)

    def test_run_lottery_stores_results_json(self):
        result = run_lottery(self.league, self.commissioner)

        self.assertIn("lottery_teams", result.results)
        self.assertIn("final_order", result.results)

    def test_run_lottery_fails_if_already_run(self):
        run_lottery(self.league, self.commissioner)

        with self.assertRaises(ValueError) as context:
            run_lottery(self.league, self.commissioner)

        self.assertIn("already run", str(context.exception))

    def test_run_lottery_fails_if_draft_open(self):
        self.league.draft_open = True
        self.league.save()

        with self.assertRaises(ValueError) as context:
            run_lottery(self.league, self.commissioner)

        self.assertIn("draft has started", str(context.exception))

    def test_run_lottery_fails_with_insufficient_teams(self):
        Team.objects.filter(league=self.league).delete()

        user = User.objects.create_user(
            email="solo@test.com", username="solo", password="test123"
        )
        Team.objects.create(
            league=self.league,
            name="Only Team",
            owner=user,
            espn_team_id=99,
            standing=1,
        )

        with self.assertRaises(ValueError) as context:
            run_lottery(self.league, self.commissioner, playoff_teams=0)

        self.assertIn("Not enough teams", str(context.exception))

    def test_run_lottery_updates_draft_picks(self):
        lottery_teams = get_lottery_teams(self.league, playoff_teams=6)

        for i, team in enumerate(lottery_teams):
            DraftPick.objects.create(
                league=self.league,
                original_team=team,
                current_team=team,
                year=2024,
                round=1,
                pick_number=i + 1,
            )

        result = run_lottery(self.league, self.commissioner)

        first_pick = DraftPick.objects.get(
            league=self.league,
            year=2024,
            round=1,
            current_team=result.first_pick_team,
        )
        self.assertEqual(first_pick.pick_number, 1)


class GetLotteryResultTest(TestCase):
    def setUp(self):
        self.commissioner = User.objects.create_user(
            email="commissioner@test.com",
            username="commissioner",
            password="test123",
        )
        self.league = League.objects.create(
            name="Test League",
            year=2024,
            salary_cap=1000,
            min_salary=1,
            roster_size=15,
            espn_league_id=12345,
        )
        self.teams = []
        for i in range(8):
            user = User.objects.create_user(
                email=f"user{i}@test.com",
                username=f"user{i}",
                password="test123",
            )
            team = Team.objects.create(
                league=self.league,
                name=f"Team {i}",
                owner=user,
                espn_team_id=i,
                wins=8 - i,
                losses=i,
                standing=i + 1,
            )
            self.teams.append(team)

    def test_get_lottery_result_returns_none_when_not_run(self):
        result = get_lottery_result(self.league)

        self.assertIsNone(result)

    def test_get_lottery_result_returns_result(self):
        run_lottery(self.league, self.commissioner, playoff_teams=4)

        result = get_lottery_result(self.league)

        self.assertIsNotNone(result)
        self.assertEqual(result.year, 2024)

    def test_get_lottery_result_with_specific_year(self):
        run_lottery(self.league, self.commissioner, playoff_teams=4)

        result = get_lottery_result(self.league, year=2024)
        self.assertIsNotNone(result)

        result = get_lottery_result(self.league, year=2023)
        self.assertIsNone(result)
