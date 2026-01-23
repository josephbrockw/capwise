import { render, screen, fireEvent } from '@testing-library/react';
import { MakePickModal } from './MakePickModal';
import { DraftPick, RookieListItem } from '@/api/league';

const mockPick: DraftPick = {
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
};

const mockTradedPick: DraftPick = {
  ...mockPick,
  current_team_id: 'team-2',
  current_team_name: 'Team Two',
};

const mockRookies: RookieListItem[] = [
  {
    id: 'rookie-1',
    name: 'Cooper Flagg',
    nba_team: 'BOS',
    rookie_rank: 1,
    rookie_year: 2025,
    positions: ['SF', 'PF'],
    player_id: null,
  },
  {
    id: 'rookie-2',
    name: 'Dylan Harper',
    nba_team: 'NYK',
    rookie_rank: 2,
    rookie_year: 2025,
    positions: ['PG', 'SG'],
    player_id: null,
  },
];

describe('MakePickModal', () => {
  it('renders nothing when pick is null', () => {
    const { container } = render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={null}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal with pick number in title', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Make Pick #1/)).toBeInTheDocument();
  });

  it('displays current team name', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('Team One')).toBeInTheDocument();
  });

  it('shows original team when pick was traded', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockTradedPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('Team Two')).toBeInTheDocument();
    expect(screen.getByText(/Originally Team One/)).toBeInTheDocument();
  });

  it('renders rookie list', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('Cooper Flagg')).toBeInTheDocument();
    expect(screen.getByText('Dylan Harper')).toBeInTheDocument();
  });

  it('shows selected rookie when clicked', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Cooper Flagg'));

    expect(screen.getByText('Selected:')).toBeInTheDocument();
    expect(screen.getAllByText('Cooper Flagg').length).toBeGreaterThanOrEqual(2);
  });

  it('disables confirm button when no rookie selected', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Confirm Pick' })).toBeDisabled();
  });

  it('enables confirm button when rookie selected', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Cooper Flagg'));

    expect(screen.getByRole('button', { name: 'Confirm Pick' })).not.toBeDisabled();
  });

  it('calls onConfirm with pick and rookie ids', () => {
    const onConfirm = vi.fn();

    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByText('Cooper Flagg'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Pick' }));

    expect(onConfirm).toHaveBeenCalledWith('pick-1', 'rookie-1');
  });

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn();

    render(
      <MakePickModal
        isOpen={true}
        onClose={onClose}
        pick={mockPick}
        rookies={mockRookies}
        onConfirm={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        isLoading={true}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Confirming...' })).toBeDisabled();
  });

  it('disables cancel button when loading', () => {
    render(
      <MakePickModal
        isOpen={true}
        onClose={() => {}}
        pick={mockPick}
        rookies={mockRookies}
        isLoading={true}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
