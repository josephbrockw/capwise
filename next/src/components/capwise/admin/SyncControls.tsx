'use client';

import { useState } from 'react';
import { SyncStatus, SyncResult } from '@/api/league';
import { Button } from '@/components/bb/ui';
import { Badge } from '@/components/bb/data-display';

interface SyncControlsProps {
  syncStatus: SyncStatus | null;
  isSuperAdmin: boolean;
  onSync: (syncType: 'full' | 'players' | 'rosters') => Promise<SyncResult>;
  isLoading?: boolean;
}

export function SyncControls({
  syncStatus,
  isSuperAdmin,
  onSync,
  isLoading = false,
}: SyncControlsProps) {
  const [syncingType, setSyncingType] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const handleSync = async (syncType: 'full' | 'players' | 'rosters') => {
    setSyncingType(syncType);
    setLastResult(null);
    try {
      const result = await onSync(syncType);
      setLastResult(result);
    } finally {
      setSyncingType(null);
    }
  };

  const formatLastSync = (date: string | null) => {
    if (!date) return 'Never';
    try {
      const syncDate = new Date(date);
      const now = new Date();
      const diffMs = now.getTime() - syncDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago` : 'Just now';
      }
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6" data-testid="sync-controls">
      <div className="flex items-center justify-between p-4 bg-surface-alt rounded-lg">
        <div>
          <h3 className="font-medium text-text">Sync Status</h3>
          <p className="text-sm text-text-muted mt-1">
            Last synced: {formatLastSync(syncStatus?.last_sync_date || null)}
          </p>
          {syncStatus?.espn_league_id && (
            <p className="text-sm text-text-muted">
              ESPN League ID: {syncStatus.espn_league_id}
            </p>
          )}
        </div>
        <Badge
          variant={syncStatus?.needs_sync ? 'warning' : 'success'}
          size="lg"
        >
          {syncStatus?.needs_sync ? 'Sync Needed' : 'Up to Date'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isSuperAdmin && (
          <div className="p-4 border border-border rounded-lg">
            <h4 className="font-medium text-text mb-2">Sync Players</h4>
            <p className="text-sm text-text-muted mb-4">
              Update player stats and information from ESPN
            </p>
            <Button
              variant="secondary"
              onClick={() => handleSync('players')}
              disabled={isLoading || syncingType !== null}
              className="w-full"
            >
              {syncingType === 'players' ? 'Syncing...' : 'Sync Players'}
            </Button>
          </div>
        )}

        <div className="p-4 border border-border rounded-lg">
          <h4 className="font-medium text-text mb-2">Sync Rosters</h4>
          <p className="text-sm text-text-muted mb-4">
            Update team rosters from ESPN
          </p>
          <Button
            variant="secondary"
            onClick={() => handleSync('rosters')}
            disabled={isLoading || syncingType !== null}
            className="w-full"
          >
            {syncingType === 'rosters' ? 'Syncing...' : 'Sync Rosters'}
          </Button>
        </div>

        {isSuperAdmin && (
          <div className="p-4 border border-border rounded-lg">
            <h4 className="font-medium text-text mb-2">Full Sync</h4>
            <p className="text-sm text-text-muted mb-4">
              Complete sync of all data from ESPN
            </p>
            <Button
              variant="primary"
              onClick={() => handleSync('full')}
              disabled={isLoading || syncingType !== null}
              className="w-full"
            >
              {syncingType === 'full' ? 'Syncing...' : 'Full Sync'}
            </Button>
          </div>
        )}
      </div>

      {lastResult && (
        <div className="p-4 bg-surface-alt rounded-lg">
          <h4 className="font-medium text-text mb-2">Sync Results</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Players Created:</span>
              <span className="ml-2 font-medium text-text">{lastResult.players_created || 0}</span>
            </div>
            <div>
              <span className="text-text-muted">Players Updated:</span>
              <span className="ml-2 font-medium text-text">{lastResult.players_updated || 0}</span>
            </div>
            <div>
              <span className="text-text-muted">Teams Created:</span>
              <span className="ml-2 font-medium text-text">{lastResult.teams_created || 0}</span>
            </div>
            <div>
              <span className="text-text-muted">Teams Updated:</span>
              <span className="ml-2 font-medium text-text">{lastResult.teams_updated || 0}</span>
            </div>
            <div>
              <span className="text-text-muted">Roster Added:</span>
              <span className="ml-2 font-medium text-text">{lastResult.roster_players_added || 0}</span>
            </div>
            <div>
              <span className="text-text-muted">Roster Removed:</span>
              <span className="ml-2 font-medium text-text">{lastResult.roster_players_removed || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
