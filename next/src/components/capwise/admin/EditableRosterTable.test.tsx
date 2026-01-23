import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableRosterTable } from './EditableRosterTable';
import { RosterPlayerDetail } from '@/api/league';

const mockPlayers: RosterPlayerDetail[] = [
  {
    id: 'rp1',
    player: {
      id: 'p1',
      player_id: 1,
      name: 'LeBron James',
      positions: ['SF', 'PF'],
      nba_team: 'LAL',
      projected_value: 55.5,
      fpts_avg: 50.2,
      pts_avg: 25.5,
      reb_avg: 7.8,
      ast_avg: 8.1,
      stl_avg: 1.2,
      blk_avg: 0.8,
      to_avg: 3.5,
      fg_pct: 0.52,
      ft_pct: 0.75,
      three_pct: 0.35,
      gp: 65,
      is_injured: false,
    },
    salary: 45000000,
    is_keeper: true,
    keeper_years: 2,
    acquired_by_draft: false,
    trade_blocked: false,
  },
  {
    id: 'rp2',
    player: {
      id: 'p2',
      player_id: 2,
      name: 'Anthony Davis',
      positions: ['PF', 'C'],
      nba_team: 'LAL',
      projected_value: 52.0,
      fpts_avg: 48.5,
      pts_avg: 24.1,
      reb_avg: 12.5,
      ast_avg: 3.2,
      stl_avg: 1.3,
      blk_avg: 2.1,
      to_avg: 2.1,
      fg_pct: 0.55,
      ft_pct: 0.80,
      three_pct: 0.28,
      gp: 55,
      is_injured: true,
    },
    salary: 40000000,
    is_keeper: false,
    keeper_years: 0,
    acquired_by_draft: true,
    trade_blocked: true,
  },
];

describe('EditableRosterTable', () => {
  const mockOnUpdatePlayer = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no players', () => {
    render(
      <EditableRosterTable
        players={[]}
        onUpdatePlayer={mockOnUpdatePlayer}
      />
    );

    expect(screen.getByText('No players on roster')).toBeInTheDocument();
  });

  it('renders all players in the table', () => {
    render(
      <EditableRosterTable
        players={mockPlayers}
        onUpdatePlayer={mockOnUpdatePlayer}
      />
    );

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Anthony Davis')).toBeInTheDocument();
    expect(screen.getByText('SF/PF')).toBeInTheDocument();
    expect(screen.getByText('PF/C')).toBeInTheDocument();
  });

  it('displays keeper status correctly', () => {
    render(
      <EditableRosterTable
        players={mockPlayers}
        onUpdatePlayer={mockOnUpdatePlayer}
      />
    );

    const keeperCells = screen.getAllByText('Yes');
    const notKeeperCells = screen.getAllByText('No');

    expect(keeperCells.length).toBeGreaterThan(0);
    expect(notKeeperCells.length).toBeGreaterThan(0);
  });

  it('enters edit mode when clicking edit button', () => {
    render(
      <EditableRosterTable
        players={mockPlayers}
        onUpdatePlayer={mockOnUpdatePlayer}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('cancels edit mode when clicking cancel', () => {
    render(
      <EditableRosterTable
        players={mockPlayers}
        onUpdatePlayer={mockOnUpdatePlayer}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.getAllByText('Edit').length).toBe(2);
  });

  it('calls onUpdatePlayer when saving', async () => {
    mockOnUpdatePlayer.mockResolvedValueOnce(undefined);

    render(
      <EditableRosterTable
        players={mockPlayers}
        onUpdatePlayer={mockOnUpdatePlayer}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdatePlayer).toHaveBeenCalledWith('rp1', {
        salary: 45000000,
        is_keeper: true,
        trade_blocked: false,
      });
    });
  });

  it('disables other edit buttons while editing', () => {
    render(
      <EditableRosterTable
        players={mockPlayers}
        onUpdatePlayer={mockOnUpdatePlayer}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const remainingEditButton = screen.getByText('Edit');
    expect(remainingEditButton).toBeDisabled();
  });
});
