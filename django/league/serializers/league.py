from rest_framework import serializers

from django.utils import timezone
from league.models import League, Team


class TeamSummarySerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "abbreviation",
            "owner_name",
            "wins",
            "losses",
            "standing",
        ]

    def get_owner_name(self, obj):
        return obj.owner.name if obj.owner else None


class LeagueListSerializer(serializers.ModelSerializer):
    team_count = serializers.SerializerMethodField()

    class Meta:
        model = League
        fields = ["id", "name", "year", "team_count"]

    def get_team_count(self, obj):
        return obj.teams.count()


class LeagueDetailSerializer(serializers.ModelSerializer):
    teams = TeamSummarySerializer(many=True, read_only=True)
    team_count = serializers.SerializerMethodField()
    needs_sync = serializers.SerializerMethodField()

    class Meta:
        model = League
        fields = [
            "id",
            "name",
            "year",
            "salary_cap",
            "min_salary",
            "roster_size",
            "draft_open",
            "espn_league_id",
            "last_sync_date",
            "needs_sync",
            "salary_escalation_settings",
            "team_count",
            "teams",
        ]

    def get_team_count(self, obj):
        return obj.teams.count()

    def get_needs_sync(self, obj):
        if not obj.last_sync_date:
            return True
        hours_since_sync = (timezone.now() - obj.last_sync_date).total_seconds() / 3600
        return hours_since_sync > 24


class LeagueSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = [
            "salary_cap",
            "min_salary",
            "roster_size",
            "salary_escalation_settings",
        ]
