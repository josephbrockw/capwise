from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from api.permissions import HasTeamContext, IsLeagueCommissioner
from config.api import StandardResponse
from league.services.lottery import get_lottery_odds, get_lottery_result, run_lottery


class LotteryOddsSerializer(serializers.Serializer):
    team_id = serializers.UUIDField(source="team.id")
    team_name = serializers.CharField(source="team.name")
    position = serializers.IntegerField()
    odds = serializers.FloatField()
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()


class LotteryResultSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    year = serializers.IntegerField()
    executed_at = serializers.DateTimeField()
    executed_by = serializers.CharField(source="executed_by.username", allow_null=True)
    first_pick_team_id = serializers.UUIDField(source="first_pick_team.id")
    first_pick_team_name = serializers.CharField(source="first_pick_team.name")
    second_pick_team_id = serializers.UUIDField(source="second_pick_team.id")
    second_pick_team_name = serializers.CharField(source="second_pick_team.name")
    results = serializers.JSONField()


class RunLotteryView(APIView):
    permission_classes = [IsAuthenticated, HasTeamContext, IsLeagueCommissioner]

    def post(self, request):
        """Execute the draft lottery for the league."""
        league = request.team.league

        try:
            lottery_result = run_lottery(league, request.user)
            serializer = LotteryResultSerializer(lottery_result)

            return StandardResponse(
                data=serializer.data,
                message="Lottery executed successfully",
                status=status.HTTP_201_CREATED,
            )
        except ValueError as e:
            return StandardResponse(
                error=str(e),
                error_code="LOTTERY_ERROR",
                status=status.HTTP_400_BAD_REQUEST,
            )


class LotteryOddsView(APIView):
    permission_classes = [IsAuthenticated, HasTeamContext]

    def get(self, request):
        """Get lottery odds for eligible teams."""
        league = request.team.league
        odds = get_lottery_odds(league)
        serializer = LotteryOddsSerializer(odds, many=True)

        return StandardResponse(
            data=serializer.data,
            message="Lottery odds retrieved successfully",
            status=status.HTTP_200_OK,
        )


class LotteryResultView(APIView):
    permission_classes = [IsAuthenticated, HasTeamContext]

    def get(self, request):
        """Get lottery results for the current or specified year."""
        league = request.team.league
        year = request.query_params.get("year")

        if year:
            try:
                year = int(year)
            except ValueError:
                return StandardResponse(
                    error="Invalid year parameter",
                    error_code="INVALID_YEAR",
                    status=status.HTTP_400_BAD_REQUEST,
                )

        result = get_lottery_result(league, year)

        if not result:
            return StandardResponse(
                error="No lottery results found",
                error_code="NOT_FOUND",
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LotteryResultSerializer(result)
        return StandardResponse(
            data=serializer.data,
            message="Lottery results retrieved successfully",
            status=status.HTTP_200_OK,
        )
