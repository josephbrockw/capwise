import os

from django.test import TestCase
from league.models import League, Team, Trade, TradeTeam


class TradeTeamModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        trade_team = TradeTeam.objects.get(pk="88888888-8888-8888-8888-888888888881")
        str_repr = str(trade_team)
        self.assertIn("Chicago Bulls Dynasty", str_repr)

    def test_trade_teams_count(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        self.assertEqual(trade.trade_teams.count(), 2)

    def test_unique_together_trade_team(self):
        from django.db import IntegrityError

        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")

        with self.assertRaises(IntegrityError):
            TradeTeam.objects.create(trade=trade, team=bulls)

    def test_cascade_delete_with_trade(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        trade_team_count = TradeTeam.objects.filter(trade=trade).count()
        self.assertEqual(trade_team_count, 2)

        trade.delete()
        trade_team_count = TradeTeam.objects.filter(
            trade__pk="77777777-7777-7777-7777-777777777771"
        ).count()
        self.assertEqual(trade_team_count, 0)

    def test_three_team_trade(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        jazz = Team.objects.get(name="Utah Jazz")

        trade = Trade.objects.create(league=league, status=Trade.Status.PROPOSED)
        TradeTeam.objects.create(trade=trade, team=bulls)
        TradeTeam.objects.create(trade=trade, team=sonics)
        TradeTeam.objects.create(trade=trade, team=jazz)

        self.assertEqual(trade.trade_teams.count(), 3)
