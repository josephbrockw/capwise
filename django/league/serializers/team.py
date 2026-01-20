from rest_framework import serializers

from league.models import Player, RosterPlayer, Team


class RosterPlayerSummarySerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source="player.name", read_only=True)
    player_id = serializers.UUIDField(source="player.id", read_only=True)

    class Meta:
        model = RosterPlayer
        fields = [
            "id",
            "player_id",
            "player_name",
            "salary",
            "is_keeper",
            "keeper_years",
        ]


class TeamListSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    current_salary = serializers.IntegerField(read_only=True)
    cap_space = serializers.IntegerField(read_only=True)

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
            "current_salary",
            "cap_space",
        ]

    def get_owner_name(self, obj):
        return obj.owner.name if obj.owner else None


class TeamDetailSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    current_salary = serializers.IntegerField(read_only=True)
    cap_space = serializers.IntegerField(read_only=True)
    roster_summary = RosterPlayerSummarySerializer(
        source="roster_players", many=True, read_only=True
    )
    league_name = serializers.CharField(source="league.name", read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "abbreviation",
            "logo_url",
            "owner_name",
            "wins",
            "losses",
            "standing",
            "espn_team_id",
            "current_salary",
            "cap_space",
            "league_name",
            "roster_summary",
        ]

    def get_owner_name(self, obj):
        return obj.owner.name if obj.owner else None


class PlayerDetailForRosterSerializer(serializers.ModelSerializer):
    positions = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            "id",
            "player_id",
            "name",
            "positions",
            "nba_team",
            "projected_value",
            "fpts_avg",
            "pts_avg",
            "reb_avg",
            "ast_avg",
            "stl_avg",
            "blk_avg",
            "to_avg",
            "fg_pct",
            "ft_pct",
            "three_pct",
            "gp",
            "is_injured",
        ]

    def get_positions(self, obj):
        return list(obj.positions.values_list("code", flat=True))


class RosterPlayerDetailSerializer(serializers.ModelSerializer):
    player = PlayerDetailForRosterSerializer(read_only=True)

    class Meta:
        model = RosterPlayer
        fields = [
            "id",
            "player",
            "salary",
            "is_keeper",
            "keeper_years",
            "acquired_by_draft",
            "trade_blocked",
        ]


class TeamRosterSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    current_salary = serializers.IntegerField(read_only=True)
    cap_space = serializers.IntegerField(read_only=True)
    roster_players = RosterPlayerDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "abbreviation",
            "owner_name",
            "current_salary",
            "cap_space",
            "roster_players",
        ]

    def get_owner_name(self, obj):
        return obj.owner.name if obj.owner else None
