from rest_framework import serializers

from league.models import Player, Position, RosterPlayer


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ["code", "name"]


class PlayerListSerializer(serializers.ModelSerializer):
    positions = serializers.SerializerMethodField()
    on_roster = serializers.BooleanField(read_only=True)

    class Meta:
        model = Player
        fields = [
            "id",
            "name",
            "positions",
            "nba_team",
            "projected_value",
            "fpts_avg",
            "is_injured",
            "on_roster",
        ]

    def get_positions(self, obj):
        return list(obj.positions.values_list("code", flat=True))


class RosterEntrySerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source="fantasy_team.name", read_only=True)
    team_id = serializers.UUIDField(source="fantasy_team.id", read_only=True)

    class Meta:
        model = RosterPlayer
        fields = [
            "id",
            "team_id",
            "team_name",
            "salary",
            "is_keeper",
            "keeper_years",
            "acquired_by_draft",
            "trade_blocked",
        ]


class PlayerDetailSerializer(serializers.ModelSerializer):
    positions = serializers.SerializerMethodField()
    on_roster = serializers.BooleanField(read_only=True)
    roster_entry = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            "id",
            "player_id",
            "name",
            "positions",
            "nba_team",
            "projected_value",
            "rookie_year",
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
            "on_roster",
            "roster_entry",
        ]

    def get_positions(self, obj):
        return list(obj.positions.values_list("code", flat=True))

    def get_roster_entry(self, obj):
        roster = obj.roster_entries.first()
        if roster:
            return RosterEntrySerializer(roster).data
        return None


class PlayerUpdateSerializer(serializers.ModelSerializer):
    positions = serializers.ListField(
        child=serializers.CharField(max_length=5),
        required=False,
    )

    class Meta:
        model = Player
        fields = ["projected_value", "positions"]

    def update(self, instance, validated_data):
        positions_data = validated_data.pop("positions", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if positions_data is not None:
            positions = Position.objects.filter(code__in=positions_data)
            instance.positions.set(positions)

        return instance
