from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.mixins import TeamContextMixin
from api.permissions import HasTeamContext
from config.api import StandardResponse, StandardViewSet
from league.models import League, Team
from league.serializers import (
    LeagueDetailSerializer,
    LeagueListSerializer,
    LeagueSettingsSerializer,
    TeamDetailSerializer,
    TeamListSerializer,
    TeamRosterSerializer,
)


class LeagueViewSet(StandardViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return LeagueDetailSerializer
        if self.action == "partial_update":
            return LeagueSettingsSerializer
        return LeagueListSerializer

    def list(self, request):
        """Returns leagues the authenticated user participates in."""
        leagues = request.user.get_leagues()
        serializer = self.get_serializer(leagues, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Leagues retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        """Returns league details with teams and settings."""
        try:
            league = League.objects.prefetch_related("teams", "teams__owner").get(pk=pk)
        except League.DoesNotExist:
            return StandardResponse(
                error="League not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        user_leagues = request.user.get_leagues()
        if league not in user_leagues:
            return StandardResponse(
                error="You don't have access to this league.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(league)
        return StandardResponse(
            data=serializer.data,
            message="League details retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request, pk=None):
        """Commissioner only - update league settings."""
        try:
            league = League.objects.get(pk=pk)
        except League.DoesNotExist:
            return StandardResponse(
                error="League not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        if league.commissioner != request.user:
            return StandardResponse(
                error="Only the commissioner can update league settings.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(league, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return StandardResponse(
            data=serializer.data,
            message="League settings updated successfully.",
            status=status.HTTP_200_OK,
        )


class TeamViewSet(TeamContextMixin, StandardViewSet):
    permission_classes = [IsAuthenticated, HasTeamContext]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TeamDetailSerializer
        if self.action == "roster":
            return TeamRosterSerializer
        return TeamListSerializer

    def list(self, request):
        """Returns all teams in the current league context."""
        league = self.get_league()

        teams = Team.objects.filter(league=league).select_related("owner")
        serializer = self.get_serializer(teams, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Teams retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        """Returns team details with full roster."""
        league = self.get_league()

        try:
            team = (
                Team.objects.select_related("owner", "league")
                .prefetch_related("roster_players", "roster_players__player")
                .get(pk=pk, league=league)
            )
        except Team.DoesNotExist:
            return StandardResponse(
                error="Team not found in this league.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(team)
        return StandardResponse(
            data=serializer.data,
            message="Team details retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], url_path="roster", url_name="roster")
    def roster(self, request, pk=None):
        """Detailed roster with player stats."""
        league = self.get_league()

        try:
            team = (
                Team.objects.select_related("owner")
                .prefetch_related(
                    "roster_players",
                    "roster_players__player",
                    "roster_players__player__positions",
                )
                .get(pk=pk, league=league)
            )
        except Team.DoesNotExist:
            return StandardResponse(
                error="Team not found in this league.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(team)
        return StandardResponse(
            data=serializer.data,
            message="Team roster retrieved successfully.",
            status=status.HTTP_200_OK,
        )
