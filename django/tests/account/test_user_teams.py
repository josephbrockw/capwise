import os

from account.models import User
from django.test import TestCase
from league.models import League, Team


class UserTeamMethodsTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
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
        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.sonics = Team.objects.get(name="Seattle SuperSonics")
        self.jazz = Team.objects.get(name="Utah Jazz")
        self.league = self.bulls.league

    def test_get_teams_returns_owned_teams(self):
        self.bulls.owner = self.user
        self.bulls.save()

        teams = self.user.get_teams()
        self.assertEqual(teams.count(), 1)
        self.assertIn(self.bulls, teams)

    def test_get_teams_returns_multiple_owned_teams(self):
        self.bulls.owner = self.user
        self.bulls.save()
        self.sonics.owner = self.user
        self.sonics.save()

        teams = self.user.get_teams()
        self.assertEqual(teams.count(), 2)
        self.assertIn(self.bulls, teams)
        self.assertIn(self.sonics, teams)

    def test_get_teams_returns_empty_when_no_teams(self):
        teams = self.user.get_teams()
        self.assertEqual(teams.count(), 0)

    def test_get_leagues_returns_commissioned_leagues(self):
        self.league.commissioner = self.commissioner
        self.league.save()

        leagues = self.commissioner.get_leagues()
        self.assertEqual(leagues.count(), 1)
        self.assertIn(self.league, leagues)

    def test_get_leagues_returns_leagues_with_owned_teams(self):
        self.bulls.owner = self.user
        self.bulls.save()

        leagues = self.user.get_leagues()
        self.assertEqual(leagues.count(), 1)
        self.assertIn(self.league, leagues)

    def test_get_leagues_returns_distinct_leagues(self):
        self.bulls.owner = self.user
        self.bulls.save()
        self.league.commissioner = self.user
        self.league.save()

        leagues = self.user.get_leagues()
        self.assertEqual(leagues.count(), 1)

    def test_get_leagues_returns_multiple_leagues(self):
        self.bulls.owner = self.user
        self.bulls.save()

        other_league = League.objects.create(
            name="Other League",
            year=1997,
            espn_league_id=99999,
            commissioner=self.user,
        )

        leagues = self.user.get_leagues()
        self.assertEqual(leagues.count(), 2)
        self.assertIn(self.league, leagues)
        self.assertIn(other_league, leagues)

    def test_get_leagues_returns_empty_when_no_participation(self):
        leagues = self.user.get_leagues()
        self.assertEqual(leagues.count(), 0)


class UserDefaultTeamTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.user = User.objects.create_user(
            username="mjordan",
            email="mj@bulls.com",
            password="airjordan23",
        )
        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")

    def test_default_team_is_nullable(self):
        self.assertIsNone(self.user.default_team)

    def test_can_set_default_team(self):
        self.user.default_team = self.bulls
        self.user.save()
        self.user.refresh_from_db()
        self.assertEqual(self.user.default_team, self.bulls)

    def test_default_team_set_null_on_team_delete(self):
        league = League.objects.create(
            name="Temp League",
            year=1999,
            espn_league_id=88888,
        )
        temp_team = Team.objects.create(
            league=league,
            name="Temp Team",
            espn_team_id=888,
        )
        self.user.default_team = temp_team
        self.user.save()

        temp_team.delete()
        self.user.refresh_from_db()
        self.assertIsNone(self.user.default_team)
