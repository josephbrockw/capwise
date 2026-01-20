import os

from django.test import TestCase
from league.models import (
    DraftPick,
    League,
    Player,
    RosterPlayer,
    Team,
    Trade,
    TradeAsset,
    TradeTeam,
)


class TradeModelTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "fixtures/league_data.yaml"),
    ]

    def test_str_representation(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        str_repr = str(trade)
        self.assertIn("proposed", str_repr)
        self.assertIn("Chicago Bulls Dynasty", str_repr)
        self.assertIn("Seattle SuperSonics", str_repr)

    def test_trade_status_choices(self):
        self.assertEqual(Trade.Status.PROPOSED, "proposed")
        self.assertEqual(Trade.Status.ACCEPTED, "accepted")
        self.assertEqual(Trade.Status.REJECTED, "rejected")
        self.assertEqual(Trade.Status.COMPLETED, "completed")
        self.assertEqual(Trade.Status.CANCELLED, "cancelled")

    def test_validate_valid_trade(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        result = trade.validate()
        self.assertTrue(result["valid"])
        self.assertEqual(len(result["errors"]), 0)

    def test_validate_trade_blocked_player(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        rodman = Player.objects.get(name="Dennis Rodman")

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            player=rodman,
        )

        result = trade.validate()
        self.assertFalse(result["valid"])
        self.assertTrue(any("trade blocked" in error for error in result["errors"]))

    def test_validate_player_not_on_roster(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        olajuwon = Player.objects.get(name="Hakeem Olajuwon")

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            player=olajuwon,
        )

        result = trade.validate()
        self.assertFalse(result["valid"])
        self.assertTrue(any("not on" in error for error in result["errors"]))

    def test_validate_draft_pick_wrong_owner(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        jazz_pick = DraftPick.objects.get(pk="66666666-6666-6666-6666-666666666663")

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            draft_pick=jazz_pick,
        )

        result = trade.validate()
        self.assertFalse(result["valid"])
        self.assertTrue(any("not owned by" in error for error in result["errors"]))

    def test_validate_asset_with_both_player_and_pick(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        pippen = Player.objects.get(name="Scottie Pippen")
        bulls_pick = DraftPick.objects.get(pk="66666666-6666-6666-6666-666666666661")

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            player=pippen,
            draft_pick=bulls_pick,
        )

        result = trade.validate()
        self.assertFalse(result["valid"])
        self.assertTrue(
            any("both player and draft_pick" in error for error in result["errors"])
        )

    def test_validate_asset_with_neither_player_nor_pick(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
        )

        result = trade.validate()
        self.assertFalse(result["valid"])
        self.assertTrue(
            any("neither player nor draft_pick" in error for error in result["errors"])
        )

    def test_validate_salary_cap_warning(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        league.salary_cap = 150
        league.save()

        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        result = trade.validate()

        self.assertTrue(result["valid"])
        self.assertTrue(len(result["warnings"]) > 0)
        self.assertTrue(
            any("exceed salary cap" in warning for warning in result["warnings"])
        )

    def test_execute_moves_players(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        pippen = Player.objects.get(name="Scottie Pippen")
        payton = Player.objects.get(name="Gary Payton")

        self.assertTrue(
            RosterPlayer.objects.filter(fantasy_team=bulls, player=pippen).exists()
        )
        self.assertTrue(
            RosterPlayer.objects.filter(fantasy_team=sonics, player=payton).exists()
        )

        trade.execute()

        self.assertFalse(
            RosterPlayer.objects.filter(fantasy_team=bulls, player=pippen).exists()
        )
        self.assertTrue(
            RosterPlayer.objects.filter(fantasy_team=sonics, player=pippen).exists()
        )
        self.assertFalse(
            RosterPlayer.objects.filter(fantasy_team=sonics, player=payton).exists()
        )
        self.assertTrue(
            RosterPlayer.objects.filter(fantasy_team=bulls, player=payton).exists()
        )

    def test_execute_updates_status(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        self.assertEqual(trade.status, Trade.Status.PROPOSED)

        trade.execute()
        trade.refresh_from_db()

        self.assertEqual(trade.status, Trade.Status.COMPLETED)
        self.assertIsNotNone(trade.executed_at)

    def test_execute_moves_draft_picks(self):
        league = League.objects.get(name="90s Legends Dynasty League")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")

        trade = Trade.objects.create(league=league, status=Trade.Status.PROPOSED)
        TradeTeam.objects.create(trade=trade, team=bulls)
        TradeTeam.objects.create(trade=trade, team=sonics)

        bulls_pick = DraftPick.objects.get(pk="66666666-6666-6666-6666-666666666661")
        self.assertEqual(bulls_pick.current_team, bulls)

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            draft_pick=bulls_pick,
        )

        trade.execute()
        bulls_pick.refresh_from_db()

        self.assertEqual(bulls_pick.current_team, sonics)

    def test_execute_fails_on_invalid_trade(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        sonics = Team.objects.get(name="Seattle SuperSonics")
        olajuwon = Player.objects.get(name="Hakeem Olajuwon")

        TradeAsset.objects.create(
            trade=trade,
            from_team=bulls,
            to_team=sonics,
            player=olajuwon,
        )

        with self.assertRaises(ValueError) as context:
            trade.execute()

        self.assertIn("validation failed", str(context.exception))

    def test_execute_resets_keeper_status(self):
        trade = Trade.objects.get(pk="77777777-7777-7777-7777-777777777771")
        pippen = Player.objects.get(name="Scottie Pippen")
        sonics = Team.objects.get(name="Seattle SuperSonics")

        original_roster = RosterPlayer.objects.get(player=pippen)
        self.assertTrue(original_roster.is_keeper)
        self.assertEqual(original_roster.keeper_years, 2)

        trade.execute()

        new_roster = RosterPlayer.objects.get(fantasy_team=sonics, player=pippen)
        self.assertFalse(new_roster.is_keeper)
        self.assertEqual(new_roster.keeper_years, 0)
        self.assertFalse(new_roster.acquired_by_draft)
        self.assertFalse(new_roster.trade_blocked)
