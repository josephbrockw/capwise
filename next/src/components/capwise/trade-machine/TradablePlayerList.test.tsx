import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TradablePlayerList } from './TradablePlayerList';
import { TradablePlayer } from './types';

const mockPlayers: TradablePlayer[] = [
  {
    id: 'rp-1',
    player: {
      id: 'p-1',
      player_id: 1,
      name: 'LeBron James',
      positions: ['SF', 'PF'],
      nba_team: 'LAL',
      projected_value: 150,
      fpts_avg: 45.5,
      pts_avg: 25.0,
      reb_avg: 7.0,
      ast_avg: 7.5,
      stl_avg: 1.2,
      blk_avg: 0.8,
      to_avg: 3.5,
      fg_pct: 0.52,
      ft_pct: 0.73,
      three_pct: 0.35,
      gp: 60,
      is_injured: false,
    },
    salary: 47000000,
    is_keeper: true,
    keeper_years: 2,
    acquired_by_draft: false,
    trade_blocked: false,
    isSelected: false,
  },
  {
    id: 'rp-2',
    player: {
      id: 'p-2',
      player_id: 2,
      name: 'Stephen Curry',
      positions: ['PG'],
      nba_team: 'GSW',
      projected_value: 160,
      fpts_avg: 48.2,
      pts_avg: 29.0,
      reb_avg: 5.0,
      ast_avg: 6.5,
      stl_avg: 1.5,
      blk_avg: 0.3,
      to_avg: 3.0,
      fg_pct: 0.48,
      ft_pct: 0.91,
      three_pct: 0.43,
      gp: 65,
      is_injured: true,
    },
    salary: 51000000,
    is_keeper: false,
    keeper_years: 0,
    acquired_by_draft: true,
    trade_blocked: false,
    isSelected: true,
  },
  {
    id: 'rp-3',
    player: {
      id: 'p-3',
      player_id: 3,
      name: 'Blocked Player',
      positions: ['C'],
      nba_team: 'BOS',
      projected_value: 80,
      fpts_avg: 25.0,
      pts_avg: 12.0,
      reb_avg: 10.0,
      ast_avg: 2.0,
      stl_avg: 0.5,
      blk_avg: 2.0,
      to_avg: 1.5,
      fg_pct: 0.55,
      ft_pct: 0.65,
      three_pct: 0.30,
      gp: 55,
      is_injured: false,
    },
    salary: 20000000,
    is_keeper: false,
    keeper_years: 0,
    acquired_by_draft: false,
    trade_blocked: true,
    isSelected: false,
  },
];

describe('TradablePlayerList', () => {
  it('renders empty state when no players', () => {
    render(
      <TradablePlayerList
        players={[]}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('empty-player-list')).toBeInTheDocument();
    expect(screen.getByText('No players available')).toBeInTheDocument();
  });

  it('renders player list with correct data', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('tradable-player-list')).toBeInTheDocument();
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
    expect(screen.getByText('SF/PF')).toBeInTheDocument();
    expect(screen.getByText('$47,000,000')).toBeInTheDocument();
  });

  it('shows injury badge for injured players', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    const injBadges = screen.getAllByText('INJ');
    expect(injBadges).toHaveLength(1);
  });

  it('shows blocked badge for trade-blocked players', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('calls onSelectionChange when player is selected', () => {
    const onSelectionChange = vi.fn();
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={onSelectionChange}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /lebron james/i });
    fireEvent.click(checkbox);

    expect(onSelectionChange).toHaveBeenCalledWith('rp-1', true);
  });

  it('shows selected count when players are selected', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('sorts players by salary by default (descending)', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    const playerItems = screen.getAllByTestId(/player-item-/);
    expect(playerItems[0]).toHaveTextContent('Stephen Curry');
    expect(playerItems[1]).toHaveTextContent('LeBron James');
  });

  it('toggles sort direction when clicking same field', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    const salarySort = screen.getByTestId('sort-salary');
    fireEvent.click(salarySort);

    const playerItems = screen.getAllByTestId(/player-item-/);
    expect(playerItems[0]).toHaveTextContent('Blocked Player');
  });

  it('sorts by name when clicking name sort', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    const nameSort = screen.getByTestId('sort-name');
    fireEvent.click(nameSort);

    const playerItems = screen.getAllByTestId(/player-item-/);
    expect(playerItems[0]).toHaveTextContent('Stephen Curry');
  });

  it('sorts by FPTS when clicking fpts sort', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    const fptsSort = screen.getByTestId('sort-fpts');
    fireEvent.click(fptsSort);

    const playerItems = screen.getAllByTestId(/player-item-/);
    expect(playerItems[0]).toHaveTextContent('Stephen Curry');
  });

  it('disables checkboxes when disabled prop is true', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
        disabled
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('disables checkbox for trade-blocked players', () => {
    render(
      <TradablePlayerList
        players={mockPlayers}
        onSelectionChange={vi.fn()}
      />
    );

    const blockedCheckbox = screen.getByRole('checkbox', { name: /blocked player/i });
    expect(blockedCheckbox).toBeDisabled();
  });
});
