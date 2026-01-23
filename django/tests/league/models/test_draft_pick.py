import os

from django.test import TestCase
from league.models import DraftPick, League, Player, Team


class DraftPickModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        pick = DraftPick.objects.get(
            original_team__name="Chicago Bulls Dynasty",
            year=1997,
            round=1,
        )
        self.assertEqual(str(pick), "1997 Round 1 - Chicago Bulls Dynasty")

    def test_draft_pick_fields(self):
        pick = DraftPick.objects.get(
            original_team__name="Chicago Bulls Dynasty",
            year=1997,
            round=1,
        )
        self.assertEqual(pick.year, 1997)
        self.assertEqual(pick.round, 1)
        self.assertIsNone(pick.pick_number)
        self.assertEqual(pick.projected_number, 12)
        self.assertFalse(pick.is_rostered)

    def test_traded_pick(self):
        pick = DraftPick.objects.get(
            original_team__name="Seattle SuperSonics",
            year=1997,
            round=1,
        )
        self.assertEqual(pick.original_team.name, "Seattle SuperSonics")
        self.assertEqual(pick.current_team.name, "Chicago Bulls Dynasty")

    def test_pick_with_rookie_assigned(self):
        pick = DraftPick.objects.get(
            original_team__name="Utah Jazz",
            year=1997,
            round=1,
        )
        self.assertIsNotNone(pick.rookie)
        self.assertEqual(pick.rookie.name, "Kobe Bryant")

    def test_pick_used_for_player(self):
        pick = DraftPick.objects.get(
            original_team__name="Chicago Bulls Dynasty",
            year=1997,
            round=1,
        )
        player = Player.objects.get(name="Hakeem Olajuwon")
        pick.player = player
        pick.is_rostered = True
        pick.save()
        pick.refresh_from_db()
        self.assertEqual(pick.player, player)
        self.assertTrue(pick.is_rostered)

    def test_unique_together_league_year_original_team_round(self):
        from django.db import IntegrityError

        league = League.objects.get(name="90s Legends Dynasty League")
        team = Team.objects.get(name="Chicago Bulls Dynasty")
        with self.assertRaises(IntegrityError):
            DraftPick.objects.create(
                league=league,
                original_team=team,
                current_team=team,
                year=1997,
                round=1,
            )

    def test_cascade_delete_with_league(self):
        league = League.objects.create(
            name="Temp League",
            year=1998,
            espn_league_id=44444,
        )
        team = Team.objects.create(
            league=league,
            name="Temp Team",
            espn_team_id=444,
        )
        DraftPick.objects.create(
            league=league,
            original_team=team,
            current_team=team,
            year=1999,
            round=1,
        )
        # 14 picks created by signal + 1 manual = 15
        self.assertEqual(DraftPick.objects.filter(league=league).count(), 15)
        league.delete()
        self.assertEqual(DraftPick.objects.filter(year=1999, round=1).count(), 0)

    def test_set_null_on_rookie_delete(self):
        pick = DraftPick.objects.get(
            original_team__name="Utah Jazz",
            year=1997,
            round=1,
        )
        rookie = pick.rookie
        self.assertIsNotNone(rookie)
        rookie.delete()
        pick.refresh_from_db()
        self.assertIsNone(pick.rookie)
