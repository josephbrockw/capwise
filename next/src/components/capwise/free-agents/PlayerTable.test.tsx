import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerTable } from './PlayerTable';
import { Player } from '@/api/league';

const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: 'LeBron James',
    positions: ['SF', 'PF'],
    nba_team: 'LAL',
    projected_value: 85,
    is_injured: false,
    injury_status: null,
    on_roster: false,
    stats: {
      games_played: 55,
      minutes_per_game: 35.5,
      points_per_game: 25.7,
      rebounds_per_game: 7.3,
      assists_per_game: 8.3,
      steals_per_game: 1.3,
      blocks_per_game: 0.5,
      turnovers_per_game: 3.5,
      field_goal_pct: 54.0,
      three_point_pct: 41.0,
      free_throw_pct: 73.0,
      fantasy_points_avg: 52.4,
    },
  },
  {
    id: 'player-2',
    name: 'Stephen Curry',
    positions: ['PG'],
    nba_team: 'GSW',
    projected_value: 75,
    is_injured: true,
    injury_status: 'DTD',
    on_roster: false,
    stats: {
      games_played: 50,
      minutes_per_game: 34.2,
      points_per_game: 29.4,
      rebounds_per_game: 6.1,
      assists_per_game: 4.5,
      steals_per_game: 0.9,
      blocks_per_game: 0.4,
      turnovers_per_game: 3.2,
      field_goal_pct: 47.3,
      three_point_pct: 42.7,
      free_throw_pct: 91.5,
      fantasy_points_avg: 47.8,
    },
  },
];

const defaultProps = {
  players: mockPlayers,
  currentPage: 1,
  totalPages: 1,
  totalCount: 2,
  onPageChange: vi.fn(),
};

describe('PlayerTable', () => {
  it('renders player names', () => {
    render(<PlayerTable {...defaultProps} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
  });

  it('renders player positions', () => {
    render(<PlayerTable {...defaultProps} />);

    expect(screen.getByText('SF, PF')).toBeInTheDocument();
    expect(screen.getByText('PG')).toBeInTheDocument();
  });

  it('renders player teams', () => {
    render(<PlayerTable {...defaultProps} />);

    expect(screen.getByText('LAL')).toBeInTheDocument();
    expect(screen.getByText('GSW')).toBeInTheDocument();
  });

  it('renders projected values', () => {
    render(<PlayerTable {...defaultProps} />);

    expect(screen.getByText('$85')).toBeInTheDocument();
    expect(screen.getByText('$75')).toBeInTheDocument();
  });

  it('shows injury badge for injured players', () => {
    render(<PlayerTable {...defaultProps} />);

    expect(screen.getByText('DTD')).toBeInTheDocument();
  });

  it('shows empty state when no players', () => {
    render(<PlayerTable {...defaultProps} players={[]} totalCount={0} />);

    expect(screen.getByText('No players found')).toBeInTheDocument();
  });

  it('renders pagination when multiple pages', () => {
    render(<PlayerTable {...defaultProps} totalPages={3} totalCount={150} />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('calls onPageChange when Next clicked', () => {
    const onPageChange = vi.fn();
    render(<PlayerTable {...defaultProps} totalPages={3} totalCount={150} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables Previous button on first page', () => {
    render(<PlayerTable {...defaultProps} totalPages={3} totalCount={150} currentPage={1} />);

    expect(screen.getByText('Previous')).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<PlayerTable {...defaultProps} totalPages={3} totalCount={150} currentPage={3} />);

    expect(screen.getByText('Next')).toBeDisabled();
  });
});
