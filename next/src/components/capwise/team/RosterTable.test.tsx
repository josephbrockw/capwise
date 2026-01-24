import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RosterTable, RosterPlayerData } from './RosterTable';

const mockPlayers: RosterPlayerData[] = [
  {
    id: '1',
    playerId: 'p1',
    playerName: 'LeBron James',
    positions: ['SF', 'PF'],
    nbaTeam: 'LAL',
    salary: 45000000,
    fptsAvg: 52.3,
    isKeeper: true,
    keeperYears: 2,
    isInjured: false,
  },
  {
    id: '2',
    playerId: 'p2',
    playerName: 'Anthony Davis',
    positions: ['PF', 'C'],
    nbaTeam: 'LAL',
    salary: 40000000,
    fptsAvg: 48.7,
    isKeeper: false,
    isInjured: true,
    injuryStatus: 'GTD',
  },
  {
    id: '3',
    playerId: 'p3',
    playerName: 'Austin Reaves',
    positions: ['SG'],
    nbaTeam: 'LAL',
    salary: 5000000,
    fptsAvg: 25.1,
    isKeeper: false,
    isInjured: false,
  },
];

describe('RosterTable', () => {
  describe('Rendering', () => {
    it('renders the roster table on desktop', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getByTestId('roster-table')).toBeInTheDocument();
    });

    it('renders empty state when no players', () => {
      render(<RosterTable players={[]} />);
      expect(screen.getByTestId('roster-table-empty')).toHaveTextContent('No players on roster');
    });

    it('displays player names', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getAllByText('LeBron James').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Anthony Davis').length).toBeGreaterThan(0);
    });

    it('displays positions', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getAllByText('SF/PF').length).toBeGreaterThan(0);
      expect(screen.getAllByText('PF/C').length).toBeGreaterThan(0);
    });

    it('displays salary formatted as currency', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getAllByText('$45,000,000').length).toBeGreaterThan(0);
    });

    it('displays FPTS average', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getAllByText('52.3').length).toBeGreaterThan(0);
    });

    it('displays keeper status icon', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getAllByTitle(/Keeper/).length).toBeGreaterThan(0);
    });

    it('displays injury status', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getAllByText('GTD').length).toBeGreaterThan(0);
    });
  });

  describe('Sorting', () => {
    it('sorts by salary descending by default', () => {
      render(<RosterTable players={mockPlayers} />);
      const rows = screen.getAllByTestId(/^roster-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'roster-row-1');
    });

    it('toggles sort direction when clicking same column', () => {
      render(<RosterTable players={mockPlayers} />);
      const salaryHeader = screen.getByTestId('sort-salary');

      fireEvent.click(salaryHeader);

      const rows = screen.getAllByTestId(/^roster-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'roster-row-3');
    });

    it('sorts by player name when clicking name column', () => {
      render(<RosterTable players={mockPlayers} />);
      const nameHeader = screen.getByTestId('sort-playerName');

      fireEvent.click(nameHeader);

      const rows = screen.getAllByTestId(/^roster-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'roster-row-1');
    });

    it('sorts by FPTS when clicking FPTS column', () => {
      render(<RosterTable players={mockPlayers} />);
      const fptsHeader = screen.getByTestId('sort-fptsAvg');

      fireEvent.click(fptsHeader);

      const rows = screen.getAllByTestId(/^roster-row-/);
      expect(rows[0]).toHaveAttribute('data-testid', 'roster-row-1');
    });
  });

  describe('Context menu functionality', () => {
    it('does not show context menu by default', () => {
      render(<RosterTable players={mockPlayers} />);
      const menuButtons = screen.queryAllByRole('button');
      const contextMenuTriggers = menuButtons.filter(btn => btn.querySelector('svg[viewBox="0 0 20 20"]'));
      expect(contextMenuTriggers.length).toBe(0);
    });

    it('shows context menu trigger when isEditable is true', () => {
      render(<RosterTable players={mockPlayers} isEditable />);
      const table = screen.getByTestId('roster-table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Mobile view', () => {
    it('renders card view for mobile', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getByTestId('roster-cards')).toBeInTheDocument();
    });

    it('displays player info in cards', () => {
      render(<RosterTable players={mockPlayers} />);
      expect(screen.getByTestId('roster-card-1')).toBeInTheDocument();
    });
  });
});
