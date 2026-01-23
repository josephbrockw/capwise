import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DraftPickEditor } from './DraftPickEditor';
import { DraftPick, Team, Rookie } from '@/api/league';

const mockPicks: DraftPick[] = [
  {
    id: 'dp1',
    year: 2026,
    round: 1,
    pick_number: 5,
    projected_number: 5,
    original_team_id: 't1',
    original_team_name: 'Team Alpha',
    current_team_id: 't1',
    current_team_name: 'Team Alpha',
    assigned_name: null,
    rookie_id: null,
    is_lottery: true,
  },
  {
    id: 'dp2',
    year: 2026,
    round: 1,
    pick_number: 10,
    projected_number: 10,
    original_team_id: 't1',
    original_team_name: 'Team Alpha',
    current_team_id: 't2',
    current_team_name: 'Team Beta',
    assigned_name: 'Cooper Flagg',
    rookie_id: 'r1',
    is_lottery: true,
  },
];

const mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Team Alpha',
    abbreviation: 'ALP',
    owner_id: 'u1',
    owner_name: 'Owner 1',
    wins: 10,
    losses: 5,
    standing: 1,
    current_salary: 100000000,
    cap_space: 50000000,
    logo_url: null,
  },
  {
    id: 't2',
    name: 'Team Beta',
    abbreviation: 'BET',
    owner_id: 'u2',
    owner_name: 'Owner 2',
    wins: 8,
    losses: 7,
    standing: 2,
    current_salary: 120000000,
    cap_space: 30000000,
    logo_url: null,
  },
];

const mockRookies: Rookie[] = [
  {
    id: 'r1',
    name: 'Cooper Flagg',
    nba_team: 'DET',
    positions: ['SF', 'PF'],
    rookie_year: 2026,
    rookie_rank: 1,
    player_id: 'p1',
  },
  {
    id: 'r2',
    name: 'Dylan Harper',
    nba_team: 'WAS',
    positions: ['PG', 'SG'],
    rookie_year: 2026,
    rookie_rank: 2,
    player_id: null,
  },
];

describe('DraftPickEditor', () => {
  const mockOnUpdatePick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no picks', () => {
    render(
      <DraftPickEditor
        picks={[]}
        teams={mockTeams}
        rookies={mockRookies}
        onUpdatePick={mockOnUpdatePick}
      />
    );

    expect(screen.getByText('No draft picks found')).toBeInTheDocument();
  });

  it('renders all draft picks in the table', () => {
    render(
      <DraftPickEditor
        picks={mockPicks}
        teams={mockTeams}
        rookies={mockRookies}
        onUpdatePick={mockOnUpdatePick}
      />
    );

    expect(screen.getAllByText('2026').length).toBe(2);
    expect(screen.getAllByText('Round 1').length).toBe(2);
    expect(screen.getAllByText('Team Alpha').length).toBeGreaterThan(0);
  });

  it('shows traded indicator for traded picks', () => {
    render(
      <DraftPickEditor
        picks={mockPicks}
        teams={mockTeams}
        rookies={mockRookies}
        onUpdatePick={mockOnUpdatePick}
      />
    );

    expect(screen.getByText(/Team Beta/)).toBeInTheDocument();
    expect(screen.getByText(/traded/)).toBeInTheDocument();
  });

  it('shows assigned rookie name', () => {
    render(
      <DraftPickEditor
        picks={mockPicks}
        teams={mockTeams}
        rookies={mockRookies}
        onUpdatePick={mockOnUpdatePick}
      />
    );

    expect(screen.getByText('Cooper Flagg')).toBeInTheDocument();
    expect(screen.getByText('Not assigned')).toBeInTheDocument();
  });

  it('enters edit mode when clicking edit button', () => {
    render(
      <DraftPickEditor
        picks={mockPicks}
        teams={mockTeams}
        rookies={mockRookies}
        onUpdatePick={mockOnUpdatePick}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('cancels edit mode when clicking cancel', () => {
    render(
      <DraftPickEditor
        picks={mockPicks}
        teams={mockTeams}
        rookies={mockRookies}
        onUpdatePick={mockOnUpdatePick}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('calls onUpdatePick when saving', async () => {
    mockOnUpdatePick.mockResolvedValueOnce(undefined);

    render(
      <DraftPickEditor
        picks={mockPicks}
        teams={mockTeams}
        rookies={mockRookies}
        onUpdatePick={mockOnUpdatePick}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdatePick).toHaveBeenCalledWith('dp1', expect.objectContaining({
        pick_number: 5,
        projected_number: 5,
        current_team_id: 't1',
      }));
    });
  });
});
