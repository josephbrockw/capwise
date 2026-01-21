import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RosterValueChart, RosterPlayer } from './RosterValueChart';

const mockPlayers: RosterPlayer[] = [
  { id: '1', name: 'Player One', positions: 'PG', projectedValue: 50, salary: 30000000, status: 'healthy' },
  { id: '2', name: 'Player Two', positions: 'SG', projectedValue: 40, salary: 25000000, status: 'injured' },
  { id: '3', name: 'Player Three', positions: 'SF', projectedValue: 30, salary: 20000000, status: 'questionable' },
];

describe('RosterValueChart', () => {
  describe('Rendering', () => {
    it('renders the chart', () => {
      render(<RosterValueChart players={mockPlayers} />);
      expect(screen.getByTestId('roster-value-chart')).toBeInTheDocument();
    });

    it('renders all players', () => {
      render(<RosterValueChart players={mockPlayers} />);
      expect(screen.getByTestId('player-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-row-2')).toBeInTheDocument();
      expect(screen.getByTestId('player-row-3')).toBeInTheDocument();
    });

    it('displays player names', () => {
      render(<RosterValueChart players={mockPlayers} />);
      expect(screen.getByText('Player One')).toBeInTheDocument();
      expect(screen.getByText('Player Two')).toBeInTheDocument();
      expect(screen.getByText('Player Three')).toBeInTheDocument();
    });

    it('displays player values', () => {
      render(<RosterValueChart players={mockPlayers} />);
      expect(screen.getByTestId('player-value-1')).toHaveTextContent('50.0 FP');
      expect(screen.getByTestId('player-value-2')).toHaveTextContent('40.0 FP');
      expect(screen.getByTestId('player-value-3')).toHaveTextContent('30.0 FP');
    });
  });

  describe('Status Badges', () => {
    it('shows INJ badge for injured players', () => {
      render(<RosterValueChart players={mockPlayers} />);
      expect(screen.getByText('INJ')).toBeInTheDocument();
    });

    it('shows GTD badge for questionable players', () => {
      render(<RosterValueChart players={mockPlayers} />);
      expect(screen.getByText('GTD')).toBeInTheDocument();
    });

    it('does not show badge for healthy players', () => {
      const healthyPlayers: RosterPlayer[] = [
        { id: '1', name: 'Healthy Player', positions: 'PG', projectedValue: 50, salary: 30000000, status: 'healthy' },
      ];
      render(<RosterValueChart players={healthyPlayers} />);
      expect(screen.queryByText('INJ')).not.toBeInTheDocument();
      expect(screen.queryByText('GTD')).not.toBeInTheDocument();
    });
  });

  describe('Progress Bars', () => {
    it('renders progress bars for each player', () => {
      render(<RosterValueChart players={mockPlayers} />);
      expect(screen.getByTestId('player-bar-1')).toBeInTheDocument();
      expect(screen.getByTestId('player-bar-2')).toBeInTheDocument();
      expect(screen.getByTestId('player-bar-3')).toBeInTheDocument();
    });

    it('scales bars relative to max value', () => {
      render(<RosterValueChart players={mockPlayers} />);
      const bar1 = screen.getByTestId('player-bar-1');
      const bar2 = screen.getByTestId('player-bar-2');
      const bar3 = screen.getByTestId('player-bar-3');

      expect(bar1).toHaveStyle({ width: '100%' });
      expect(bar2).toHaveStyle({ width: '80%' });
      expect(bar3).toHaveStyle({ width: '60%' });
    });
  });

  describe('Empty State', () => {
    it('renders empty chart when no players', () => {
      render(<RosterValueChart players={[]} />);
      expect(screen.getByTestId('roster-value-chart')).toBeInTheDocument();
      expect(screen.queryByTestId(/player-row/)).not.toBeInTheDocument();
    });
  });
});
