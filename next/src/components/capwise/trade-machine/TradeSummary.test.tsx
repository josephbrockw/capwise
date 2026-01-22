import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TradeSummary } from './TradeSummary';
import { TradablePlayer, TradableDraftPick } from './types';

const currentYear = 2024;

const mockPlayersOut: TradablePlayer[] = [
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
    isSelected: true,
  },
];

const mockPlayersIn: TradablePlayer[] = [
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
      is_injured: false,
    },
    salary: 51000000,
    is_keeper: false,
    keeper_years: 0,
    acquired_by_draft: true,
    trade_blocked: false,
    isSelected: true,
  },
];

const mockPicksOut: TradableDraftPick[] = [
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
    isSelected: true,
  },
];

const mockPicksIn: TradableDraftPick[] = [
  {
    id: 'pick-2',
    year: 2025,
    round: 2,
    pick_number: null,
    projected_number: null,
    original_team_id: 'team-2',
    original_team_name: 'Celtics',
    current_team_id: 'team-3',
    is_rostered: false,
    isSelected: true,
  },
];

describe('TradeSummary', () => {
  it('renders nothing when no assets are involved', () => {
    const { container } = render(
      <TradeSummary
        teamName="Lakers"
        playersOut={[]}
        playersIn={[]}
        picksOut={[]}
        picksIn={[]}
        currentYear={currentYear}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders team name', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={mockPlayersOut}
        playersIn={mockPlayersIn}
        picksOut={[]}
        picksIn={[]}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Lakers')).toBeInTheDocument();
  });

  it('shows outgoing players', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={mockPlayersOut}
        playersIn={[]}
        picksOut={[]}
        picksIn={[]}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Sends')).toBeInTheDocument();
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('$47,000,000')).toBeInTheDocument();
  });

  it('shows incoming players', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={[]}
        playersIn={mockPlayersIn}
        picksOut={[]}
        picksIn={[]}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Receives')).toBeInTheDocument();
    expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
    expect(screen.getByText('$51,000,000')).toBeInTheDocument();
  });

  it('shows outgoing draft picks', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={[]}
        playersIn={[]}
        picksOut={mockPicksOut}
        picksIn={[]}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Sends')).toBeInTheDocument();
    expect(screen.getByText(/2024 1st/)).toBeInTheDocument();
  });

  it('shows incoming draft picks', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={[]}
        playersIn={[]}
        picksOut={[]}
        picksIn={mockPicksIn}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Receives')).toBeInTheDocument();
    expect(screen.getByText(/2025 2nd/)).toBeInTheDocument();
  });

  it('shows net salary change badge - positive', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={mockPlayersOut}
        playersIn={mockPlayersIn}
        picksOut={[]}
        picksIn={[]}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('+$4,000,000')).toBeInTheDocument();
  });

  it('shows net salary change badge - negative', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={mockPlayersIn}
        playersIn={mockPlayersOut}
        picksOut={[]}
        picksIn={[]}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('-$4,000,000')).toBeInTheDocument();
  });

  it('shows "via" for picks from other teams', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={[]}
        playersIn={[]}
        picksOut={[]}
        picksIn={mockPicksIn}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText(/via Celtics/)).toBeInTheDocument();
  });

  it('shows both sends and receives sections when applicable', () => {
    render(
      <TradeSummary
        teamName="Lakers"
        playersOut={mockPlayersOut}
        playersIn={mockPlayersIn}
        picksOut={mockPicksOut}
        picksIn={mockPicksIn}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Sends')).toBeInTheDocument();
    expect(screen.getByText('Receives')).toBeInTheDocument();
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Stephen Curry')).toBeInTheDocument();
  });
});
