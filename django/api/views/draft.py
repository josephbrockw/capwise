from datetime import datetime

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.mixins import TeamContextMixin
from api.permissions import HasTeamContext
from config.api import StandardResponse, StandardViewSet
from league.models import DraftPick, Rookie, Trade, TradeAsset
from league.serializers import (
    DraftPickDetailSerializer,
    DraftPickHistorySerializer,
    DraftPickListSerializer,
    DraftPickUpdateSerializer,
    RookieCreateSerializer,
    RookieSerializer,
    RookieUpdateSerializer,
)


class DraftPickViewSet(TeamContextMixin, StandardViewSet):
    permission_classes = [IsAuthenticated, HasTeamContext]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return DraftPickDetailSerializer
        if self.action == "partial_update":
            return DraftPickUpdateSerializer
        if self.action == "history":
            return DraftPickHistorySerializer
        return DraftPickListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["team"] = self.get_team()
        return context

    def list(self, request):
        """List draft picks filtered by league, year, team, round."""
        league = self.get_league()

        queryset = DraftPick.objects.filter(league=league).select_related(
            "original_team", "current_team", "player", "rookie"
        )

        year = request.query_params.get("year")
        if year:
            queryset = queryset.filter(year=year)
        else:
            current_year = datetime.now().year
            queryset = queryset.filter(
                year__gte=current_year, year__lte=current_year + 2
            )

        team_id = request.query_params.get("team_id")
        if team_id:
            queryset = queryset.filter(current_team_id=team_id)

        original_team_id = request.query_params.get("original_team_id")
        if original_team_id:
            queryset = queryset.filter(original_team_id=original_team_id)

        round_num = request.query_params.get("round")
        if round_num:
            queryset = queryset.filter(round=round_num)

        queryset = queryset.order_by("year", "round", "pick_number", "projected_number")

        serializer = self.get_serializer(queryset, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Draft picks retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        """Retrieve draft pick details with rookie if assigned."""
        league = self.get_league()

        try:
            draft_pick = (
                DraftPick.objects.select_related(
                    "original_team", "current_team", "player", "rookie"
                )
                .prefetch_related("rookie__positions")
                .get(pk=pk, league=league)
            )
        except DraftPick.DoesNotExist:
            return StandardResponse(
                error="Draft pick not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(draft_pick)
        return StandardResponse(
            data=serializer.data,
            message="Draft pick retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request, pk=None):
        """Commissioner only - update pick_number, projected_number, assign rookie."""
        league = self.get_league()

        if league.commissioner != request.user:
            return StandardResponse(
                error="Only the commissioner can update draft picks.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            draft_pick = DraftPick.objects.get(pk=pk, league=league)
        except DraftPick.DoesNotExist:
            return StandardResponse(
                error="Draft pick not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(draft_pick, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = DraftPickDetailSerializer(
            draft_pick, context=self.get_serializer_context()
        )
        return StandardResponse(
            data=response_serializer.data,
            message="Draft pick updated successfully.",
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], url_path="history", url_name="history")
    def history(self, request, pk=None):
        """Get draft pick ownership history through trades."""
        league = self.get_league()

        try:
            draft_pick = DraftPick.objects.select_related(
                "original_team", "current_team"
            ).get(pk=pk, league=league)
        except DraftPick.DoesNotExist:
            return StandardResponse(
                error="Draft pick not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        trade_assets = (
            TradeAsset.objects.filter(draft_pick=draft_pick)
            .select_related("trade", "from_team", "to_team")
            .order_by("trade__executed_at")
        )

        trades = []
        for asset in trade_assets:
            if asset.trade.status == Trade.Status.COMPLETED:
                trades.append(
                    {
                        "trade_id": str(asset.trade.id),
                        "executed_at": (
                            asset.trade.executed_at.isoformat()
                            if asset.trade.executed_at
                            else None
                        ),
                        "from_team": {
                            "id": str(asset.from_team.id),
                            "name": asset.from_team.name,
                        },
                        "to_team": {
                            "id": str(asset.to_team.id),
                            "name": asset.to_team.name,
                        },
                    }
                )

        history_data = {
            "pick_id": draft_pick.id,
            "year": draft_pick.year,
            "round": draft_pick.round,
            "original_team": {
                "id": draft_pick.original_team.id,
                "name": draft_pick.original_team.name,
            },
            "current_team": {
                "id": draft_pick.current_team.id,
                "name": draft_pick.current_team.name,
            },
            "trades": trades,
        }

        return StandardResponse(
            data=history_data,
            message="Draft pick history retrieved successfully.",
            status=status.HTTP_200_OK,
        )


class RookieViewSet(TeamContextMixin, StandardViewSet):
    permission_classes = [IsAuthenticated, HasTeamContext]

    def get_serializer_class(self):
        if self.action == "create":
            return RookieCreateSerializer
        if self.action == "partial_update":
            return RookieUpdateSerializer
        return RookieSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["team"] = self.get_team()
        return context

    def list(self, request):
        """List rookies filtered by year, position, available status."""
        queryset = Rookie.objects.prefetch_related("positions", "player")

        rookie_year = request.query_params.get("rookie_year")
        if rookie_year:
            queryset = queryset.filter(rookie_year=rookie_year)

        position = request.query_params.get("position")
        if position:
            queryset = queryset.filter(positions__code=position)

        available = request.query_params.get("available")
        if available and available.lower() == "true":
            queryset = queryset.filter(player__isnull=True)

        queryset = queryset.order_by("rookie_rank", "name")

        serializer = self.get_serializer(queryset, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Rookies retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        """Retrieve rookie details."""
        try:
            rookie = Rookie.objects.prefetch_related("positions").get(pk=pk)
        except Rookie.DoesNotExist:
            return StandardResponse(
                error="Rookie not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(rookie)
        return StandardResponse(
            data=serializer.data,
            message="Rookie retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def create(self, request):
        """Commissioner only - add new rookie."""
        league = self.get_league()

        if league.commissioner != request.user:
            return StandardResponse(
                error="Only the commissioner can create rookies.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rookie = serializer.save()

        response_serializer = RookieSerializer(
            rookie, context=self.get_serializer_context()
        )
        return StandardResponse(
            data=response_serializer.data,
            message="Rookie created successfully.",
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, pk=None):
        """Commissioner only - update rank, link to player."""
        league = self.get_league()

        if league.commissioner != request.user:
            return StandardResponse(
                error="Only the commissioner can update rookies.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            rookie = Rookie.objects.prefetch_related("positions").get(pk=pk)
        except Rookie.DoesNotExist:
            return StandardResponse(
                error="Rookie not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(rookie, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = RookieSerializer(
            rookie, context=self.get_serializer_context()
        )
        return StandardResponse(
            data=response_serializer.data,
            message="Rookie updated successfully.",
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, pk=None):
        """Commissioner only - delete rookie."""
        league = self.get_league()

        if league.commissioner != request.user:
            return StandardResponse(
                error="Only the commissioner can delete rookies.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            rookie = Rookie.objects.get(pk=pk)
        except Rookie.DoesNotExist:
            return StandardResponse(
                error="Rookie not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        rookie_name = rookie.name
        rookie.delete()

        return StandardResponse(
            data={"name": rookie_name},
            message=f"Rookie {rookie_name} deleted successfully.",
            status=status.HTTP_200_OK,
        )
