import { render, screen, fireEvent } from '@testing-library/react';
import { DraftPickCell } from './DraftPickCell';
import { DraftPick } from '@/api/league';

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

const mockUsedPick: DraftPick = {
  ...mockPick,
  id: 'pick-2',
  pick_number: 2,
  assigned_name: 'Cooper Flagg',
};

const mockTradedPick: DraftPick = {
  ...mockPick,
  id: 'pick-3',
  pick_number: 3,
  current_team_id: 'team-2',
  current_team_name: 'Team Two',
};

describe('DraftPickCell', () => {
  it('renders pick number and team name', () => {
    render(
      <DraftPickCell
        pick={mockPick}
        isOnTheClock={false}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Team One')).toBeInTheDocument();
  });

  it('shows "Available" for unused picks not on the clock', () => {
    render(
      <DraftPickCell
        pick={mockPick}
        isOnTheClock={false}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('Waiting')).toBeInTheDocument();
  });

  it('shows "NOW" indicator when pick is current', () => {
    render(
      <DraftPickCell
        pick={mockPick}
        isOnTheClock={true}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('Selecting...')).toBeInTheDocument();
    expect(screen.getByText('NOW')).toBeInTheDocument();
  });

  it('shows assigned player name for used picks', () => {
    render(
      <DraftPickCell
        pick={mockUsedPick}
        isOnTheClock={false}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('Cooper Flagg')).toBeInTheDocument();
    expect(screen.queryByText('Waiting')).not.toBeInTheDocument();
  });

  it('shows "via" text when pick was traded', () => {
    render(
      <DraftPickCell
        pick={mockTradedPick}
        isOnTheClock={false}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('Team Two')).toBeInTheDocument();
    expect(screen.getByText('via Team One')).toBeInTheDocument();
  });

  it('calls onMakePick when commissioner clicks on the clock pick', () => {
    const onMakePick = vi.fn();

    render(
      <DraftPickCell
        pick={mockPick}
        isOnTheClock={true}
        isCommissioner={true}
        onMakePick={onMakePick}
      />
    );

    const cell = screen.getByRole('button');
    fireEvent.click(cell);

    expect(onMakePick).toHaveBeenCalledWith(mockPick);
  });

  it('does not call onMakePick when non-commissioner clicks', () => {
    const onMakePick = vi.fn();

    render(
      <DraftPickCell
        pick={mockPick}
        isOnTheClock={true}
        isCommissioner={false}
        onMakePick={onMakePick}
      />
    );

    const cell = screen.getByText('Team One').closest('div');
    fireEvent.click(cell!);

    expect(onMakePick).not.toHaveBeenCalled();
  });

  it('does not call onMakePick when pick is already used', () => {
    const onMakePick = vi.fn();

    render(
      <DraftPickCell
        pick={mockUsedPick}
        isOnTheClock={true}
        isCommissioner={true}
        onMakePick={onMakePick}
      />
    );

    const cell = screen.getByText('Team One').closest('div');
    fireEvent.click(cell!);

    expect(onMakePick).not.toHaveBeenCalled();
  });

  it('supports keyboard activation for accessible picks', () => {
    const onMakePick = vi.fn();

    render(
      <DraftPickCell
        pick={mockPick}
        isOnTheClock={true}
        isCommissioner={true}
        onMakePick={onMakePick}
      />
    );

    const cell = screen.getByRole('button');
    fireEvent.keyDown(cell, { key: 'Enter' });

    expect(onMakePick).toHaveBeenCalledWith(mockPick);
  });
});
