import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeagueLeaders, LeagueLeader } from './LeagueLeaders';
import { Player } from '@/api/league';

const mockPlayer: Player = {
  id: 'player-1',
  name: 'Luka Doncic',
  positions: ['PG', 'SG'],
  nba_team: 'DAL',
  projected_value: 58,
  is_injured: false,
  injury_status: null,
  on_roster: true,
  stats: {
    games_played: 45,
    minutes_per_game: 36,
    points_per_game: 33.9,
    rebounds_per_game: 9.2,
    assists_per_game: 9.8,
    steals_per_game: 1.4,
    blocks_per_game: 0.5,
    turnovers_per_game: 4.1,
    field_goal_pct: 0.487,
    three_point_pct: 0.382,
    free_throw_pct: 0.786,
    fantasy_points_avg: 58.4,
  },
};

const mockLeaders: LeagueLeader[] = [
  { player: mockPlayer, teamName: "Joe's Ballers", value: 33.9 },
  { player: { ...mockPlayer, id: 'player-2', name: 'SGA' }, teamName: 'Court Kings', value: 31.4 },
];

describe('LeagueLeaders', () => {
  const defaultProps = {
    leaders: mockLeaders,
    selectedCategory: 'pts' as const,
    onCategoryChange: vi.fn(),
  };

  it('renders all leaders', () => {
    render(<LeagueLeaders {...defaultProps} />);

    expect(screen.getByText('Luka Doncic')).toBeInTheDocument();
    expect(screen.getByText('SGA')).toBeInTheDocument();
  });

  it('displays stat values', () => {
    render(<LeagueLeaders {...defaultProps} />);

    expect(screen.getByText('33.9')).toBeInTheDocument();
    expect(screen.getByText('31.4')).toBeInTheDocument();
  });

  it('displays team names', () => {
    render(<LeagueLeaders {...defaultProps} />);

    expect(screen.getByText("Joe's Ballers")).toBeInTheDocument();
    expect(screen.getByText('Court Kings')).toBeInTheDocument();
  });

  it('renders all category buttons', () => {
    render(<LeagueLeaders {...defaultProps} />);

    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('Rebounds')).toBeInTheDocument();
    expect(screen.getByText('Assists')).toBeInTheDocument();
    expect(screen.getByText('Steals')).toBeInTheDocument();
    expect(screen.getByText('Blocks')).toBeInTheDocument();
  });

  it('highlights selected category', () => {
    render(<LeagueLeaders {...defaultProps} selectedCategory="pts" />);

    const pointsButton = screen.getByText('Points');
    expect(pointsButton).toHaveClass('bg-primary-500');
  });

  it('calls onCategoryChange when category clicked', () => {
    const onCategoryChange = vi.fn();
    render(<LeagueLeaders {...defaultProps} onCategoryChange={onCategoryChange} />);

    fireEvent.click(screen.getByText('Rebounds'));
    expect(onCategoryChange).toHaveBeenCalledWith('reb');
  });

  it('shows empty state when no leaders', () => {
    render(<LeagueLeaders {...defaultProps} leaders={[]} />);

    expect(screen.getByText('No player data available')).toBeInTheDocument();
  });

  it('displays ranking numbers', () => {
    render(<LeagueLeaders {...defaultProps} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
