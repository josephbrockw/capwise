from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from api.permissions import HasTeamContext, IsLeagueCommissioner
from config.api import StandardResponse
from django.utils import timezone
from league.services.espn_sync import run_espn_sync


class SyncRequestSerializer(serializers.Serializer):
    sync_type = serializers.ChoiceField(
        choices=["full", "players", "rosters"],
        default="full",
    )
    force = serializers.BooleanField(default=False)


class ESPNSyncView(APIView):
    permission_classes = [IsAuthenticated, HasTeamContext, IsLeagueCommissioner]

    def post(self, request):
        """Trigger ESPN sync for the league."""
        serializer = SyncRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        league = request.team.league
        sync_type = serializer.validated_data["sync_type"]
        force = serializer.validated_data["force"]

        result = run_espn_sync(league, sync_type=sync_type, force=force)

        if result.success:
            return StandardResponse(
                data={
                    "status": "completed",
                    "players_created": result.players_created,
                    "players_updated": result.players_updated,
                    "teams_created": result.teams_created,
                    "teams_updated": result.teams_updated,
                    "roster_players_added": result.roster_players_added,
                    "roster_players_removed": result.roster_players_removed,
                },
                message=result.message,
                status=status.HTTP_200_OK,
            )
        else:
            return StandardResponse(
                error=result.message,
                error_code="SYNC_FAILED",
                status=status.HTTP_400_BAD_REQUEST,
            )


class ESPNSyncStatusView(APIView):
    permission_classes = [IsAuthenticated, HasTeamContext]

    def get(self, request):
        """Get sync status for the league."""
        league = request.team.league

        needs_sync = True
        if league.last_sync_date:
            hours_since_sync = (
                timezone.now() - league.last_sync_date
            ).total_seconds() / 3600
            needs_sync = hours_since_sync > 24

        return StandardResponse(
            data={
                "last_sync_date": league.last_sync_date,
                "needs_sync": needs_sync,
                "espn_league_id": league.espn_league_id,
            },
            message="Sync status retrieved successfully",
            status=status.HTTP_200_OK,
        )
