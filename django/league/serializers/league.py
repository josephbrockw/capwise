from rest_framework import serializers

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
            "salary_escalation_settings",
            "team_count",
            "teams",
        ]

    def get_team_count(self, obj):
        return obj.teams.count()


class LeagueSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = League
        fields = [
            "salary_cap",
            "min_salary",
            "roster_size",
            "salary_escalation_settings",
        ]
