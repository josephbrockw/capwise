import os

from django.test import TestCase
from league.models import League, Player, RosterPlayer, Team


class RosterPlayerModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        roster_player = RosterPlayer.objects.get(
            player__name="Michael Jordan",
            fantasy_team__name="Chicago Bulls Dynasty",
        )
        self.assertEqual(str(roster_player), "Michael Jordan - Chicago Bulls Dynasty")

    def test_roster_player_fields(self):
        roster_player = RosterPlayer.objects.get(player__name="Michael Jordan")
        self.assertEqual(roster_player.salary, 100)
        self.assertTrue(roster_player.is_keeper)
        self.assertEqual(roster_player.keeper_years, 3)
        self.assertTrue(roster_player.acquired_by_draft)
        self.assertFalse(roster_player.trade_blocked)

    def test_trade_blocked_player(self):
        roster_player = RosterPlayer.objects.get(player__name="Dennis Rodman")
        self.assertTrue(roster_player.trade_blocked)
        self.assertFalse(roster_player.is_keeper)

    def test_unique_together_fantasy_team_player(self):
        from django.db import IntegrityError

        team = Team.objects.get(name="Chicago Bulls Dynasty")
        player = Player.objects.get(name="Michael Jordan")
        with self.assertRaises(IntegrityError):
            RosterPlayer.objects.create(
                fantasy_team=team,
                player=player,
                salary=50,
            )

    def test_cascade_delete_with_team(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        team = Team.objects.create(
            league=league,
            name="Temp Team",
            espn_team_id=555,
        )
        player = Player.objects.get(name="Hakeem Olajuwon")
        RosterPlayer.objects.create(
            fantasy_team=team,
            player=player,
            salary=85,
        )
        self.assertEqual(RosterPlayer.objects.filter(player=player).count(), 1)
        team.delete()
        self.assertEqual(RosterPlayer.objects.filter(player=player).count(), 0)

    def test_cascade_delete_with_player(self):
        team = Team.objects.get(name="Utah Jazz")
        player = Player.objects.create(
            name="Temp Player",
            player_id=9999,
        )
        RosterPlayer.objects.create(
            fantasy_team=team,
            player=player,
            salary=10,
        )
        roster_count_before = RosterPlayer.objects.filter(fantasy_team=team).count()
        player.delete()
        roster_count_after = RosterPlayer.objects.filter(fantasy_team=team).count()
        self.assertEqual(roster_count_before - roster_count_after, 1)
