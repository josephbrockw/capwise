import os

from django.test import TestCase
from league.models import League, Team


class TeamModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        team = Team.objects.get(name="Chicago Bulls Dynasty")
        self.assertEqual(
            str(team), "Chicago Bulls Dynasty (90s Legends Dynasty League)"
        )

    def test_str_representation_with_abbreviation_fallback(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        team = Team.objects.create(
            league=league,
            name=None,
            abbreviation="LAL",
            espn_team_id=999,
        )
        self.assertEqual(str(team), "LAL (90s Legends Dynasty League)")

    def test_current_salary_with_roster_players(self):
        team = Team.objects.get(name="Chicago Bulls Dynasty")
        self.assertEqual(team.current_salary, 220)

    def test_current_salary_with_no_roster_players(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        team = Team.objects.create(
            league=league,
            name="Empty Team",
            espn_team_id=888,
        )
        self.assertEqual(team.current_salary, 0)

    def test_cap_space_calculation(self):
        team = Team.objects.get(name="Chicago Bulls Dynasty")
        self.assertEqual(team.cap_space, 780)

    def test_cap_space_with_no_roster_players(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        team = Team.objects.create(
            league=league,
            name="Empty Team",
            espn_team_id=777,
        )
        self.assertEqual(team.cap_space, 1000)

    def test_unique_together_league_espn_team_id(self):
        from django.db import IntegrityError

        league = League.objects.get(name="90s Legends Dynasty League")
        with self.assertRaises(IntegrityError):
            Team.objects.create(
                league=league,
                name="Duplicate Team",
                espn_team_id=101,
            )

    def test_cascade_delete_with_league(self):
        league = League.objects.create(
            name="Temp League",
            year=1999,
            espn_league_id=11111,
        )
        Team.objects.create(
            league=league,
            name="Temp Team",
            espn_team_id=666,
        )
        self.assertEqual(Team.objects.filter(name="Temp Team").count(), 1)
        league.delete()
        self.assertEqual(Team.objects.filter(name="Temp Team").count(), 0)
