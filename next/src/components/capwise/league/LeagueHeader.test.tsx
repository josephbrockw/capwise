import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeagueHeader } from './LeagueHeader';
import { League } from '@/api/league';

const mockLeague: League = {
  id: 'league-1',
  name: 'Dynasty Ballers',
  year: 2025,
  salary_cap: 300,
  min_salary: 1,
  roster_size: 16,
  commissioner_id: 'user-1',
  draft_open: false,
};

describe('LeagueHeader', () => {
  const defaultProps = {
    league: mockLeague,
    isCommissioner: false,
    isCurrentUserCommissioner: false,
    onSync: vi.fn(),
    isSyncing: false,
    syncMessage: null,
  };

  it('renders league name and year', () => {
    render(<LeagueHeader {...defaultProps} />);

    expect(screen.getByText('Dynasty Ballers')).toBeInTheDocument();
    expect(screen.getByText('2025 Season')).toBeInTheDocument();
  });

  it('displays salary cap and roster size', () => {
    render(<LeagueHeader {...defaultProps} />);

    expect(screen.getByText('$300')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  it('shows "You" when user is commissioner', () => {
    render(<LeagueHeader {...defaultProps} isCurrentUserCommissioner={true} />);

    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('shows "League Admin" when user is not commissioner', () => {
    render(<LeagueHeader {...defaultProps} isCurrentUserCommissioner={false} />);

    expect(screen.getByText('League Admin')).toBeInTheDocument();
  });

  it('shows commissioner controls when isCommissioner is true', () => {
    render(<LeagueHeader {...defaultProps} isCommissioner={true} />);

    expect(screen.getByText('Sync League')).toBeInTheDocument();
    expect(screen.getByText('Run Lottery')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides commissioner controls when isCommissioner is false', () => {
    render(<LeagueHeader {...defaultProps} isCommissioner={false} />);

    expect(screen.queryByText('Sync League')).not.toBeInTheDocument();
  });

  it('calls onSync when sync button is clicked', () => {
    const onSync = vi.fn();
    render(<LeagueHeader {...defaultProps} isCommissioner={true} onSync={onSync} />);

    fireEvent.click(screen.getByText('Sync League'));
    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it('shows syncing state', () => {
    render(<LeagueHeader {...defaultProps} isCommissioner={true} isSyncing={true} />);

    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('displays success sync message', () => {
    render(<LeagueHeader {...defaultProps} syncMessage="Sync completed successfully" />);

    expect(screen.getByText('Sync completed successfully')).toBeInTheDocument();
  });

  it('displays error sync message', () => {
    render(<LeagueHeader {...defaultProps} syncMessage="Sync failed. Please try again." />);

    expect(screen.getByText('Sync failed. Please try again.')).toBeInTheDocument();
  });
});
