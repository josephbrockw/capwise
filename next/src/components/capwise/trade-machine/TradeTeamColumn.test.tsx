import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TradeTeamColumn } from './TradeTeamColumn';
import { TradablePlayer, TradableDraftPick } from './types';

const currentYear = 2024;
const salaryCap = 100000000;

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
      name: 'Anthony Davis',
      positions: ['PF', 'C'],
      nba_team: 'LAL',
      projected_value: 140,
      fpts_avg: 42.0,
      pts_avg: 24.0,
      reb_avg: 12.0,
      ast_avg: 3.0,
      stl_avg: 1.2,
      blk_avg: 2.0,
      to_avg: 2.0,
      fg_pct: 0.55,
      ft_pct: 0.80,
      three_pct: 0.28,
      gp: 55,
      is_injured: false,
    },
    salary: 40000000,
    is_keeper: false,
    keeper_years: 0,
    acquired_by_draft: false,
    trade_blocked: false,
    isSelected: true,
  },
];

const mockPicks: TradableDraftPick[] = [
  {
    id: 'pick-1',
    year: 2024,
    round: 1,
    pick_number: null,
    projected_number: 5,
    original_team_id: 'team-1',
    original_team_name: 'Lakers',
    current_team_id: 'team-1',
    is_rostered: false,
    isSelected: false,
  },
  {
    id: 'pick-2',
    year: 2025,
    round: 2,
    pick_number: null,
    projected_number: null,
    original_team_id: 'team-1',
    original_team_name: 'Lakers',
    current_team_id: 'team-1',
    is_rostered: false,
    isSelected: true,
  },
];

describe('TradeTeamColumn', () => {
  const defaultProps = {
    teamName: 'Los Angeles Lakers',
    teamAbbreviation: 'LAL',
    logoUrl: null,
    players: mockPlayers,
    draftPicks: mockPicks,
    currentSalary: 87000000,
    salaryCap: salaryCap,
    salaryAfterTrade: 87000000,
    currentYear: currentYear,
    onPlayerSelectionChange: vi.fn(),
    onPickSelectionChange: vi.fn(),
  };

  it('renders the team column', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    expect(screen.getByTestId('trade-team-column')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('(LAL)')).toBeInTheDocument();
  });

  it('shows "Your Team" badge when isYourTeam is true', () => {
    render(<TradeTeamColumn {...defaultProps} isYourTeam />);

    expect(screen.getByText('Your Team')).toBeInTheDocument();
  });

  it('displays salary information', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    expect(screen.getByText('Salary After Trade')).toBeInTheDocument();
    expect(screen.getByText('$87,000,000')).toBeInTheDocument();
    expect(screen.getByText('Cap: $100,000,000')).toBeInTheDocument();
  });

  it('shows cap space when under cap', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    expect(screen.getByText('Space: $13,000,000')).toBeInTheDocument();
  });

  it('shows over cap warning when exceeding cap', () => {
    render(
      <TradeTeamColumn
        {...defaultProps}
        salaryAfterTrade={110000000}
      />
    );

    expect(screen.getByText('Over cap by $10,000,000')).toBeInTheDocument();
    expect(screen.getByText('Exceeds Salary Cap')).toBeInTheDocument();
  });

  it('shows salary change indicator', () => {
    render(
      <TradeTeamColumn
        {...defaultProps}
        currentSalary={87000000}
        salaryAfterTrade={92000000}
      />
    );

    expect(screen.getByText('+$5,000,000')).toBeInTheDocument();
  });

  it('shows selected player count badge', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    const expandButton = screen.getByTestId('expand-players');
    expect(expandButton).toHaveTextContent('1');
  });

  it('shows selected pick count badge', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    const expandButton = screen.getByTestId('expand-picks');
    expect(expandButton).toHaveTextContent('1');
  });

  it('expands players section by default', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('collapses players section when clicked', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    const expandButton = screen.getByTestId('expand-players');
    fireEvent.click(expandButton);

    const playersSection = expandButton.nextElementSibling;
    expect(playersSection).toHaveClass('max-h-0');
  });

  it('expands picks section when clicked', () => {
    render(<TradeTeamColumn {...defaultProps} />);

    const expandButton = screen.getByTestId('expand-picks');
    fireEvent.click(expandButton);

    expect(screen.getByText('2024 1st Round')).toBeInTheDocument();
  });

  it('calls onPlayerSelectionChange when player is selected', () => {
    const onPlayerSelectionChange = vi.fn();
    render(
      <TradeTeamColumn
        {...defaultProps}
        onPlayerSelectionChange={onPlayerSelectionChange}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /lebron james/i });
    fireEvent.click(checkbox);

    expect(onPlayerSelectionChange).toHaveBeenCalledWith('rp-1', true);
  });

  it('calls onPickSelectionChange when pick is selected', () => {
    const onPickSelectionChange = vi.fn();
    render(
      <TradeTeamColumn
        {...defaultProps}
        onPickSelectionChange={onPickSelectionChange}
      />
    );

    const expandButton = screen.getByTestId('expand-picks');
    fireEvent.click(expandButton);

    const checkbox = screen.getByRole('checkbox', { name: /2024 1st round/i });
    fireEvent.click(checkbox);

    expect(onPickSelectionChange).toHaveBeenCalledWith('pick-1', true);
  });

  it('disables all interactions when disabled', () => {
    render(<TradeTeamColumn {...defaultProps} disabled />);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('renders team logo when provided', () => {
    render(
      <TradeTeamColumn
        {...defaultProps}
        logoUrl="https://example.com/logo.png"
      />
    );

    const logo = screen.getByAltText('Los Angeles Lakers');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });
});
