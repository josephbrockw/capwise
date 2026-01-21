import os

from rest_framework import status
from rest_framework.test import APIClient

from account.models import User
from django.test import TestCase
from league.models import League, Player, RosterPlayer, Team


class RosterViewSetTest(TestCase):
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
        self.olajuwon = Player.objects.get(name="Hakeem Olajuwon")

    def test_list_roster_unauthenticated(self):
        response = self.client.get(
            "/api/league/roster",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_roster_without_team_context(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/league/roster")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_roster_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            "/api/league/roster",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 3)

    def test_list_roster_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        response = self.client.get(
            "/api/league/roster",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 3)

    def test_list_roster_not_owner_or_commissioner(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(
            "/api/league/roster",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_roster_player_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/roster",
            {"player_id": str(self.olajuwon.id), "salary": 50},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["data"]["player_name"], "Hakeem Olajuwon")
        self.assertEqual(response.json()["data"]["salary"], 50)

    def test_create_roster_player_already_rostered(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/roster",
            {"player_id": str(self.jordan.id), "salary": 50},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_roster_player_below_min_salary(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/roster",
            {"player_id": str(self.olajuwon.id), "salary": 0},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_roster_player_exceeds_cap_in_season(self):
        self.league.draft_open = False
        self.league.salary_cap = 100
        self.league.save()

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/roster",
            {"player_id": str(self.olajuwon.id), "salary": 50},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_roster_player_no_cap_check_during_draft(self):
        self.league.draft_open = True
        self.league.salary_cap = 100
        self.league.save()

        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            "/api/league/roster",
            {"player_id": str(self.olajuwon.id), "salary": 50},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_destroy_roster_player_success(self):
        self.client.force_authenticate(user=self.user)
        roster_player = RosterPlayer.objects.filter(fantasy_team=self.bulls).first()

        response = self.client.delete(
            f"/api/league/roster/{roster_player.id}",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(RosterPlayer.objects.filter(id=roster_player.id).exists())

    def test_destroy_roster_player_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(
            "/api/league/roster/00000000-0000-0000-0000-000000000000",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_partial_update_non_salary_fields_as_owner(self):
        self.client.force_authenticate(user=self.user)
        roster_player = RosterPlayer.objects.filter(fantasy_team=self.bulls).first()

        response = self.client.patch(
            f"/api/league/roster/{roster_player.id}",
            {"is_keeper": True, "keeper_years": 2},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        roster_player.refresh_from_db()
        self.assertTrue(roster_player.is_keeper)
        self.assertEqual(roster_player.keeper_years, 2)

    def test_partial_update_salary_as_owner_denied(self):
        self.client.force_authenticate(user=self.user)
        roster_player = RosterPlayer.objects.filter(fantasy_team=self.bulls).first()

        response = self.client.patch(
            f"/api/league/roster/{roster_player.id}",
            {"salary": 100},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_salary_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        roster_player = RosterPlayer.objects.filter(fantasy_team=self.bulls).first()

        response = self.client.patch(
            f"/api/league/roster/{roster_player.id}",
            {"salary": 100},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        roster_player.refresh_from_db()
        self.assertEqual(roster_player.salary, 100)

    def test_batch_update_as_commissioner(self):
        self.client.force_authenticate(user=self.commissioner)
        roster_players = RosterPlayer.objects.filter(fantasy_team=self.bulls)[:2]

        updates = [
            {"id": str(rp.id), "salary": 75, "is_keeper": True} for rp in roster_players
        ]

        response = self.client.post(
            "/api/league/roster/batch-update",
            {"updates": updates},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]), 2)

        for rp in roster_players:
            rp.refresh_from_db()
            self.assertEqual(rp.salary, 75)
            self.assertTrue(rp.is_keeper)

    def test_batch_update_as_owner_denied(self):
        self.client.force_authenticate(user=self.user)
        roster_players = RosterPlayer.objects.filter(fantasy_team=self.bulls)[:2]

        updates = [{"id": str(rp.id), "salary": 75} for rp in roster_players]

        response = self.client.post(
            "/api/league/roster/batch-update",
            {"updates": updates},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_batch_update_invalid_field(self):
        self.client.force_authenticate(user=self.commissioner)
        roster_player = RosterPlayer.objects.filter(fantasy_team=self.bulls).first()

        response = self.client.post(
            "/api/league/roster/batch-update",
            {"updates": [{"id": str(roster_player.id), "invalid_field": "value"}]},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_batch_update_missing_id(self):
        self.client.force_authenticate(user=self.commissioner)

        response = self.client.post(
            "/api/league/roster/batch-update",
            {"updates": [{"salary": 75}]},
            format="json",
            HTTP_X_TEAM_CONTEXT=str(self.bulls.id),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
