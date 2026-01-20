import os

from account.models import User
from api.middleware import TeamContextMiddleware
from django.test import RequestFactory, TestCase
from league.models import Team


class TeamContextMiddlewareTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = TeamContextMiddleware(lambda r: r)
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
        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.bulls.owner = self.user
        self.bulls.save()
        self.league = self.bulls.league
        self.league.commissioner = self.commissioner
        self.league.save()

    def test_no_header_sets_team_to_none(self):
        request = self.factory.get("/api/test/")
        request.user = self.user
        self.middleware(request)
        self.assertIsNone(request.team)

    def test_invalid_uuid_sets_team_to_none(self):
        request = self.factory.get("/api/test/", HTTP_X_TEAM_CONTEXT="not-a-uuid")
        request.user = self.user
        self.middleware(request)
        self.assertIsNone(request.team)

    def test_nonexistent_team_sets_team_to_none(self):
        request = self.factory.get(
            "/api/test/",
            HTTP_X_TEAM_CONTEXT="00000000-0000-0000-0000-000000000000",
        )
        request.user = self.user
        self.middleware(request)
        self.assertIsNone(request.team)

    def test_owner_can_access_team(self):
        request = self.factory.get("/api/test/", HTTP_X_TEAM_CONTEXT=str(self.bulls.id))
        request.user = self.user
        self.middleware(request)
        self.assertEqual(request.team, self.bulls)

    def test_commissioner_can_access_team(self):
        request = self.factory.get("/api/test/", HTTP_X_TEAM_CONTEXT=str(self.bulls.id))
        request.user = self.commissioner
        self.middleware(request)
        self.assertEqual(request.team, self.bulls)

    def test_non_owner_non_commissioner_cannot_access_team(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="other123",
        )
        request = self.factory.get("/api/test/", HTTP_X_TEAM_CONTEXT=str(self.bulls.id))
        request.user = other_user
        self.middleware(request)
        self.assertIsNone(request.team)

    def test_unauthenticated_user_gets_team(self):
        from django.contrib.auth.models import AnonymousUser

        request = self.factory.get("/api/test/", HTTP_X_TEAM_CONTEXT=str(self.bulls.id))
        request.user = AnonymousUser()
        self.middleware(request)
        self.assertEqual(request.team, self.bulls)
