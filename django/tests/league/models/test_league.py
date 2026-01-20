import os
from datetime import datetime
from unittest.mock import patch

from django.test import TestCase
from league.models import League


class LeagueModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        self.assertEqual(str(league), "90s Legends Dynasty League (1996)")

    def test_default_salary_escalation_settings_on_save(self):
        league = League.objects.create(
            name="New Dynasty League",
            year=1997,
            espn_league_id=99999,
            salary_escalation_settings={},
        )
        self.assertEqual(league.salary_escalation_settings["rookie_year_salary"], 1)
        self.assertEqual(league.salary_escalation_settings["year_2_4_multiplier"], 0.80)
        self.assertEqual(
            league.salary_escalation_settings["year_5_plus_multiplier"], 0.90
        )

    def test_salary_escalation_settings_preserved_if_provided(self):
        custom_settings = {
            "rookie_year_salary": 5,
            "year_2_4_multiplier": 0.75,
            "year_5_plus_multiplier": 0.85,
        }
        league = League.objects.create(
            name="Custom Settings League",
            year=1998,
            espn_league_id=88888,
            salary_escalation_settings=custom_settings,
        )
        self.assertEqual(league.salary_escalation_settings["rookie_year_salary"], 5)
        self.assertEqual(league.salary_escalation_settings["year_2_4_multiplier"], 0.75)
        self.assertEqual(
            league.salary_escalation_settings["year_5_plus_multiplier"], 0.85
        )

    @patch("league.models.datetime")
    def test_current_season_property_before_october(self, mock_datetime):
        mock_datetime.now.return_value = datetime(1996, 5, 15)
        league = League.objects.get(name="90s Legends Dynasty League")
        self.assertEqual(league.current_season, 1996)

    @patch("league.models.datetime")
    def test_current_season_property_after_october(self, mock_datetime):
        mock_datetime.now.return_value = datetime(1996, 10, 15)
        league = League.objects.get(name="90s Legends Dynasty League")
        self.assertEqual(league.current_season, 1997)

    @patch("league.models.datetime")
    def test_get_current_season_classmethod_before_october(self, mock_datetime):
        mock_datetime.now.return_value = datetime(1996, 5, 15)
        self.assertEqual(League.get_current_season(), 1996)

    @patch("league.models.datetime")
    def test_get_current_season_classmethod_after_october(self, mock_datetime):
        mock_datetime.now.return_value = datetime(1996, 10, 15)
        self.assertEqual(League.get_current_season(), 1997)

    def test_unique_together_name_year(self):
        from django.db import IntegrityError

        with self.assertRaises(IntegrityError):
            League.objects.create(
                name="90s Legends Dynasty League",
                year=1996,
                espn_league_id=77777,
            )

    def test_unique_together_espn_league_id_year(self):
        from django.db import IntegrityError

        with self.assertRaises(IntegrityError):
            League.objects.create(
                name="Different League Name",
                year=1996,
                espn_league_id=12345,
            )
