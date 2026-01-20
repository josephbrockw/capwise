import os

from django.test import TestCase
from league.models import League, Player, Position


class PlayerModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        player = Player.objects.get(name="Michael Jordan")
        self.assertEqual(str(player), "Michael Jordan")

    def test_position_list_single_position(self):
        player = Player.objects.get(name="Michael Jordan")
        player.positions.add(Position.objects.get(code="SG"))
        self.assertEqual(player.position_list, "SG")

    def test_position_list_multiple_positions(self):
        player = Player.objects.get(name="Scottie Pippen")
        player.positions.add(Position.objects.get(code="SF"))
        player.positions.add(Position.objects.get(code="PF"))
        self.assertIn("SF", player.position_list)
        self.assertIn("PF", player.position_list)

    def test_position_list_empty(self):
        player = Player.objects.get(name="Dennis Rodman")
        self.assertEqual(player.position_list, "")

    def test_on_roster_true(self):
        player = Player.objects.get(name="Michael Jordan")
        self.assertTrue(player.on_roster)

    def test_on_roster_false(self):
        player = Player.objects.get(name="Hakeem Olajuwon")
        self.assertFalse(player.on_roster)

    def test_calculated_salary_rookie_year(self):
        player = Player.objects.get(name="Michael Jordan")
        salary = player.calculated_salary(years_on_roster=1)
        self.assertEqual(salary, 1)

    def test_calculated_salary_years_2_to_4(self):
        player = Player.objects.get(name="Michael Jordan")
        league = League.objects.get(name="90s Legends Dynasty League")
        salary = player.calculated_salary(years_on_roster=2, league=league)
        self.assertEqual(salary, 80)
        salary = player.calculated_salary(years_on_roster=4, league=league)
        self.assertEqual(salary, 80)

    def test_calculated_salary_year_5_plus(self):
        player = Player.objects.get(name="Michael Jordan")
        league = League.objects.get(name="90s Legends Dynasty League")
        salary = player.calculated_salary(years_on_roster=5, league=league)
        self.assertEqual(salary, 90)
        salary = player.calculated_salary(years_on_roster=10, league=league)
        self.assertEqual(salary, 90)

    def test_calculated_salary_with_custom_league_settings(self):
        player = Player.objects.get(name="Karl Malone")
        league = League.objects.create(
            name="Custom Salary League",
            year=1997,
            espn_league_id=55555,
            salary_escalation_settings={
                "rookie_year_salary": 10,
                "year_2_4_multiplier": 0.50,
                "year_5_plus_multiplier": 0.75,
            },
        )
        salary = player.calculated_salary(years_on_roster=1, league=league)
        self.assertEqual(salary, 10)
        salary = player.calculated_salary(years_on_roster=3, league=league)
        self.assertEqual(salary, 40)
        salary = player.calculated_salary(years_on_roster=6, league=league)
        self.assertEqual(salary, 60)

    def test_calculated_salary_without_league_uses_defaults(self):
        player = Player.objects.get(name="Gary Payton")
        salary = player.calculated_salary(years_on_roster=3)
        self.assertEqual(salary, 56)

    def test_unique_player_id(self):
        from django.db import IntegrityError

        with self.assertRaises(IntegrityError):
            Player.objects.create(
                name="Fake Jordan",
                player_id=1001,
            )
