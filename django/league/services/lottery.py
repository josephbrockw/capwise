import random
from dataclasses import dataclass
from typing import Optional

from django.db import transaction
from league.models import DraftPick, League, LotteryResult, Team

DEFAULT_LOTTERY_ODDS = {
    1: 25.0,  # Worst record
    2: 20.0,
    3: 15.0,
    4: 12.0,
    5: 10.0,
    6: 8.0,
    7: 5.0,
    8: 3.0,
    9: 1.5,
    10: 0.5,
}

DEFAULT_PLAYOFF_TEAMS = 6


@dataclass
class LotteryTeamOdds:
    team: Team
    position: int
    odds: float
    wins: int
    losses: int


def get_lottery_teams(league: League, playoff_teams: int = DEFAULT_PLAYOFF_TEAMS):
    """
    Returns non-playoff teams ordered by record (worst first).

    Args:
        league: The League to get lottery teams for
        playoff_teams: Number of teams that make playoffs (excluded from lottery)

    Returns:
        List of teams eligible for lottery, ordered worst record first
    """
    all_teams = list(league.teams.all().order_by("standing"))

    if len(all_teams) <= playoff_teams:
        return []

    lottery_teams = all_teams[playoff_teams:]

    lottery_teams.sort(key=lambda t: (t.wins, -t.losses))

    return lottery_teams


def get_lottery_odds(league: League, playoff_teams: int = DEFAULT_PLAYOFF_TEAMS):
    """
    Returns lottery odds for each eligible team.

    Args:
        league: The League to get odds for
        playoff_teams: Number of playoff teams

    Returns:
        List of LotteryTeamOdds objects
    """
    lottery_teams = get_lottery_teams(league, playoff_teams)

    odds_list = []
    for position, team in enumerate(lottery_teams, start=1):
        odds = DEFAULT_LOTTERY_ODDS.get(position, 0.0)
        odds_list.append(
            LotteryTeamOdds(
                team=team,
                position=position,
                odds=odds,
                wins=team.wins,
                losses=team.losses,
            )
        )

    return odds_list


def _weighted_random_selection(teams_with_odds: list[tuple[Team, float]]) -> Team:
    """
    Perform weighted random selection from teams.

    Args:
        teams_with_odds: List of (team, odds) tuples

    Returns:
        Selected team
    """
    if not teams_with_odds:
        raise ValueError("No teams to select from")

    total_odds = sum(odds for _, odds in teams_with_odds)
    if total_odds == 0:
        return random.choice([t for t, _ in teams_with_odds])

    normalized = [(team, odds / total_odds) for team, odds in teams_with_odds]

    rand = random.random()
    cumulative = 0.0

    for team, probability in normalized:
        cumulative += probability
        if rand <= cumulative:
            return team

    return normalized[-1][0]


def run_lottery(
    league: League,
    user,
    playoff_teams: int = DEFAULT_PLAYOFF_TEAMS,
) -> LotteryResult:
    """
    Executes the draft lottery.

    Args:
        league: The League to run lottery for
        user: The user executing the lottery
        playoff_teams: Number of playoff teams

    Returns:
        LotteryResult with first and second pick winners

    Raises:
        ValueError: If lottery already run or no eligible teams
    """
    current_year = league.year

    existing = LotteryResult.objects.filter(league=league, year=current_year).first()
    if existing:
        raise ValueError(f"Lottery already run for {current_year}")

    if league.draft_open:
        raise ValueError("Cannot run lottery after draft has started")

    lottery_teams = get_lottery_teams(league, playoff_teams)

    if len(lottery_teams) < 2:
        raise ValueError("Not enough teams for lottery (minimum 2 required)")

    teams_with_odds = [
        (team, DEFAULT_LOTTERY_ODDS.get(pos + 1, 0.0))
        for pos, team in enumerate(lottery_teams)
    ]

    first_pick_team = _weighted_random_selection(teams_with_odds)

    remaining_teams = [(t, o) for t, o in teams_with_odds if t != first_pick_team]
    second_pick_team = _weighted_random_selection(remaining_teams)

    final_order = [first_pick_team, second_pick_team]
    for team in lottery_teams:
        if team not in final_order:
            final_order.append(team)

    results_data = {
        "lottery_teams": [
            {
                "team_id": str(team.id),
                "team_name": team.name,
                "original_position": lottery_teams.index(team) + 1,
                "original_odds": DEFAULT_LOTTERY_ODDS.get(
                    lottery_teams.index(team) + 1, 0.0
                ),
            }
            for team in lottery_teams
        ],
        "final_order": [
            {
                "pick_number": idx + 1,
                "team_id": str(team.id),
                "team_name": team.name,
                "moved": (
                    idx + 1 != lottery_teams.index(team) + 1
                    if team in lottery_teams
                    else False
                ),
            }
            for idx, team in enumerate(final_order)
        ],
    }

    with transaction.atomic():
        lottery_result = LotteryResult.objects.create(
            league=league,
            year=current_year,
            executed_by=user,
            results=results_data,
            first_pick_team=first_pick_team,
            second_pick_team=second_pick_team,
        )

        first_round_picks = DraftPick.objects.filter(
            league=league,
            year=current_year,
            round=1,
        )

        for pick in first_round_picks:
            current_team = pick.current_team
            if current_team in final_order:
                pick_number = final_order.index(current_team) + 1
                pick.pick_number = pick_number
                pick.save(update_fields=["pick_number"])

    return lottery_result


def get_lottery_result(
    league: League,
    year: Optional[int] = None,
) -> Optional[LotteryResult]:
    """
    Get lottery result for a league and year.

    Args:
        league: The League to get result for
        year: The year (defaults to current league year)

    Returns:
        LotteryResult or None if not found
    """
    if year is None:
        year = league.year

    return LotteryResult.objects.filter(league=league, year=year).first()
