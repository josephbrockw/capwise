from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.utils import timezone
from league.models import League, Position
from league.utils.espn_utils import (
    ESPN_POSITION_MAP,
    STANDARD_POSITIONS,
    ensure_positions_exist,
    extract_player_stats,
    get_espn_player_id,
    get_espn_player_name,
    get_espn_player_team,
    get_player_positions,
    get_position_mapping,
    is_player_injured,
    should_sync,
    update_sync_timestamp,
)


class PositionMappingTest(TestCase):
    def test_standard_positions_list(self):
        expected = ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL"]
        self.assertEqual(STANDARD_POSITIONS, expected)

    def test_espn_position_map_contains_basic_positions(self):
        self.assertEqual(ESPN_POSITION_MAP[0], "PG")
        self.assertEqual(ESPN_POSITION_MAP[1], "SG")
        self.assertEqual(ESPN_POSITION_MAP[2], "SF")
        self.assertEqual(ESPN_POSITION_MAP[3], "PF")
        self.assertEqual(ESPN_POSITION_MAP[4], "C")
        self.assertEqual(ESPN_POSITION_MAP[5], "G")
        self.assertEqual(ESPN_POSITION_MAP[6], "F")
        self.assertEqual(ESPN_POSITION_MAP[7], "UTIL")

    def test_ensure_positions_exist_creates_positions(self):
        Position.objects.all().delete()

        ensure_positions_exist()

        self.assertTrue(Position.objects.filter(code="PG").exists())
        self.assertTrue(Position.objects.filter(code="SG").exists())
        self.assertTrue(Position.objects.filter(code="SF").exists())
        self.assertTrue(Position.objects.filter(code="PF").exists())
        self.assertTrue(Position.objects.filter(code="C").exists())
        self.assertTrue(Position.objects.filter(code="G").exists())
        self.assertTrue(Position.objects.filter(code="F").exists())
        self.assertTrue(Position.objects.filter(code="UTIL").exists())

    def test_ensure_positions_exist_is_idempotent(self):
        ensure_positions_exist()
        initial_count = Position.objects.count()

        ensure_positions_exist()
        self.assertEqual(Position.objects.count(), initial_count)

    def test_get_position_mapping(self):
        ensure_positions_exist()
        mapping = get_position_mapping()

        self.assertIsInstance(mapping[0], Position)
        self.assertEqual(mapping[0].code, "PG")
        self.assertEqual(mapping[4].code, "C")

    def test_get_player_positions(self):
        ensure_positions_exist()
        mapping = get_position_mapping()

        mock_player = MagicMock()
        mock_player.eligibleSlots = [0, 1, 5, 7]

        positions = get_player_positions(mock_player, mapping)

        position_codes = [p.code for p in positions]
        self.assertIn("PG", position_codes)
        self.assertIn("SG", position_codes)
        self.assertNotIn("G", position_codes)
        self.assertNotIn("F", position_codes)
        self.assertNotIn("UTIL", position_codes)

    def test_get_player_positions_no_duplicates(self):
        ensure_positions_exist()
        mapping = get_position_mapping()

        mock_player = MagicMock()
        mock_player.eligibleSlots = [0, 0, 0]

        positions = get_player_positions(mock_player, mapping)
        self.assertEqual(len(positions), 1)


