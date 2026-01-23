from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from league.models import DraftPick, League, Team


class TeamSignalTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
        )
        self.league = League.objects.create(
            name="Test League",
            year=2026,
            salary_cap=300,
            min_salary=1,
            roster_size=16,
            commissioner=self.user,
            espn_league_id=123456,
        )

    def test_draft_picks_created_on_team_creation(self):
        """
        When a team is created, 7 years of 1st and 2nd
        round picks should be created.
        """
        team = Team.objects.create(
            league=self.league,
            name="Test Team",
            owner=self.user,
            espn_team_id=1,
        )

        picks = DraftPick.objects.filter(original_team=team)
        self.assertEqual(picks.count(), 14)

        current_year = datetime.now().year
        current_month = datetime.now().month
        if current_month >= 10:
            start_year = current_year + 1
        else:
            start_year = current_year

        for year_offset in range(7):
            year = start_year + year_offset
            year_picks = picks.filter(year=year)
            self.assertEqual(year_picks.count(), 2)
            self.assertTrue(year_picks.filter(round=1).exists())
            self.assertTrue(year_picks.filter(round=2).exists())

    def test_draft_picks_belong_to_correct_team(self):
        """
        Draft picks should have original_team and current_team
        set to the new team.
        """
        team = Team.objects.create(
            league=self.league,
            name="Test Team",
            owner=self.user,
            espn_team_id=1,
        )

        picks = DraftPick.objects.filter(original_team=team)
        for pick in picks:
            self.assertEqual(pick.original_team, team)
            self.assertEqual(pick.current_team, team)
            self.assertEqual(pick.league, self.league)

    def test_draft_picks_not_created_on_team_update(self):
        """Draft picks should only be created on team creation, not updates."""
        team = Team.objects.create(
            league=self.league,
            name="Test Team",
            owner=self.user,
            espn_team_id=1,
        )

        initial_count = DraftPick.objects.filter(original_team=team).count()
        self.assertEqual(initial_count, 14)

        team.name = "Updated Team Name"
        team.save()

        final_count = DraftPick.objects.filter(original_team=team).count()
        self.assertEqual(final_count, 14)

    def test_multiple_teams_get_separate_picks(self):
        """Each team should get their own set of draft picks."""
        team1 = Team.objects.create(
            league=self.league,
            name="Team 1",
            owner=self.user,
            espn_team_id=1,
        )
        team2 = Team.objects.create(
            league=self.league,
            name="Team 2",
            owner=self.user,
            espn_team_id=2,
        )

        team1_picks = DraftPick.objects.filter(original_team=team1)
        team2_picks = DraftPick.objects.filter(original_team=team2)

        self.assertEqual(team1_picks.count(), 14)
        self.assertEqual(team2_picks.count(), 14)
        self.assertEqual(DraftPick.objects.filter(league=self.league).count(), 28)
