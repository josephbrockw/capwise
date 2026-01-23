import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncControls } from './SyncControls';
import { SyncStatus } from '@/api/league';

const mockSyncStatus: SyncStatus = {
  last_sync_date: '2026-01-20T10:00:00Z',
  needs_sync: false,
  espn_league_id: '12345',
};

describe('SyncControls', () => {
  const mockOnSync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sync status', () => {
    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={false}
        onSync={mockOnSync}
      />
    );

    expect(screen.getByText('Sync Status')).toBeInTheDocument();
    expect(screen.getByText(/Last synced:/)).toBeInTheDocument();
    expect(screen.getByText('ESPN League ID: 12345')).toBeInTheDocument();
  });

  it('shows "Up to Date" badge when sync not needed', () => {
    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={false}
        onSync={mockOnSync}
      />
    );

    expect(screen.getByText('Up to Date')).toBeInTheDocument();
  });

  it('shows "Sync Needed" badge when sync is needed', () => {
    render(
      <SyncControls
        syncStatus={{ ...mockSyncStatus, needs_sync: true }}
        isSuperAdmin={false}
        onSync={mockOnSync}
      />
    );

    expect(screen.getByText('Sync Needed')).toBeInTheDocument();
  });

  it('shows only Sync Rosters for non-super admins', () => {
    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={false}
        onSync={mockOnSync}
      />
    );

    expect(screen.getByRole('button', { name: 'Sync Rosters' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sync Players' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Full Sync' })).not.toBeInTheDocument();
  });

  it('shows all sync options for super admins', () => {
    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={true}
        onSync={mockOnSync}
      />
    );

    expect(screen.getByRole('button', { name: 'Sync Players' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sync Rosters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Full Sync' })).toBeInTheDocument();
  });

  it('calls onSync with correct type when clicking Sync Rosters', async () => {
    mockOnSync.mockResolvedValueOnce({
      players_created: 0,
      players_updated: 0,
      teams_created: 0,
      teams_updated: 0,
      roster_players_added: 5,
      roster_players_removed: 2,
    });

    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={false}
        onSync={mockOnSync}
      />
    );

    const syncButton = screen.getByRole('button', { name: 'Sync Rosters' });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(mockOnSync).toHaveBeenCalledWith('rosters');
    });
  });

  it('calls onSync with correct type when clicking Full Sync', async () => {
    mockOnSync.mockResolvedValueOnce({
      players_created: 10,
      players_updated: 50,
      teams_created: 0,
      teams_updated: 12,
      roster_players_added: 15,
      roster_players_removed: 8,
    });

    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={true}
        onSync={mockOnSync}
      />
    );

    const syncButton = screen.getByRole('button', { name: 'Full Sync' });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(mockOnSync).toHaveBeenCalledWith('full');
    });
  });

  it('displays sync results after successful sync', async () => {
    mockOnSync.mockResolvedValueOnce({
      players_created: 10,
      players_updated: 50,
      teams_created: 2,
      teams_updated: 12,
      roster_players_added: 15,
      roster_players_removed: 8,
    });

    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={true}
        onSync={mockOnSync}
      />
    );

    const syncButton = screen.getByRole('button', { name: 'Full Sync' });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(screen.getByText('Sync Results')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  it('disables buttons while syncing', async () => {
    let resolveSync: (value: unknown) => void;
    mockOnSync.mockImplementation(() => new Promise((resolve) => {
      resolveSync = resolve;
    }));

    render(
      <SyncControls
        syncStatus={mockSyncStatus}
        isSuperAdmin={true}
        onSync={mockOnSync}
      />
    );

    const fullSyncButton = screen.getByRole('button', { name: 'Full Sync' });
    fireEvent.click(fullSyncButton);

    await waitFor(() => {
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });

    const syncRostersButton = screen.getByRole('button', { name: /Sync Rosters/i });
    expect(syncRostersButton).toBeDisabled();

    resolveSync!({});
  });
});
