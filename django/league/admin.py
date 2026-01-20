from django.contrib import admin

from .models import (
    DraftPick,
    League,
    Player,
    Position,
    Rookie,
    RosterPlayer,
    Team,
    Trade,
    TradeAsset,
    TradeTeam,
)


@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "year",
        "salary_cap",
        "roster_size",
        "commissioner",
        "draft_open",
    )
    search_fields = ("name",)
    list_filter = ("year", "draft_open")
    raw_id_fields = ("commissioner",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "league",
        "owner",
        "wins",
        "losses",
        "standing",
        "espn_team_id",
    )
    search_fields = ("name", "abbreviation")
    list_filter = ("league",)
    raw_id_fields = ("league", "owner")


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ("code", "name")
    search_fields = ("code", "name")


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("name", "player_id", "nba_team", "projected_value", "is_injured")
    search_fields = ("name", "player_id")
    list_filter = ("nba_team", "is_injured")
    filter_horizontal = ("positions",)


@admin.register(RosterPlayer)
class RosterPlayerAdmin(admin.ModelAdmin):
    list_display = (
        "player",
        "fantasy_team",
        "salary",
        "is_keeper",
        "keeper_years",
        "trade_blocked",
    )
    search_fields = ("player__name", "fantasy_team__name")
    list_filter = ("is_keeper", "acquired_by_draft", "trade_blocked")
    raw_id_fields = ("fantasy_team", "player")


@admin.register(Rookie)
class RookieAdmin(admin.ModelAdmin):
    list_display = ("name", "nba_team", "rookie_rank", "rookie_year", "player")
    search_fields = ("name",)
    list_filter = ("rookie_year", "nba_team")
    raw_id_fields = ("player",)
    filter_horizontal = ("positions",)


@admin.register(DraftPick)
class DraftPickAdmin(admin.ModelAdmin):
    list_display = (
        "league",
        "year",
        "round",
        "pick_number",
        "original_team",
        "current_team",
        "is_rostered",
    )
    search_fields = ("original_team__name", "current_team__name")
    list_filter = ("league", "year", "round", "is_rostered")
    raw_id_fields = ("league", "original_team", "current_team", "player", "rookie")


class TradeTeamInline(admin.TabularInline):
    model = TradeTeam
    extra = 0
    raw_id_fields = ("team",)


class TradeAssetInline(admin.TabularInline):
    model = TradeAsset
    extra = 0
    raw_id_fields = ("from_team", "to_team", "player", "draft_pick")


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "league",
        "status",
        "proposed_by",
        "created_at",
        "executed_at",
    )
    search_fields = ("notes",)
    list_filter = ("league", "status")
    raw_id_fields = ("league", "proposed_by")
    inlines = [TradeTeamInline, TradeAssetInline]


@admin.register(TradeTeam)
class TradeTeamAdmin(admin.ModelAdmin):
    list_display = ("trade", "team")
    list_filter = ("team",)
    raw_id_fields = ("trade", "team")


@admin.register(TradeAsset)
class TradeAssetAdmin(admin.ModelAdmin):
    list_display = ("trade", "from_team", "to_team", "player", "draft_pick")
    list_filter = ("from_team", "to_team")
    raw_id_fields = ("trade", "from_team", "to_team", "player", "draft_pick")
