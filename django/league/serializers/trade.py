from rest_framework import serializers

from league.models import (
    DraftPick,
    League,
    Player,
    RosterPlayer,
    Team,
    Trade,
    TradeAsset,
    TradeTeam,
)


class TradeTeamSerializer(serializers.ModelSerializer):
    team_id = serializers.UUIDField(source="team.id")
    team_name = serializers.CharField(source="team.name")

    class Meta:
        model = TradeTeam
        fields = ["team_id", "team_name"]


class TradeAssetSerializer(serializers.ModelSerializer):
    player_id = serializers.UUIDField(source="player.id", read_only=True)
    player_name = serializers.CharField(source="player.name", read_only=True)
    player_salary = serializers.SerializerMethodField()
    draft_pick_id = serializers.UUIDField(source="draft_pick.id", read_only=True)
    draft_pick_details = serializers.SerializerMethodField()
    from_team_id = serializers.UUIDField(source="from_team.id")
    from_team_name = serializers.CharField(source="from_team.name", read_only=True)
    to_team_id = serializers.UUIDField(source="to_team.id")
    to_team_name = serializers.CharField(source="to_team.name", read_only=True)

    class Meta:
        model = TradeAsset
        fields = [
            "id",
            "player_id",
            "player_name",
            "player_salary",
            "draft_pick_id",
            "draft_pick_details",
            "from_team_id",
            "from_team_name",
            "to_team_id",
            "to_team_name",
        ]

    def get_player_salary(self, obj):
        if obj.player:
            try:
                roster_player = RosterPlayer.objects.get(
                    fantasy_team=obj.from_team, player=obj.player
                )
                return roster_player.salary
            except RosterPlayer.DoesNotExist:
                return None
        return None

    def get_draft_pick_details(self, obj):
        if obj.draft_pick:
            return {
                "year": obj.draft_pick.year,
                "round": obj.draft_pick.round,
                "pick_number": obj.draft_pick.pick_number,
                "original_team": obj.draft_pick.original_team.name,
            }
        return None


class TradeListSerializer(serializers.ModelSerializer):
    teams = serializers.SerializerMethodField()

    class Meta:
        model = Trade
        fields = ["id", "status", "created_at", "executed_at", "notes", "teams"]

    def get_teams(self, obj):
        assets = obj.assets.select_related(
            "player", "draft_pick", "draft_pick__original_team", "from_team", "to_team"
        )

        team_data = {}
        for trade_team in obj.trade_teams.select_related("team"):
            team_data[str(trade_team.team.id)] = {
                "team_id": str(trade_team.team.id),
                "team_name": trade_team.team.name,
                "assets_sent": [],
                "assets_received": [],
            }

        for asset in assets:
            asset_info = {
                "id": str(asset.id),
                "type": "player" if asset.player else "draft_pick",
                "from_team_id": str(asset.from_team.id),
                "from_team_name": asset.from_team.name,
                "to_team_id": str(asset.to_team.id),
                "to_team_name": asset.to_team.name,
            }

            if asset.player:
                asset_info["player"] = {
                    "id": str(asset.player.id),
                    "name": asset.player.name,
                }
            elif asset.draft_pick:
                asset_info["draft_pick"] = {
                    "id": str(asset.draft_pick.id),
                    "year": asset.draft_pick.year,
                    "round": asset.draft_pick.round,
                    "original_team_name": asset.draft_pick.original_team.name,
                }

            from_team_id = str(asset.from_team.id)
            to_team_id = str(asset.to_team.id)

            if from_team_id in team_data:
                team_data[from_team_id]["assets_sent"].append(asset_info)
            if to_team_id in team_data:
                team_data[to_team_id]["assets_received"].append(asset_info)

        return list(team_data.values())


class TradeDetailSerializer(serializers.ModelSerializer):
    teams = TradeTeamSerializer(source="trade_teams", many=True, read_only=True)
    assets = TradeAssetSerializer(many=True, read_only=True)
    proposed_by_name = serializers.CharField(
        source="proposed_by.username", read_only=True
    )

    class Meta:
        model = Trade
        fields = [
            "id",
            "league",
            "status",
            "created_at",
            "executed_at",
            "proposed_by",
            "proposed_by_name",
            "notes",
            "teams",
            "assets",
        ]


