import uuid
from typing import List, Tuple

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies: List[Tuple[str, str]] = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Position",
            fields=[
                (
                    "code",
                    models.CharField(max_length=5, primary_key=True, serialize=False),
                ),
                ("name", models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name="League",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                (
                    "year",
                    models.IntegerField(
                        help_text="The season end year, e.g., 2025 for 2024-25 season"
                    ),
                ),
                ("salary_cap", models.IntegerField(default=1000)),
                ("min_salary", models.IntegerField(default=1)),
                ("roster_size", models.IntegerField(default=16)),
                ("draft_open", models.BooleanField(default=False)),
                ("espn_league_id", models.IntegerField()),
                (
                    "espn_s2",
                    models.TextField(
                        blank=True,
                        help_text="ESPN S2 cookie for private leagues",
                        null=True,
                    ),
                ),
                (
                    "espn_swid",
                    models.CharField(
                        blank=True,
                        help_text="ESPN SWID cookie",
                        max_length=100,
                        null=True,
                    ),
                ),
                ("espn_owner_mapping", models.JSONField(blank=True, default=dict)),
                ("last_sync_date", models.DateTimeField(blank=True, null=True)),
                (
                    "salary_escalation_settings",
                    models.JSONField(
                        blank=True,
                        default=dict,
                        help_text=(
                            "Salary escalation settings: rookie_year_salary, "
                            "year_2_4_multiplier, year_5_plus_multiplier"
                        ),
                    ),
                ),
                (
                    "commissioner",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="commissioned_leagues",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("name", "year"), ("espn_league_id", "year")},
            },
        ),
        migrations.CreateModel(
            name="Player",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "player_id",
                    models.IntegerField(
                        blank=True, help_text="ESPN player ID", null=True, unique=True
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("nba_team", models.CharField(blank=True, max_length=50)),
                ("projected_value", models.FloatField(default=0)),
                ("rookie_year", models.IntegerField(blank=True, null=True)),
                ("fpts_avg", models.FloatField(blank=True, default=0, null=True)),
                ("pts_avg", models.FloatField(blank=True, default=0, null=True)),
                ("reb_avg", models.FloatField(blank=True, default=0, null=True)),
                ("ast_avg", models.FloatField(blank=True, default=0, null=True)),
                ("stl_avg", models.FloatField(blank=True, default=0, null=True)),
                ("blk_avg", models.FloatField(blank=True, default=0, null=True)),
                ("to_avg", models.FloatField(blank=True, default=0, null=True)),
                ("fg_pct", models.FloatField(blank=True, default=0, null=True)),
                ("ft_pct", models.FloatField(blank=True, default=0, null=True)),
                ("three_pct", models.FloatField(blank=True, default=0, null=True)),
                (
                    "gp",
                    models.FloatField(
                        blank=True, default=0, help_text="Games played", null=True
                    ),
                ),
                (
                    "is_injured",
                    models.BooleanField(blank=True, default=False, null=True),
                ),
                (
                    "positions",
                    models.ManyToManyField(
                        blank=True, related_name="players", to="league.position"
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Team",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(blank=True, max_length=100, null=True)),
                (
                    "abbreviation",
                    models.CharField(blank=True, max_length=10, null=True),
                ),
                ("logo_url", models.URLField(blank=True, null=True)),
                ("wins", models.IntegerField(default=0)),
                ("losses", models.IntegerField(default=0)),
                ("standing", models.IntegerField(default=0)),
                ("espn_team_id", models.IntegerField()),
                (
                    "league",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="teams",
                        to="league.league",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="fantasy_teams",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "unique_together": {("league", "espn_team_id")},
            },
        ),
        migrations.CreateModel(
            name="Rookie",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("nba_team", models.CharField(max_length=100)),
                ("rookie_rank", models.IntegerField(blank=True, null=True)),
                ("rookie_year", models.IntegerField(blank=True, null=True)),
                (
                    "player",
                    models.ForeignKey(
                        blank=True,
                        help_text="Linked after drafted",
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="rookie_record",
                        to="league.player",
                    ),
                ),
                (
                    "positions",
                    models.ManyToManyField(
                        blank=True, related_name="rookies", to="league.position"
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RosterPlayer",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("salary", models.IntegerField()),
                ("is_keeper", models.BooleanField(default=False)),
                ("keeper_years", models.IntegerField(default=0)),
                ("acquired_by_draft", models.BooleanField(default=False)),
                ("trade_blocked", models.BooleanField(default=False)),
                (
                    "fantasy_team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="roster_players",
                        to="league.team",
                    ),
                ),
                (
                    "player",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="roster_entries",
                        to="league.player",
                    ),
                ),
            ],
            options={
                "unique_together": {("fantasy_team", "player")},
            },
        ),
        migrations.CreateModel(
            name="DraftPick",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("year", models.IntegerField()),
                ("round", models.IntegerField()),
                (
                    "pick_number",
                    models.IntegerField(
                        blank=True, help_text="Set after lottery", null=True
                    ),
                ),
                ("projected_number", models.IntegerField(blank=True, null=True)),
                ("is_rostered", models.BooleanField(default=False)),
                (
                    "league",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="draft_picks",
                        to="league.league",
                    ),
                ),
                (
                    "original_team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="original_picks",
                        to="league.team",
                    ),
                ),
                (
                    "current_team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="current_picks",
                        to="league.team",
                    ),
                ),
                (
                    "player",
                    models.ForeignKey(
                        blank=True,
                        help_text="Set when pick is used",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="draft_picks",
                        to="league.player",
                    ),
                ),
                (
                    "rookie",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="draft_picks",
                        to="league.rookie",
                    ),
                ),
            ],
            options={
                "unique_together": {("league", "year", "original_team", "round")},
            },
        ),
    ]
