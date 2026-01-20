import os

from django.test import TestCase
from league.models import Position


class PositionModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        position = Position.objects.get(code="PG")
        self.assertEqual(str(position), "PG")

    def test_all_positions_exist(self):
        expected_positions = ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL"]
        for code in expected_positions:
            self.assertTrue(Position.objects.filter(code=code).exists())

    def test_position_names(self):
        self.assertEqual(Position.objects.get(code="PG").name, "Point Guard")
        self.assertEqual(Position.objects.get(code="SG").name, "Shooting Guard")
        self.assertEqual(Position.objects.get(code="SF").name, "Small Forward")
        self.assertEqual(Position.objects.get(code="PF").name, "Power Forward")
        self.assertEqual(Position.objects.get(code="C").name, "Center")
        self.assertEqual(Position.objects.get(code="G").name, "Guard")
        self.assertEqual(Position.objects.get(code="F").name, "Forward")
        self.assertEqual(Position.objects.get(code="UTIL").name, "Utility")

    def test_primary_key_is_code(self):
        position = Position.objects.get(code="SG")
        self.assertEqual(position.pk, "SG")
