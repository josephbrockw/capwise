from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.mixins import TeamContextMixin
from api.permissions import (
    HasTeamContext,
    IsLeagueCommissioner,
    IsTeamOwnerOrCommissioner,
)
from config.api import StandardResponse, StandardViewSet
from league.models import RosterPlayer
from league.serializers import (
    RosterPlayerBatchUpdateSerializer,
    RosterPlayerCreateSerializer,
    RosterPlayerSerializer,
    RosterPlayerUpdateSerializer,
)


class RosterViewSet(TeamContextMixin, StandardViewSet):
    permission_classes = [IsAuthenticated, HasTeamContext, IsTeamOwnerOrCommissioner]

    def get_serializer_class(self):
        if self.action == "create":
            return RosterPlayerCreateSerializer
        if self.action == "partial_update":
            return RosterPlayerUpdateSerializer
        if self.action == "batch_update":
            return RosterPlayerBatchUpdateSerializer
        return RosterPlayerSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["team"] = self.get_team()
        return context

    def list(self, request):
        """Returns roster for team in context."""
        team = self.get_team()

        roster_players = (
            RosterPlayer.objects.filter(fantasy_team=team)
            .select_related("player")
            .prefetch_related("player__positions")
        )

        serializer = self.get_serializer(roster_players, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Roster retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def create(self, request):
        """Add a free agent to roster."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        roster_player = serializer.save()

        response_serializer = RosterPlayerSerializer(
            roster_player,
            context=self.get_serializer_context(),
        )
        return StandardResponse(
            data=response_serializer.data,
            message="Player added to roster successfully.",
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk=None):
        """Release player from roster."""
        team = self.get_team()

        try:
            roster_player = RosterPlayer.objects.get(pk=pk, fantasy_team=team)
        except RosterPlayer.DoesNotExist:
            return StandardResponse(
                error="Roster player not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        player_name = roster_player.player.name
        roster_player.delete()

        return StandardResponse(
            data={"player_name": player_name},
            message=f"{player_name} released from roster.",
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request, pk=None):
        """Update roster player details."""
        team = self.get_team()

        try:
            roster_player = RosterPlayer.objects.select_related("player").get(
                pk=pk, fantasy_team=team
            )
        except RosterPlayer.DoesNotExist:
            return StandardResponse(
                error="Roster player not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        if "salary" in request.data:
            league = self.get_league()
            if league.commissioner != request.user:
                return StandardResponse(
                    error="Only the commissioner can update salary.",
                    error_code="PERMISSION_DENIED",
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = self.get_serializer(roster_player, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = RosterPlayerSerializer(
            roster_player,
            context=self.get_serializer_context(),
        )
        return StandardResponse(
            data=response_serializer.data,
            message="Roster player updated successfully.",
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="batch-update",
        url_name="batch_update",
        permission_classes=[IsAuthenticated, HasTeamContext, IsLeagueCommissioner],
    )
    def batch_update(self, request):
        """Commissioner only - batch update roster entries."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_roster_players = serializer.save()

        response_serializer = RosterPlayerSerializer(
            updated_roster_players,
            many=True,
            context=self.get_serializer_context(),
        )
        return StandardResponse(
            data=response_serializer.data,
            message=f"{len(updated_roster_players)} roster entries updated.",
            status=status.HTTP_200_OK,
        )
