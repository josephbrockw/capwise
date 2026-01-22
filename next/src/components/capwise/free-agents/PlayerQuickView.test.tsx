import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerQuickView } from './PlayerQuickView';
import { Player } from '@/api/league';

const mockPlayer: Player = {
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
};

const injuredPlayer: Player = {
  ...mockPlayer,
  id: 'player-2',
  name: 'Stephen Curry',
  is_injured: true,
  injury_status: 'DTD',
};

describe('PlayerQuickView', () => {
  it('renders player name in modal title', () => {
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('renders player positions', () => {
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('SF')).toBeInTheDocument();
    expect(screen.getByText('PF')).toBeInTheDocument();
  });

  it('renders player team', () => {
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('LAL')).toBeInTheDocument();
  });

  it('renders projected value', () => {
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('$85')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('25.7')).toBeInTheDocument();
    expect(screen.getByText('7.3')).toBeInTheDocument();
    expect(screen.getByText('8.3')).toBeInTheDocument();
  });

  it('renders fantasy points average', () => {
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('52.4')).toBeInTheDocument();
  });

  it('shows injury badge for injured player', () => {
    render(
      <PlayerQuickView
        player={injuredPlayer}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('DTD')).toBeInTheDocument();
  });

  it('calls onClose when Close button clicked', () => {
    const onClose = vi.fn();
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders Add to Roster section when onAddToRoster provided', () => {
    render(
      <PlayerQuickView
        player={mockPlayer}
        isOpen={true}
        onClose={vi.fn()}
        onAddToRoster={vi.fn()}
        canAddToRoster={true}
      />
    );

    expect(screen.getByText('Add to Roster', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByLabelText('Salary')).toBeInTheDocument();
  });

  it('shows warning for injured players', () => {
    render(
      <PlayerQuickView
        player={injuredPlayer}
        isOpen={true}
        onClose={vi.fn()}
        onAddToRoster={vi.fn()}
        canAddToRoster={true}
      />
    );

    expect(screen.getByText(/currently injured/)).toBeInTheDocument();
  });

  it('does not render when player is null', () => {
    const { container } = render(
      <PlayerQuickView
        player={null}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
