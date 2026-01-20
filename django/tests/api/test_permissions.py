import os

from account.models import User
from api.permissions import (
    HasTeamContext,
    IsLeagueCommissioner,
    IsTeamOwner,
    IsTeamOwnerOrCommissioner,
)
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from league.models import Team


class MockView:
    pass


class HasTeamContextTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = HasTeamContext()
        self.view = MockView()

    def test_no_team_returns_false(self):
        request = self.factory.get("/api/test/")
        request.team = None
        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_with_team_returns_true(self):
        request = self.factory.get("/api/test/")
        request.team = Team.objects.get(name="Chicago Bulls Dynasty")
        self.assertTrue(self.permission.has_permission(request, self.view))


class IsTeamOwnerTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = IsTeamOwner()
        self.view = MockView()
        self.user = User.objects.create_user(
            username="mjordan",
            email="mj@bulls.com",
            password="airjordan23",
        )
        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.bulls.owner = self.user
        self.bulls.save()

    def test_no_team_returns_false(self):
        request = self.factory.get("/api/test/")
        request.team = None
        request.user = self.user
        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_unauthenticated_returns_false(self):
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = AnonymousUser()
        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_owner_returns_true(self):
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = self.user
        self.assertTrue(self.permission.has_permission(request, self.view))

    def test_non_owner_returns_false(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="other123",
        )
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = other_user
        self.assertFalse(self.permission.has_permission(request, self.view))


class IsLeagueCommissionerTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = IsLeagueCommissioner()
        self.view = MockView()
        self.commissioner = User.objects.create_user(
            username="commissioner",
            email="commish@league.com",
            password="commissioner123",
        )
        self.bulls = Team.objects.get(name="Chicago Bulls Dynasty")
        self.league = self.bulls.league
        self.league.commissioner = self.commissioner
        self.league.save()

    def test_no_team_returns_false(self):
        request = self.factory.get("/api/test/")
        request.team = None
        request.user = self.commissioner
        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_unauthenticated_returns_false(self):
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = AnonymousUser()
        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_commissioner_returns_true(self):
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = self.commissioner
        self.assertTrue(self.permission.has_permission(request, self.view))

    def test_non_commissioner_returns_false(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="other123",
        )
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = other_user
        self.assertFalse(self.permission.has_permission(request, self.view))


class IsTeamOwnerOrCommissionerTest(TestCase):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    fixtures = [
        os.path.join(base_dir, "league/fixtures/league_data.yaml"),
    ]

    def setUp(self):
        self.factory = RequestFactory()
        self.permission = IsTeamOwnerOrCommissioner()
        self.view = MockView()
        self.owner = User.objects.create_user(
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
        self.bulls.owner = self.owner
        self.bulls.save()
        self.league = self.bulls.league
        self.league.commissioner = self.commissioner
        self.league.save()

    def test_no_team_returns_false(self):
        request = self.factory.get("/api/test/")
        request.team = None
        request.user = self.owner
        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_unauthenticated_returns_false(self):
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = AnonymousUser()
        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_owner_returns_true(self):
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = self.owner
        self.assertTrue(self.permission.has_permission(request, self.view))

    def test_commissioner_returns_true(self):
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = self.commissioner
        self.assertTrue(self.permission.has_permission(request, self.view))

    def test_non_owner_non_commissioner_returns_false(self):
        other_user = User.objects.create_user(
            username="other",
            email="other@test.com",
            password="other123",
        )
        request = self.factory.get("/api/test/")
        request.team = self.bulls
        request.user = other_user
        self.assertFalse(self.permission.has_permission(request, self.view))