class TradeAssetCreateSerializer(serializers.Serializer):
    from_team = serializers.UUIDField()
    to_team = serializers.UUIDField()
    player_id = serializers.UUIDField(required=False, allow_null=True)
    draft_pick_id = serializers.UUIDField(required=False, allow_null=True)

    def validate(self, data):
        if not data.get("player_id") and not data.get("draft_pick_id"):
            raise serializers.ValidationError(
                "Either player_id or draft_pick_id must be provided."
            )
        if data.get("player_id") and data.get("draft_pick_id"):
            raise serializers.ValidationError(
                "Only one of player_id or draft_pick_id can be provided."
            )
        return data


class TradeCreateSerializer(serializers.Serializer):
    league_id = serializers.UUIDField()
    teams = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=2,
    )
    assets = serializers.ListField(
        child=TradeAssetCreateSerializer(),
        min_length=1,
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_league_id(self, value):
        try:
            League.objects.get(id=value)
        except League.DoesNotExist:
            raise serializers.ValidationError("League not found.")
        return value

    def validate_teams(self, value):
        teams = Team.objects.filter(id__in=value)
        if len(teams) != len(value):
            raise serializers.ValidationError("One or more teams not found.")
        return value

    def validate_assets(self, value):
        for asset in value:
            if asset.get("player_id"):
                try:
                    Player.objects.get(id=asset["player_id"])
                except Player.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Player {asset['player_id']} not found."
                    )
            if asset.get("draft_pick_id"):
                try:
                    DraftPick.objects.get(id=asset["draft_pick_id"])
                except DraftPick.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Draft pick {asset['draft_pick_id']} not found."
                    )
        return value

    def create(self, validated_data):
        league = League.objects.get(id=validated_data["league_id"])
        user = self.context.get("request").user

        trade = Trade.objects.create(
            league=league,
            proposed_by=user,
            notes=validated_data.get("notes", ""),
        )

        for team_id in validated_data["teams"]:
            team = Team.objects.get(id=team_id)
            TradeTeam.objects.create(trade=trade, team=team)

        for asset_data in validated_data["assets"]:
            from_team = Team.objects.get(id=asset_data["from_team"])
            to_team = Team.objects.get(id=asset_data["to_team"])

            player = None
            draft_pick = None

            if asset_data.get("player_id"):
                player = Player.objects.get(id=asset_data["player_id"])
            if asset_data.get("draft_pick_id"):
                draft_pick = DraftPick.objects.get(id=asset_data["draft_pick_id"])

            TradeAsset.objects.create(
                trade=trade,
                from_team=from_team,
                to_team=to_team,
                player=player,
                draft_pick=draft_pick,
            )

        return trade


class TradeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = ["status", "notes"]

    def validate_status(self, value):
        current_status = self.instance.status
        valid_transitions = {
            Trade.Status.PROPOSED: [
                Trade.Status.ACCEPTED,
                Trade.Status.REJECTED,
                Trade.Status.CANCELLED,
            ],
            Trade.Status.ACCEPTED: [Trade.Status.CANCELLED],
            Trade.Status.REJECTED: [],
            Trade.Status.COMPLETED: [],
            Trade.Status.CANCELLED: [],
        }

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot transition from {current_status} to {value}."
            )
        return value


class TeamSalaryImpactSerializer(serializers.Serializer):
    team_id = serializers.UUIDField()
    team_name = serializers.CharField()
    current_salary = serializers.IntegerField()
    salary_after_trade = serializers.IntegerField()
    cap_space_after = serializers.IntegerField()
    players_incoming = serializers.ListField(child=serializers.DictField())
    players_outgoing = serializers.ListField(child=serializers.DictField())


class TradeAnalysisSerializer(serializers.Serializer):
    valid = serializers.BooleanField()
    validation_errors = serializers.ListField(child=serializers.CharField())
    warnings = serializers.ListField(child=serializers.CharField())
    team_impacts = TeamSalaryImpactSerializer(many=True)
    total_fpts_comparison = serializers.DictField()
