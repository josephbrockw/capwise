import { render, screen } from '@testing-library/react';
import { DraftBoard } from './DraftBoard';
import { DraftPick } from '@/api/league';

const mockPicks: DraftPick[] = [
  {
    id: 'pick-1',
    year: 2025,
    round: 1,
    pick_number: 1,
    projected_number: 1,
    original_team_id: 'team-1',
    original_team_name: 'Team One',
    current_team_id: 'team-1',
    current_team_name: 'Team One',
    assigned_name: null,
    is_rostered: false,
  },
  {
    id: 'pick-2',
    year: 2025,
    round: 1,
    pick_number: 2,
    projected_number: 2,
    original_team_id: 'team-2',
    original_team_name: 'Team Two',
    current_team_id: 'team-2',
    current_team_name: 'Team Two',
    assigned_name: 'Cooper Flagg',
    is_rostered: false,
  },
  {
    id: 'pick-3',
    year: 2025,
    round: 2,
    pick_number: 5,
    projected_number: 5,
    original_team_id: 'team-1',
    original_team_name: 'Team One',
    current_team_id: 'team-1',
    current_team_name: 'Team One',
    assigned_name: null,
    is_rostered: false,
  },
];

describe('DraftBoard', () => {
  it('renders empty state when no picks', () => {
    render(
      <DraftBoard
        picks={[]}
        currentPickNumber={null}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('No draft picks found for this year.')).toBeInTheDocument();
  });

  it('renders round headers', () => {
    render(
      <DraftBoard
        picks={mockPicks}
        currentPickNumber={1}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
  });

  it('renders all picks', () => {
    render(
      <DraftBoard
        picks={mockPicks}
        currentPickNumber={1}
        isCommissioner={false}
      />
    );

    expect(screen.getAllByText('Team One').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Team Two')).toBeInTheDocument();
    expect(screen.getByText('Cooper Flagg')).toBeInTheDocument();
  });

  it('shows on the clock indicator for current pick', () => {
    render(
      <DraftBoard
        picks={mockPicks}
        currentPickNumber={1}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('NOW')).toBeInTheDocument();
    expect(screen.getByText('Selecting...')).toBeInTheDocument();
  });

  it('does not show on the clock when pick is used', () => {
    render(
      <DraftBoard
        picks={mockPicks}
        currentPickNumber={2}
        isCommissioner={false}
      />
    );

    expect(screen.queryByText('NOW')).not.toBeInTheDocument();
  });

  it('sorts picks by pick number within rounds', () => {
    const unsortedPicks: DraftPick[] = [
      {
        ...mockPicks[0],
        id: 'pick-a',
        pick_number: 3,
      },
      {
        ...mockPicks[0],
        id: 'pick-b',
        pick_number: 1,
      },
      {
        ...mockPicks[0],
        id: 'pick-c',
        pick_number: 2,
      },
    ];

    render(
      <DraftBoard
        picks={unsortedPicks}
        currentPickNumber={null}
        isCommissioner={false}
      />
    );

    const pickLabels = screen.getAllByText(/#\d/);
    expect(pickLabels[0]).toHaveTextContent('#1');
    expect(pickLabels[1]).toHaveTextContent('#2');
    expect(pickLabels[2]).toHaveTextContent('#3');
  });
});