class ESPNAPIHelpersTest(TestCase):
    @patch("espn_api.basketball.League")
    def test_create_espn_league_connection(self, mock_espn_league):
        from league.utils.espn_utils import create_espn_league_connection

        mock_league = MagicMock()
        mock_league.espn_league_id = 12345
        mock_league.year = 2024
        mock_league.espn_s2 = "test_s2"
        mock_league.espn_swid = "test_swid"

        create_espn_league_connection(mock_league)

        mock_espn_league.assert_called_once_with(
            league_id=12345,
            year=2024,
            espn_s2="test_s2",
            swid="test_swid",
        )

    def test_extract_player_stats_with_avg_stats(self):
        mock_player = MagicMock()
        mock_player.stats = {
            "2024": {
                "avg": {
                    "PTS": 25.5,
                    "REB": 7.2,
                    "AST": 4.8,
                    "STL": 1.2,
                    "BLK": 0.5,
                    "TO": 2.3,
                    "FG%": 0.485,
                    "FT%": 0.875,
                    "3P%": 0.365,
                    "GP": 60,
                },
            }
        }
        mock_player.avg_points = 40.0

        stats = extract_player_stats(mock_player)

        self.assertEqual(stats["pts_avg"], 25.5)
        self.assertEqual(stats["reb_avg"], 7.2)
        self.assertEqual(stats["ast_avg"], 4.8)
        self.assertEqual(stats["stl_avg"], 1.2)
        self.assertEqual(stats["blk_avg"], 0.5)
        self.assertEqual(stats["to_avg"], 2.3)
        self.assertEqual(stats["fg_pct"], 0.485)
        self.assertEqual(stats["ft_pct"], 0.875)
        self.assertEqual(stats["three_pct"], 0.365)
        self.assertEqual(stats["gp"], 60)
        self.assertEqual(stats["fpts_avg"], 40.0)

    def test_extract_player_stats_with_avg_points(self):
        mock_player = MagicMock()
        mock_player.stats = {}
        mock_player.avg_points = 35.5

        stats = extract_player_stats(mock_player)

        self.assertEqual(stats["fpts_avg"], 35.5)

    def test_extract_player_stats_empty(self):
        mock_player = MagicMock()
        mock_player.stats = None
        mock_player.avg_points = None

        stats = extract_player_stats(mock_player)

        self.assertEqual(stats["fpts_avg"], 0.0)
        self.assertEqual(stats["pts_avg"], 0.0)
        self.assertEqual(stats["gp"], 0)

    def test_get_espn_player_id_with_player_id(self):
        mock_player = MagicMock()
        mock_player.playerId = 12345

        result = get_espn_player_id(mock_player)
        self.assertEqual(result, 12345)

    def test_get_espn_player_id_with_id(self):
        mock_player = MagicMock(spec=[])
        mock_player.id = 54321

        result = get_espn_player_id(mock_player)
        self.assertEqual(result, 54321)

    def test_get_espn_player_name(self):
        mock_player = MagicMock()
        mock_player.name = "LeBron James"

        result = get_espn_player_name(mock_player)
        self.assertEqual(result, "LeBron James")

    def test_get_espn_player_name_empty(self):
        mock_player = MagicMock(spec=[])

        result = get_espn_player_name(mock_player)
        self.assertEqual(result, "")

    def test_get_espn_player_team(self):
        mock_player = MagicMock()
        mock_player.proTeam = "LAL"

        result = get_espn_player_team(mock_player)
        self.assertEqual(result, "LAL")

    def test_is_player_injured_out(self):
        mock_player = MagicMock()
        mock_player.injuryStatus = "OUT"

        self.assertTrue(is_player_injured(mock_player))

    def test_is_player_injured_ir(self):
        mock_player = MagicMock()
        mock_player.injuryStatus = "INJURY_RESERVE"

        self.assertTrue(is_player_injured(mock_player))

    def test_is_player_injured_questionable(self):
        mock_player = MagicMock()
        mock_player.injuryStatus = "QUESTIONABLE"

        self.assertTrue(is_player_injured(mock_player))

    def test_is_player_not_injured(self):
        mock_player = MagicMock()
        mock_player.injuryStatus = "ACTIVE"

        self.assertFalse(is_player_injured(mock_player))

    def test_is_player_not_injured_empty(self):
        mock_player = MagicMock()
        mock_player.injuryStatus = ""

        self.assertFalse(is_player_injured(mock_player))


class SyncStatusTest(TestCase):
    def setUp(self):
        self.league = League.objects.create(
            name="Test League",
            year=2024,
            salary_cap=1000,
            min_salary=1,
            roster_size=15,
            espn_league_id=99999,
        )

    def test_should_sync_never_synced(self):
        self.league.last_sync_date = None
        self.league.save()

        self.assertTrue(should_sync(self.league))

    def test_should_sync_recently_synced(self):
        self.league.last_sync_date = timezone.now() - timedelta(hours=1)
        self.league.save()

        self.assertFalse(should_sync(self.league, hours=6))

    def test_should_sync_old_sync(self):
        self.league.last_sync_date = timezone.now() - timedelta(hours=12)
        self.league.save()

        self.assertTrue(should_sync(self.league, hours=6))

    def test_should_sync_custom_hours(self):
        self.league.last_sync_date = timezone.now() - timedelta(hours=3)
        self.league.save()

        self.assertFalse(should_sync(self.league, hours=6))
        self.assertTrue(should_sync(self.league, hours=2))

    def test_update_sync_timestamp(self):
        old_time = timezone.now() - timedelta(days=1)
        self.league.last_sync_date = old_time
        self.league.save()

        update_sync_timestamp(self.league)
        self.league.refresh_from_db()

        self.assertIsNotNone(self.league.last_sync_date)
        self.assertGreater(self.league.last_sync_date, old_time)
