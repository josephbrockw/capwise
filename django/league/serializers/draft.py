from rest_framework import serializers

from league.models import DraftPick, Player, Position, Rookie, Team


class TeamMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name"]


class RookieSerializer(serializers.ModelSerializer):
    positions = serializers.SerializerMethodField()
    player_id = serializers.UUIDField(source="player.id", read_only=True)
    player_name = serializers.CharField(source="player.name", read_only=True)

    class Meta:
        model = Rookie
        fields = [
            "id",
            "name",
            "nba_team",
            "rookie_rank",
            "rookie_year",
            "positions",
            "player_id",
            "player_name",
        ]

    def get_positions(self, obj):
        return list(obj.positions.values_list("code", flat=True))


class RookieCreateSerializer(serializers.ModelSerializer):
    positions = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Rookie
        fields = ["name", "nba_team", "rookie_rank", "rookie_year", "positions"]

    def create(self, validated_data):
        positions_data = validated_data.pop("positions", [])
        rookie = Rookie.objects.create(**validated_data)

        if positions_data:
            positions = Position.objects.filter(code__in=positions_data)
            rookie.positions.set(positions)

        return rookie


class RookieUpdateSerializer(serializers.ModelSerializer):
    positions = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )
    player_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Rookie
        fields = [
            "name",
            "nba_team",
            "rookie_rank",
            "rookie_year",
            "positions",
            "player_id",
        ]

    def validate_player_id(self, value):
        if value:
            try:
                Player.objects.get(id=value)
            except Player.DoesNotExist:
                raise serializers.ValidationError("Player not found.")
        return value

    def update(self, instance, validated_data):
        positions_data = validated_data.pop("positions", None)
        player_id = validated_data.pop("player_id", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if positions_data is not None:
            positions = Position.objects.filter(code__in=positions_data)
            instance.positions.set(positions)

        if player_id is not None:
            instance.player = Player.objects.get(id=player_id)
        elif player_id is None and "player_id" in self.initial_data:
            instance.player = None

        instance.save()
        return instance


class DraftPickListSerializer(serializers.ModelSerializer):
    original_team_id = serializers.UUIDField(source="original_team.id", read_only=True)
    original_team_name = serializers.CharField(
        source="original_team.name", read_only=True
    )
    current_team_id = serializers.UUIDField(source="current_team.id", read_only=True)
    current_team_name = serializers.CharField(
        source="current_team.name", read_only=True
    )
    assigned_name = serializers.SerializerMethodField()

    class Meta:
        model = DraftPick
        fields = [
            "id",
            "year",
            "round",
            "pick_number",
            "projected_number",
            "original_team_id",
            "original_team_name",
            "current_team_id",
            "current_team_name",
            "assigned_name",
            "is_rostered",
        ]

    def get_assigned_name(self, obj):
        if obj.player:
            return obj.player.name
        if obj.rookie:
            return obj.rookie.name
        return None


class DraftPickDetailSerializer(serializers.ModelSerializer):
    original_team = TeamMinimalSerializer(read_only=True)
    current_team = TeamMinimalSerializer(read_only=True)
    player = serializers.SerializerMethodField()
    rookie = RookieSerializer(read_only=True)

    class Meta:
        model = DraftPick
        fields = [
            "id",
            "year",
            "round",
            "pick_number",
            "projected_number",
            "original_team",
            "current_team",
            "player",
            "rookie",
            "is_rostered",
        ]

    def get_player(self, obj):
        if obj.player:
            return {
                "id": obj.player.id,
                "name": obj.player.name,
                "nba_team": obj.player.nba_team,
            }
        return None


class DraftPickUpdateSerializer(serializers.ModelSerializer):
    rookie_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = DraftPick
        fields = ["pick_number", "projected_number", "rookie_id"]

    def validate_rookie_id(self, value):
        if value:
            try:
                Rookie.objects.get(id=value)
            except Rookie.DoesNotExist:
                raise serializers.ValidationError("Rookie not found.")
        return value

    def update(self, instance, validated_data):
        rookie_id = validated_data.pop("rookie_id", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if rookie_id is not None:
            instance.rookie = Rookie.objects.get(id=rookie_id)
        elif rookie_id is None and "rookie_id" in self.initial_data:
            instance.rookie = None

        instance.save()
        return instance


class DraftPickHistorySerializer(serializers.Serializer):
    pick_id = serializers.UUIDField()
    year = serializers.IntegerField()
    round = serializers.IntegerField()
    original_team = TeamMinimalSerializer()
    current_team = TeamMinimalSerializer()
    trades = serializers.ListField(child=serializers.DictField(), default=list)
