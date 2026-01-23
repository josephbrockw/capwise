'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { getSyncStatus, triggerSync, SyncStatus, SyncResult } from '@/api/league';
import { AdminLayout, SyncControls } from '@/components/capwise/admin';
import { Card } from '@/components/capwise/ui';
import { Spinner, Alert } from '@/components/bb/feedback';

export default function AdminSyncPage() {
  const { isSuperAdmin } = useAuth();
  const { currentTeam } = useTeam();

  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSyncStatus = useCallback(async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getSyncStatus(currentTeam.id);
      setSyncStatus(data);
    } catch (err) {
      setError('Failed to load sync status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam?.id]);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  const handleSync = async (syncType: 'full' | 'players' | 'rosters'): Promise<SyncResult> => {
    if (!currentTeam?.id) throw new Error('No team selected');

    setError(null);
    setSuccessMessage(null);
    try {
      const result = await triggerSync(currentTeam.id, { sync_type: syncType });
      setSuccessMessage(result.message || 'Sync completed successfully');
      await fetchSyncStatus();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AdminLayout title="Sync Controls">
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Card>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" label="Loading sync status..." />
            </div>
          ) : (
            <SyncControls
              syncStatus={syncStatus}
              isSuperAdmin={isSuperAdmin}
              onSync={handleSync}
              isLoading={isLoading}
            />
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}
