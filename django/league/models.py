import uuid
from datetime import datetime

from django.conf import settings
from django.db import models
from django.db.models import Sum


class League(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    year = models.IntegerField(
        help_text="The season end year, e.g., 2025 for 2024-25 season"
    )
    salary_cap = models.IntegerField(default=1000)
    min_salary = models.IntegerField(default=1)
    roster_size = models.IntegerField(default=16)
    commissioner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="commissioned_leagues",
    )
    draft_open = models.BooleanField(default=False)

    espn_league_id = models.IntegerField()
    espn_s2 = models.TextField(
        null=True, blank=True, help_text="ESPN S2 cookie for private leagues"
    )
    espn_swid = models.CharField(
        max_length=100, null=True, blank=True, help_text="ESPN SWID cookie"
    )
    espn_owner_mapping = models.JSONField(default=dict, blank=True)
    last_sync_date = models.DateTimeField(null=True, blank=True)

    salary_escalation_settings = models.JSONField(
        default=dict,
        blank=True,
        help_text=(
            "Salary escalation settings: rookie_year_salary, "
            "year_2_4_multiplier, year_5_plus_multiplier"
        ),
    )

    class Meta:
        unique_together = [
            ("name", "year"),
            ("espn_league_id", "year"),
        ]

    def __str__(self):
        return f"{self.name} ({self.year})"

    def save(self, *args, **kwargs):
        if not self.salary_escalation_settings:
            self.salary_escalation_settings = {
                "rookie_year_salary": 1,
                "year_2_4_multiplier": 0.80,
                "year_5_plus_multiplier": 0.90,
            }
        super().save(*args, **kwargs)

    @property
    def current_season(self):
        current_year = datetime.now().year
        current_month = datetime.now().month
        if current_month >= 10:
            return current_year + 1
        return current_year

    @classmethod
    def get_current_season(cls):
        current_year = datetime.now().year
        current_month = datetime.now().month
        if current_month >= 10:
            return current_year + 1
        return current_year


class Team(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name="teams")
    name = models.CharField(max_length=100, null=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="fantasy_teams",
    )
    abbreviation = models.CharField(max_length=10, null=True, blank=True)
    logo_url = models.URLField(null=True, blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    standing = models.IntegerField(default=0)
    espn_team_id = models.IntegerField()

    class Meta:
        unique_together = [("league", "espn_team_id")]

    def __str__(self):
        return f"{self.name or self.abbreviation} ({self.league.name})"

    @property
    def current_salary(self):
        total = self.roster_players.aggregate(total=Sum("salary"))["total"]
        return total or 0

    @property
    def cap_space(self):
        return self.league.salary_cap - self.current_salary


class Position(models.Model):
    code = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.code


class Player(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player_id = models.IntegerField(
        unique=True, null=True, blank=True, help_text="ESPN player ID"
    )
    name = models.CharField(max_length=100)
    positions = models.ManyToManyField(Position, related_name="players", blank=True)
    nba_team = models.CharField(max_length=50, blank=True)
    projected_value = models.FloatField(default=0)
    rookie_year = models.IntegerField(null=True, blank=True)

    fpts_avg = models.FloatField(default=0, null=True, blank=True)
    pts_avg = models.FloatField(default=0, null=True, blank=True)
    reb_avg = models.FloatField(default=0, null=True, blank=True)
    ast_avg = models.FloatField(default=0, null=True, blank=True)
    stl_avg = models.FloatField(default=0, null=True, blank=True)
    blk_avg = models.FloatField(default=0, null=True, blank=True)
    to_avg = models.FloatField(default=0, null=True, blank=True)
    fg_pct = models.FloatField(default=0, null=True, blank=True)
    ft_pct = models.FloatField(default=0, null=True, blank=True)
    three_pct = models.FloatField(default=0, null=True, blank=True)
    gp = models.FloatField(default=0, null=True, blank=True, help_text="Games played")

    is_injured = models.BooleanField(default=False, null=True, blank=True)

    def __str__(self):
        return self.name

    @property
    def position_list(self):
        return ", ".join(self.positions.values_list("code", flat=True))

    @property
    def on_roster(self):
        return self.roster_entries.exists()

    def calculated_salary(self, years_on_roster, league=None):
        if league:
            settings_data = league.salary_escalation_settings
        else:
            settings_data = {
                "rookie_year_salary": 1,
                "year_2_4_multiplier": 0.80,
                "year_5_plus_multiplier": 0.90,
            }

        rookie_salary = settings_data.get("rookie_year_salary", 1)
        year_2_4_mult = settings_data.get("year_2_4_multiplier", 0.80)
        year_5_plus_mult = settings_data.get("year_5_plus_multiplier", 0.90)

        if years_on_roster <= 1:
            return rookie_salary
        elif years_on_roster <= 4:
            return int(self.projected_value * year_2_4_mult)
        else:
            return int(self.projected_value * year_5_plus_mult)


class RosterPlayer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fantasy_team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="roster_players"
    )
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="roster_entries"
    )
    salary = models.IntegerField()
    is_keeper = models.BooleanField(default=False)
    keeper_years = models.IntegerField(default=0)
    acquired_by_draft = models.BooleanField(default=False)
    trade_blocked = models.BooleanField(default=False)

    class Meta:
        unique_together = [("fantasy_team", "player")]

    def __str__(self):
        return f"{self.player.name} - {self.fantasy_team.name}"


class Rookie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    nba_team = models.CharField(max_length=100)
    player = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rookie_record",
        help_text="Linked after drafted",
    )
    rookie_rank = models.IntegerField(null=True, blank=True)
    rookie_year = models.IntegerField(null=True, blank=True)
    positions = models.ManyToManyField(Position, related_name="rookies", blank=True)

    def __str__(self):
        return self.name


class DraftPick(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    league = models.ForeignKey(
        League, on_delete=models.CASCADE, related_name="draft_picks"
    )
    original_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="original_picks",
    )
    current_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="current_picks",
    )
    year = models.IntegerField()
    round = models.IntegerField()
    pick_number = models.IntegerField(
        null=True, blank=True, help_text="Set after lottery"
    )
    projected_number = models.IntegerField(null=True, blank=True)
    player = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="draft_picks",
        help_text="Set when pick is used",
    )
    rookie = models.ForeignKey(
        Rookie,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="draft_picks",
    )
    is_rostered = models.BooleanField(default=False)

    class Meta:
        unique_together = [("league", "year", "original_team", "round")]

    def __str__(self):
        return f"{self.year} Round {self.round} - {self.original_team.name}"
