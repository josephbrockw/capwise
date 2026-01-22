import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TradeAnalysisPanel } from './TradeAnalysisPanel';
import { TradablePlayer, TradableDraftPick } from './types';

const currentYear = 2024;
const salaryCap = 100000000;

const mockTeam1Players: TradablePlayer[] = [
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

const mockTeam2Players: TradablePlayer[] = [
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

const mockTeam1Picks: TradableDraftPick[] = [
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

const mockTeam2Picks: TradableDraftPick[] = [];

const mockTeam1AllPlayers: TradablePlayer[] = [...mockTeam1Players];
const mockTeam2AllPlayers: TradablePlayer[] = [...mockTeam2Players];

describe('TradeAnalysisPanel', () => {
  it('renders the analysis panel', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={mockTeam1Picks}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={mockTeam2Picks}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByTestId('trade-analysis-panel')).toBeInTheDocument();
    expect(screen.getByText('Trade Analysis')).toBeInTheDocument();
  });

  it('shows team names in matchup impact cards', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={[]}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getAllByText('Lakers').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Warriors').length).toBeGreaterThan(0);
  });

  it('shows error when no assets selected', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={[]}
        team1PicksOut={[]}
        team2PlayersOut={[]}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByTestId('analysis-errors')).toBeInTheDocument();
    expect(screen.getByText('Select players or picks to trade')).toBeInTheDocument();
  });

  it('shows error when team1 has no assets', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={[]}
        team1PicksOut={[]}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Lakers must include at least one asset')).toBeInTheDocument();
  });

  it('shows error when team2 has no assets', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={[]}
        team2PlayersOut={[]}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Warriors must include at least one asset')).toBeInTheDocument();
  });

  it('shows salary cap error when team exceeds cap', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={[]}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={[]}
        team1CurrentSalary={98000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText(/Lakers would exceed the salary cap/)).toBeInTheDocument();
  });

  it('shows projected matchup impact section', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={[]}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Projected Matchup Impact')).toBeInTheDocument();
    expect(screen.getAllByText(/pts\/matchup/).length).toBeGreaterThan(0);
  });

  it('shows draft pick value comparison when picks are involved', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={mockTeam1Picks}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Draft Pick Value')).toBeInTheDocument();
  });

  it('shows salary impact section', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={[]}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Salary Impact')).toBeInTheDocument();
  });

  it('shows analyzing indicator when isAnalyzing is true', () => {
    render(
      <TradeAnalysisPanel
        team1Name="Lakers"
        team2Name="Warriors"
        team1AllPlayers={mockTeam1AllPlayers}
        team2AllPlayers={mockTeam2AllPlayers}
        team1PlayersOut={mockTeam1Players}
        team1PicksOut={[]}
        team2PlayersOut={mockTeam2Players}
        team2PicksOut={[]}
        team1CurrentSalary={80000000}
        team2CurrentSalary={75000000}
        salaryCap={salaryCap}
        currentYear={currentYear}
        isAnalyzing
      />
    );

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });
});
