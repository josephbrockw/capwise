from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from api.mixins import TeamContextMixin
from api.permissions import HasTeamContext
from config.api import StandardResponse, StandardViewSet
from league.models import Player
from league.serializers import (
    PlayerDetailSerializer,
    PlayerListSerializer,
    PlayerUpdateSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


class PlayerViewSet(TeamContextMixin, StandardViewSet):
    permission_classes = [IsAuthenticated, HasTeamContext]
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PlayerDetailSerializer
        if self.action == "partial_update":
            return PlayerUpdateSerializer
        return PlayerListSerializer

    def get_queryset(self):
        queryset = Player.objects.prefetch_related("positions", "roster_entries")

        name = self.request.query_params.get("name")
        if name:
            queryset = queryset.filter(name__icontains=name)

        position = self.request.query_params.get("position")
        if position:
            queryset = queryset.filter(positions__code=position)

        nba_team = self.request.query_params.get("nba_team")
        if nba_team:
            queryset = queryset.filter(nba_team__iexact=nba_team)

        rostered = self.request.query_params.get("rostered")
        if rostered is not None:
            if rostered.lower() == "true":
                queryset = queryset.filter(roster_entries__isnull=False)
            elif rostered.lower() == "false":
                queryset = queryset.filter(roster_entries__isnull=True)

        min_value = self.request.query_params.get("min_projected_value")
        if min_value:
            queryset = queryset.filter(projected_value__gte=float(min_value))

        max_value = self.request.query_params.get("max_projected_value")
        if max_value:
            queryset = queryset.filter(projected_value__lte=float(max_value))

        return queryset.distinct()

    def list(self, request):
        """Search/filter players."""
        queryset = self.get_queryset()

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return StandardResponse(
                data={
                    "results": serializer.data,
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                },
                message="Players retrieved successfully.",
                status=status.HTTP_200_OK,
            )

        serializer = self.get_serializer(queryset, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Players retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        """Player details with stats and current roster status."""
        try:
            player = Player.objects.prefetch_related(
                "positions", "roster_entries", "roster_entries__fantasy_team"
            ).get(pk=pk)
        except Player.DoesNotExist:
            return StandardResponse(
                error="Player not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(player)
        return StandardResponse(
            data=serializer.data,
            message="Player details retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def partial_update(self, request, pk=None):
        """Commissioner only - update projected_value, positions."""
        league = self.get_league()

        if league.commissioner != request.user:
            return StandardResponse(
                error="Only the commissioner can update player data.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            player = Player.objects.prefetch_related("positions").get(pk=pk)
        except Player.DoesNotExist:
            return StandardResponse(
                error="Player not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(player, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return StandardResponse(
            data=PlayerDetailSerializer(player).data,
            message="Player updated successfully.",
            status=status.HTTP_200_OK,
        )
