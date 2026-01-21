from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.mixins import TeamContextMixin
from api.permissions import HasTeamContext
from config.api import StandardResponse, StandardViewSet
from league.models import DraftPick, Player, RosterPlayer, Team, Trade
from league.serializers import (
    TradeAnalysisSerializer,
    TradeCreateSerializer,
    TradeDetailSerializer,
    TradeListSerializer,
    TradeUpdateSerializer,
)


class TradeViewSet(TeamContextMixin, StandardViewSet):
    permission_classes = [IsAuthenticated, HasTeamContext]

    def get_serializer_class(self):
        if self.action == "create":
            return TradeCreateSerializer
        if self.action == "partial_update":
            return TradeUpdateSerializer
        if self.action in ["retrieve", "execute"]:
            return TradeDetailSerializer
        if self.action == "analyze":
            return TradeAnalysisSerializer
        return TradeListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["team"] = self.get_team()
        return context

    def list(self, request):
        """List trades involving teams in user's leagues."""
        league = self.get_league()

        queryset = (
            Trade.objects.filter(league=league)
            .prefetch_related(
                "trade_teams__team", "assets__player", "assets__draft_pick"
            )
            .order_by("-created_at")
        )

        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        team_id = request.query_params.get("team_id")
        if team_id:
            queryset = queryset.filter(trade_teams__team_id=team_id)

        date_from = request.query_params.get("date_from")
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)

        date_to = request.query_params.get("date_to")
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        serializer = self.get_serializer(queryset, many=True)
        return StandardResponse(
            data=serializer.data,
            message="Trades retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        """Retrieve full trade details with all assets."""
        league = self.get_league()

        try:
            trade = (
                Trade.objects.prefetch_related(
                    "trade_teams__team",
                    "assets__player",
                    "assets__draft_pick",
                    "assets__from_team",
                    "assets__to_team",
                )
                .select_related("proposed_by")
                .get(pk=pk, league=league)
            )
        except Trade.DoesNotExist:
            return StandardResponse(
                error="Trade not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(trade)
        return StandardResponse(
            data=serializer.data,
            message="Trade retrieved successfully.",
            status=status.HTTP_200_OK,
        )

    def create(self, request):
        """Create a new trade proposal."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        trade = serializer.save()

        response_serializer = TradeDetailSerializer(
            trade, context=self.get_serializer_context()
        )
        return StandardResponse(
            data=response_serializer.data,
            message="Trade proposal created successfully.",
            status=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, pk=None):
        """Update trade status (accept, reject, cancel)."""
        league = self.get_league()
        team = self.get_team()

        try:
            trade = Trade.objects.get(pk=pk, league=league)
        except Trade.DoesNotExist:
            return StandardResponse(
                error="Trade not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        if not trade.trade_teams.filter(team=team).exists():
            if league.commissioner != request.user:
                return StandardResponse(
                    error="You are not involved in this trade.",
                    error_code="PERMISSION_DENIED",
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = self.get_serializer(trade, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_serializer = TradeDetailSerializer(
            trade, context=self.get_serializer_context()
        )
        return StandardResponse(
            data=response_serializer.data,
            message="Trade updated successfully.",
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="analyze", url_name="analyze")
    def analyze(self, request):
        """Analyze a trade proposal without saving."""
        create_serializer = TradeCreateSerializer(
            data=request.data, context=self.get_serializer_context()
        )
        create_serializer.is_valid(raise_exception=True)

        data = create_serializer.validated_data
        team_impacts = {}
        total_fpts = {}

        for asset_data in data["assets"]:
            from_team = Team.objects.get(id=asset_data["from_team"])
            to_team = Team.objects.get(id=asset_data["to_team"])

            for team in [from_team, to_team]:
                team_id = str(team.id)
                if team_id not in team_impacts:
                    team_impacts[team_id] = {
                        "team_id": team.id,
                        "team_name": team.name,
                        "current_salary": team.current_salary,
                        "salary_delta": 0,
                        "players_incoming": [],
                        "players_outgoing": [],
                        "fpts_delta": 0,
                    }

            if asset_data.get("player_id"):
                player = Player.objects.get(id=asset_data["player_id"])
                try:
                    roster_entry = RosterPlayer.objects.get(
                        fantasy_team=from_team, player=player
                    )
                    salary = roster_entry.salary
                    fpts = player.fpts_avg or 0

                    from_team_id = str(from_team.id)
                    to_team_id = str(to_team.id)

                    team_impacts[from_team_id]["salary_delta"] -= salary
                    team_impacts[from_team_id]["fpts_delta"] -= fpts
                    team_impacts[from_team_id]["players_outgoing"].append(
                        {
                            "name": player.name,
                            "salary": salary,
                            "fpts_avg": fpts,
                        }
                    )

                    team_impacts[to_team_id]["salary_delta"] += salary
                    team_impacts[to_team_id]["fpts_delta"] += fpts
                    team_impacts[to_team_id]["players_incoming"].append(
                        {
                            "name": player.name,
                            "salary": salary,
                            "fpts_avg": fpts,
                        }
                    )
                except RosterPlayer.DoesNotExist:
                    pass

        errors = []
        warnings = []

        league = self.get_league()
        for team_id, impact in team_impacts.items():
            salary_after = impact["current_salary"] + impact["salary_delta"]
            impact["salary_after_trade"] = salary_after
            impact["cap_space_after"] = league.salary_cap - salary_after

            if salary_after > league.salary_cap:
                warnings.append(
                    f"{impact['team_name']} would exceed salary cap "
                    f"({salary_after} > {league.salary_cap})"
                )

            total_fpts[impact["team_name"]] = {
                "fpts_delta": impact["fpts_delta"],
            }

        for asset_data in data["assets"]:
            if asset_data.get("player_id"):
                player = Player.objects.get(id=asset_data["player_id"])
                from_team = Team.objects.get(id=asset_data["from_team"])
                try:
                    roster_entry = RosterPlayer.objects.get(
                        fantasy_team=from_team, player=player
                    )
                    if roster_entry.trade_blocked:
                        errors.append(f"{player.name} is trade blocked")
                except RosterPlayer.DoesNotExist:
                    errors.append(f"{player.name} is not on {from_team.name}'s roster")

            if asset_data.get("draft_pick_id"):
                draft_pick = DraftPick.objects.get(id=asset_data["draft_pick_id"])
                from_team = Team.objects.get(id=asset_data["from_team"])
                if draft_pick.current_team != from_team:
                    errors.append(
                        f"Draft pick {draft_pick.year} R{draft_pick.round} "
                        f"is not owned by {from_team.name}"
                    )

        analysis_data = {
            "valid": len(errors) == 0,
            "validation_errors": errors,
            "warnings": warnings,
            "team_impacts": list(team_impacts.values()),
            "total_fpts_comparison": total_fpts,
        }

        return StandardResponse(
            data=analysis_data,
            message="Trade analysis completed.",
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="execute", url_name="execute")
    def execute(self, request, pk=None):
        """Commissioner only - execute an accepted trade."""
        league = self.get_league()

        if league.commissioner != request.user:
            return StandardResponse(
                error="Only the commissioner can execute trades.",
                error_code="PERMISSION_DENIED",
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            trade = Trade.objects.get(pk=pk, league=league)
        except Trade.DoesNotExist:
            return StandardResponse(
                error="Trade not found.",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        if trade.status != Trade.Status.ACCEPTED:
            return StandardResponse(
                error=(
                    f"Trade must be in 'accepted' status to execute. "
                    f"Current: {trade.status}"
                ),
                error_code="INVALID_STATUS",
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            trade.execute()
        except ValueError as e:
            return StandardResponse(
                error=str(e),
                error_code="VALIDATION_ERROR",
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(trade)
        return StandardResponse(
            data=serializer.data,
            message="Trade executed successfully.",
            status=status.HTTP_200_OK,
        )
