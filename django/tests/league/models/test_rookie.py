import os

from django.test import TestCase
from league.models import Player, Position, Rookie


class RookieModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        rookie = Rookie.objects.get(name="Kobe Bryant")
        self.assertEqual(str(rookie), "Kobe Bryant")

    def test_rookie_fields(self):
        rookie = Rookie.objects.get(name="Allen Iverson")
        self.assertEqual(rookie.nba_team, "PHI")
        self.assertEqual(rookie.rookie_rank, 2)
        self.assertEqual(rookie.rookie_year, 1996)
        self.assertIsNone(rookie.player)

    def test_rookie_linked_to_player(self):
        rookie = Rookie.objects.get(name="Kobe Bryant")
        player = Player.objects.create(
            name="Kobe Bryant",
            player_id=2001,
            nba_team="LAL",
            rookie_year=1996,
        )
        rookie.player = player
        rookie.save()
        rookie.refresh_from_db()
        self.assertEqual(rookie.player, player)

    def test_rookie_positions(self):
        rookie = Rookie.objects.get(name="Steve Nash")
        rookie.positions.add(Position.objects.get(code="PG"))
        self.assertEqual(rookie.positions.count(), 1)
        self.assertEqual(rookie.positions.first().code, "PG")

    def test_rookie_set_null_on_player_delete(self):
        player = Player.objects.create(
            name="Temp Rookie Player",
            player_id=8888,
        )
        rookie = Rookie.objects.get(name="Ray Allen")
        rookie.player = player
        rookie.save()
        player.delete()
        rookie.refresh_from_db()
        self.assertIsNone(rookie.player)

    def test_1996_draft_class(self):
        rookies_1996 = Rookie.objects.filter(rookie_year=1996)
        self.assertEqual(rookies_1996.count(), 4)
        names = list(rookies_1996.values_list("name", flat=True))
        self.assertIn("Kobe Bryant", names)
        self.assertIn("Allen Iverson", names)
        self.assertIn("Ray Allen", names)
        self.assertIn("Steve Nash", names)
