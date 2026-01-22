import os

from rest_framework import status
from rest_framework.test import APIClient

from account.models import User
from django.test import TestCase
from league.models import DraftPick, League, Player, Rookie, Team


class DraftPickViewSetTest(TestCase):
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
        self.league = League.objects.get(name="90s Legends Dynasty League")
        self.league.commissioner = self.commissioner
        self.league.save()

        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.bulls.owner = self.user
        self.bulls.save()

        self.draft_pick = DraftPick.objects.get(
            pk="66666666-6666-6666-6666-666666666661"
        )
        self.kobe_rookie = Rookie.objects.get(name="Kobe Bryant")

    def test_list_draft_picks_unauthenticated(self):
        response = self.client.get(
            "/api/league/draft-picks",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_draft_picks_without_team_context(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/league/draft-picks")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_draft_picks_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/draft-picks?year=1997",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertGreater(len(data), 0)

    def test_list_draft_picks_returns_flat_team_fields(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/draft-picks?year=1997",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertGreater(len(data), 0)
        pick = data[0]
        self.assertIn("original_team_id", pick)
        self.assertIn("original_team_name", pick)
        self.assertIn("current_team_id", pick)
        self.assertIn("current_team_name", pick)
        self.assertIn("year", pick)
        self.assertIn("round", pick)

    def test_list_draft_picks_filter_by_year(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/draft-picks?year=1997",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        for pick in data:
            self.assertEqual(pick["year"], 1997)

    def test_list_draft_picks_filter_by_team(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/draft-picks?team_id={self.bulls.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        for pick in data:
            self.assertEqual(pick["current_team_id"], str(self.bulls.id))

    def test_list_draft_picks_filter_by_round(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/draft-picks?round=1",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        for pick in data:
            self.assertEqual(pick["round"], 1)

    def test_retrieve_draft_pick_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/draft-picks/{self.draft_pick.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(data["year"], 1997)
        self.assertEqual(data["round"], 1)

    def test_retrieve_draft_pick_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/draft-picks/00000000-0000-0000-0000-000000000000",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            f"/api/league/draft-picks/{self.draft_pick.id}",
            {"pick_number": 5, "projected_number": 6},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.draft_pick.refresh_from_db()
        self.assertEqual(self.draft_pick.pick_number, 5)
        self.assertEqual(self.draft_pick.projected_number, 6)

    def test_partial_update_assign_rookie(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            f"/api/league/draft-picks/{self.draft_pick.id}",
            {"rookie_id": str(self.kobe_rookie.id)},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.draft_pick.refresh_from_db()
        self.assertEqual(self.draft_pick.rookie, self.kobe_rookie)

    def test_partial_update_as_non_commissioner_denied(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/league/draft-picks/{self.draft_pick.id}",
            {"pick_number": 5},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_history_endpoint(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/draft-picks/{self.draft_pick.id}/history",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(data["pick_id"], str(self.draft_pick.id))
        self.assertIn("trades", data)


class RookieViewSetTest(TestCase):
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
        self.league = League.objects.get(name="90s Legends Dynasty League")
        self.league.commissioner = self.commissioner
        self.league.save()

        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.bulls.owner = self.user
        self.bulls.save()

        self.kobe_rookie = Rookie.objects.get(name="Kobe Bryant")
        self.jordan = Player.objects.get(name="Michael Jordan")

    def test_list_rookies_unauthenticated(self):
        response = self.client.get(
            "/api/league/rookies",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_rookies_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/rookies",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(len(data), 4)

    def test_list_rookies_filter_by_year(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/rookies?rookie_year=1996",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        for rookie in data:
            self.assertEqual(rookie["rookie_year"], 1996)

    def test_list_rookies_filter_available(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/rookies?available=true",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        for rookie in data:
            self.assertIsNone(rookie.get("player_id"))
            self.assertIsNone(rookie.get("player_name"))

    def test_retrieve_rookie_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            f"/api/league/rookies/{self.kobe_rookie.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertEqual(data["name"], "Kobe Bryant")
        self.assertEqual(data["nba_team"], "LAL")

    def test_retrieve_rookie_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/rookies/00000000-0000-0000-0000-000000000000",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_rookie_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.post(
            "/api/league/rookies",
            {
                "name": "Tim Duncan",
                "nba_team": "SAS",
                "rookie_rank": 1,
                "rookie_year": 1997,
            },
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()["data"]
        self.assertEqual(data["name"], "Tim Duncan")
        self.assertTrue(Rookie.objects.filter(name="Tim Duncan").exists())

    def test_create_rookie_as_non_commissioner_denied(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/rookies",
            {
                "name": "Tim Duncan",
                "nba_team": "SAS",
                "rookie_rank": 1,
                "rookie_year": 1997,
            },
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            f"/api/league/rookies/{self.kobe_rookie.id}",
            {"rookie_rank": 10},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.kobe_rookie.refresh_from_db()
        self.assertEqual(self.kobe_rookie.rookie_rank, 10)

    def test_partial_update_link_to_player(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.patch(
            f"/api/league/rookies/{self.kobe_rookie.id}",
            {"player_id": str(self.jordan.id)},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.kobe_rookie.refresh_from_db()
        self.assertEqual(self.kobe_rookie.player, self.jordan)

    def test_partial_update_as_non_commissioner_denied(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f"/api/league/rookies/{self.kobe_rookie.id}",
            {"rookie_rank": 10},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_destroy_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        rookie_id = self.kobe_rookie.id
        response = self.client.delete(
            f"/api/league/rookies/{rookie_id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Rookie.objects.filter(id=rookie_id).exists())

    def test_destroy_as_non_commissioner_denied(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(
            f"/api/league/rookies/{self.kobe_rookie.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
