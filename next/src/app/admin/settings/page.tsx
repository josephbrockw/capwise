'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { getLeague, updateLeagueSettings, League, LeagueSettingsUpdate } from '@/api/league';
import { AdminLayout, LeagueSettingsForm } from '@/components/capwise/admin';
import { Card } from '@/components/capwise/ui';
import { Spinner, Alert } from '@/components/bb/feedback';

export default function AdminSettingsPage() {
  const { currentLeague } = useTeam();

  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLeague = useCallback(async () => {
    if (!currentLeague?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeague(currentLeague.id);
      setLeague(data);
    } catch (err) {
      setError('Failed to load league settings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLeague?.id]);

  useEffect(() => {
    fetchLeague();
  }, [fetchLeague]);

  const handleSubmit = async (updates: LeagueSettingsUpdate) => {
    if (!currentLeague?.id) return;

    setError(null);
    setSuccessMessage(null);
    try {
      await updateLeagueSettings(currentLeague.id, updates);
      setSuccessMessage('Settings saved successfully');
      await fetchLeague();
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
      throw err;
    }
  };

  return (
    <AdminLayout title="League Settings">
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
              <Spinner size="lg" label="Loading settings..." />
            </div>
          ) : league ? (
            <LeagueSettingsForm
              league={league}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          ) : (
            <div className="text-center py-8 text-text-muted">
              Unable to load league settings
            </div>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}
