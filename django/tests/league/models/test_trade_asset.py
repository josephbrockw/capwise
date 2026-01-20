import os

from django.test import TestCase
from league.models import DraftPick, Player, Team, Trade, TradeAsset


class TradeAssetModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation_with_player(self):
        asset = TradeAsset.objects.get(pk="99999999-9999-9999-9999-999999999991")
        str_repr = str(asset)
        self.assertIn("Scottie Pippen", str_repr)
        self.assertIn("Chicago Bulls Dynasty", str_repr)
        self.assertIn("Seattle SuperSonics", str_repr)

    def test_str_representation_with_draft_pick(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        bulls_pick = DraftPick.objects.get(pk="66666666-6666-6666-6666-666666666661")

        asset = TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            draft_pick=bulls_pick,
        )

        str_repr = str(asset)
        self.assertIn("1997", str_repr)
        self.assertIn("Round 1", str_repr)

    def test_trade_assets_count(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        self.assertEqual(trade.assets.count(), 2)

    def test_outgoing_trade_assets_relation(self):
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        outgoing = bulls.outgoing_trade_assets.all()
        self.assertEqual(outgoing.count(), 1)
        self.assertEqual(outgoing.first().player.name, "Scottie Pippen")

    def test_incoming_trade_assets_relation(self):
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        incoming = bulls.incoming_trade_assets.all()
        self.assertEqual(incoming.count(), 1)
        self.assertEqual(incoming.first().player.name, "Gary Payton")

    def test_cascade_delete_with_trade(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        asset_count = TradeAsset.objects.filter(trade=trade).count()
        self.assertEqual(asset_count, 2)

        trade.delete()
        asset_count = TradeAsset.objects.filter(
            trade__pk="77777777-7777-7777-7777-777777777771"
        ).count()
        self.assertEqual(asset_count, 0)

    def test_set_null_on_player_delete(self):
        asset = TradeAsset.objects.get(pk="99999999-9999-9999-9999-999999999991")
        player = asset.player
        self.assertIsNotNone(player)

        player.delete()
        asset.refresh_from_db()
        self.assertIsNone(asset.player)

    def test_set_null_on_draft_pick_delete(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        bulls_pick = DraftPick.objects.get(pk="66666666-6666-6666-6666-666666666661")

        asset = TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            draft_pick=bulls_pick,
        )

        bulls_pick.delete()
        asset.refresh_from_db()
        self.assertIsNone(asset.draft_pick)

    def test_player_trade_assets_relation(self):
        pippen = Player.objects.get(name="Scottie Pippen")
        self.assertEqual(pippen.trade_assets.count(), 1)

    def test_draft_pick_trade_assets_relation(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        bulls_pick = DraftPick.objects.get(pk="66666666-6666-6666-6666-666666666661")

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            draft_pick=bulls_pick,
        )

        self.assertEqual(bulls_pick.trade_assets.count(), 1)
