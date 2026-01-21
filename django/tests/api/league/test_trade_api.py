import os

from rest_framework import status
from rest_framework.test import APIClient

from account.models import User
from django.test import TestCase
from league.models import DraftPick, League, Player, RosterPlayer, Team, Trade


class TradeViewSetTest(TestCase):
    base_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="mjordan",
            email="mj@bulls.com",
            password="airjordan23",
        )
        self.commissioner = User.objects.create_user(
            username="commissioner",
            email="commish@league.com",
            password="commissioner123",
        )
        self.other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="other123",
        )
        self.league = League.objects.get(name="90s Legends Dynasty League")
        self.league.commissioner = self.commissioner
        self.league.save()

        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.bulls.owner = self.user
        self.bulls.save()

        self.sonics = Team.objects.get(name="Seattle SuperSonics")
        self.sonics.owner = self.other_user
        self.sonics.save()

        self.jordan = Player.objects.get(name="Michael Jordan")
        self.pippen = Player.objects.get(name="Scottie Pippen")
        self.payton = Player.objects.get(name="Gary Payton")

        self.proposed_trade = Trade.objects.get(
            pk="77777777-7777-7777-7777-777777777771"
        )
        self.completed_trade = Trade.objects.get(
            pk="77777777-7777-7777-7777-777777777772"
        )

    def test_list_trades_unauthenticated(self):
        response = self.client.get(
            "/api/league/trades",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_trades_without_team_context(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/league/trades")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_trades_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/trades",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertGreaterEqual(len(data), 2)

    def test_list_trades_filter_by_status(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/trades?status=proposed",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        for trade in data:
            self.assertEqual(trade["status"], "proposed")

    def test_list_trades_filter_by_team(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/trades?team_id={self.bulls.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        for trade in data:
            team_names = trade["teams"]
            self.assertTrue(
                any("Bulls" in name or "Chicago" in name for name in team_names)
            )

    def test_retrieve_trade_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/trades/{self.proposed_trade.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(data["status"], "proposed")
        self.assertIn("teams", data)
        self.assertIn("assets", data)

    def test_retrieve_trade_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/trades/00000000-0000-0000-0000-000000000000",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_trade_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/trades",
            {
                "league_id": str(self.league.id),
                "teams": [str(self.bulls.id), str(self.sonics.id)],
                "assets": [
                    {
                        "from_team": str(self.bulls.id),
                        "to_team": str(self.sonics.id),
                        "player_id": str(self.pippen.id),
                    },
                    {
                        "from_team": str(self.sonics.id),
                        "to_team": str(self.bulls.id),
                        "player_id": str(self.payton.id),
                    },
                ],
                "notes": "Test trade",
            },
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()["data"]
        self.assertEqual(data["status"], "proposed")
        self.assertEqual(len(data["assets"]), 2)

    def test_create_trade_with_draft_pick(self):
        self.client.force_authenticate(user=self.user)
        draft_pick = DraftPick.objects.filter(current_team=self.bulls).first()

        response = self.client.post(
            "/api/league/trades",
            {
                "league_id": str(self.league.id),
                "teams": [str(self.bulls.id), str(self.sonics.id)],
                "assets": [
                    {
                        "from_team": str(self.bulls.id),
                        "to_team": str(self.sonics.id),
                        "draft_pick_id": str(draft_pick.id),
                    },
                ],
                "notes": "Draft pick trade",
            },
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_partial_update_accept_trade(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/league/trades/{self.proposed_trade.id}",
            {"status": "accepted"},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.proposed_trade.refresh_from_db()
        self.assertEqual(self.proposed_trade.status, "accepted")

    def test_partial_update_reject_trade(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/league/trades/{self.proposed_trade.id}",
            {"status": "rejected"},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.proposed_trade.refresh_from_db()
        self.assertEqual(self.proposed_trade.status, "rejected")

    def test_partial_update_invalid_transition(self):
        self.proposed_trade.status = Trade.Status.REJECTED
        self.proposed_trade.save()

        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/league/trades/{self.proposed_trade.id}",
            {"status": "accepted"},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_analyze_trade(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/trades/analyze",
            {
                "league_id": str(self.league.id),
                "teams": [str(self.bulls.id), str(self.sonics.id)],
                "assets": [
                    {
                        "from_team": str(self.bulls.id),
                        "to_team": str(self.sonics.id),
                        "player_id": str(self.pippen.id),
                    },
                    {
                        "from_team": str(self.sonics.id),
                        "to_team": str(self.bulls.id),
                        "player_id": str(self.payton.id),
                    },
                ],
            },
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("valid", data)
        self.assertIn("validation_errors", data)
        self.assertIn("warnings", data)
        self.assertIn("team_impacts", data)

    def test_analyze_trade_blocked_player(self):
        rodman = Player.objects.get(name="Dennis Rodman")
        roster_entry = RosterPlayer.objects.get(player=rodman)
        self.assertTrue(roster_entry.trade_blocked)

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/trades/analyze",
            {
                "league_id": str(self.league.id),
                "teams": [str(self.bulls.id), str(self.sonics.id)],
                "assets": [
                    {
                        "from_team": str(self.bulls.id),
                        "to_team": str(self.sonics.id),
                        "player_id": str(rodman.id),
                    },
                ],
            },
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertFalse(data["valid"])
        self.assertTrue(
            any("trade blocked" in err for err in data["validation_errors"])
        )

    def test_execute_trade_as_commissioner(self):
        self.proposed_trade.status = Trade.Status.ACCEPTED
        self.proposed_trade.save()

        self.client.force_authenticate(user=self.commissioner)
        response = self.client.post(
            f"/api/league/trades/{self.proposed_trade.id}/execute",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.proposed_trade.refresh_from_db()
        self.assertEqual(self.proposed_trade.status, "completed")

    def test_execute_trade_as_non_commissioner_denied(self):
        self.proposed_trade.status = Trade.Status.ACCEPTED
        self.proposed_trade.save()

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            f"/api/league/trades/{self.proposed_trade.id}/execute",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_execute_trade_wrong_status(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.post(
            f"/api/league/trades/{self.proposed_trade.id}/execute",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertIn("accepted", data["error"])
