from rest_framework import serializers

from league.models import Player, RosterPlayer


class RosterPlayerSerializer(serializers.ModelSerializer):
    player_id = serializers.UUIDField(source="player.id", read_only=True)
    player_name = serializers.CharField(source="player.name", read_only=True)
    positions = serializers.SerializerMethodField()
    nba_team = serializers.CharField(source="player.nba_team", read_only=True)
    projected_value = serializers.FloatField(
        source="player.projected_value", read_only=True
    )
    fpts_avg = serializers.FloatField(source="player.fpts_avg", read_only=True)
    is_injured = serializers.BooleanField(source="player.is_injured", read_only=True)

    class Meta:
        model = RosterPlayer
        fields = [
            "id",
            "player_id",
            "player_name",
            "positions",
            "nba_team",
            "projected_value",
            "fpts_avg",
            "is_injured",
            "salary",
            "is_keeper",
            "keeper_years",
            "acquired_by_draft",
            "trade_blocked",
        ]

    def get_positions(self, obj):
        return list(obj.player.positions.values_list("code", flat=True))


class RosterPlayerCreateSerializer(serializers.Serializer):
    player_id = serializers.UUIDField()
    salary = serializers.IntegerField()

    def validate_player_id(self, value):
        try:
            player = Player.objects.get(id=value)
        except Player.DoesNotExist:
            raise serializers.ValidationError("Player not found.")

        if RosterPlayer.objects.filter(player=player).exists():
            raise serializers.ValidationError("Player is already on a roster.")

        return value

    def validate_salary(self, value):
        team = self.context.get("team")
        if team and value < team.league.min_salary:
            raise serializers.ValidationError(
                f"Salary must be at least {team.league.min_salary}."
            )
        return value

    def validate(self, data):
        team = self.context.get("team")
        if not team:
            raise serializers.ValidationError("Team context is required.")

        league = team.league

        if not league.draft_open:
            new_total = team.current_salary + data["salary"]
            if new_total > league.salary_cap:
                raise serializers.ValidationError(
                    f"Adding this player would exceed salary cap. "
                    f"Current: {team.current_salary}, "
                    f"New salary: {data['salary']}, "
                    f"Cap: {league.salary_cap}."
                )

        return data

    def create(self, validated_data):
        team = self.context.get("team")
        player = Player.objects.get(id=validated_data["player_id"])

        return RosterPlayer.objects.create(
            fantasy_team=team,
            player=player,
            salary=validated_data["salary"],
        )


class RosterPlayerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RosterPlayer
        fields = ["salary", "is_keeper", "keeper_years", "trade_blocked"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        team = self.context.get("team")

        if request and team:
            is_commissioner = team.league.commissioner == request.user
            if not is_commissioner:
                self.fields.pop("salary", None)


class RosterPlayerBatchUpdateSerializer(serializers.Serializer):
    updates = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_updates(self, value):
        for update in value:
            if "id" not in update:
                raise serializers.ValidationError(
                    "Each update must include an 'id' field."
                )

            allowed_fields = {
                "id",
                "salary",
                "is_keeper",
                "keeper_years",
                "trade_blocked",
            }
            extra_fields = set(update.keys()) - allowed_fields
            if extra_fields:
                raise serializers.ValidationError(
                    f"Unknown fields: {', '.join(extra_fields)}"
                )

        return value

    def save(self):
        team = self.context.get("team")
        updates = self.validated_data["updates"]
        updated_roster_players = []

        for update in updates:
            roster_player_id = update.pop("id")
            try:
                roster_player = RosterPlayer.objects.get(
                    id=roster_player_id,
                    fantasy_team=team,
                )
            except RosterPlayer.DoesNotExist:
                continue

            for field, value in update.items():
                setattr(roster_player, field, value)
            roster_player.save()
            updated_roster_players.append(roster_player)

        return updated_roster_players
