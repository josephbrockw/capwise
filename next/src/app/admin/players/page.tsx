'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { getPlayers, updatePlayer, Player } from '@/api/league';
import { AdminLayout, PlayerEditor } from '@/components/capwise/admin';
import { Card } from '@/components/capwise/ui';
import { Input } from '@/components/bb/ui';
import { Spinner, Alert } from '@/components/bb/feedback';

export default function AdminPlayersPage() {
  const router = useRouter();
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const { currentTeam, isLoading: teamLoading } = useTeam();

  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !teamLoading && !isSuperAdmin) {
      router.push('/admin/rosters');
    }
  }, [authLoading, teamLoading, isSuperAdmin, router]);

  const fetchPlayers = useCallback(async () => {
    if (!currentTeam?.id || !searchQuery.trim()) {
      setPlayers([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getPlayers(currentTeam.id, { name: searchQuery });
      setPlayers(data.results || []);
    } catch (err) {
      setError('Failed to load players');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam?.id, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchPlayers();
      } else {
        setPlayers([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, fetchPlayers]);

  const handleUpdatePlayer = async (
    playerId: string,
    updates: { projected_value?: number; is_injured?: boolean }
  ) => {
    if (!currentTeam?.id) return;

    setError(null);
    setSuccessMessage(null);
    try {
      await updatePlayer(currentTeam.id, playerId, updates);
      setSuccessMessage('Player updated successfully');
      await fetchPlayers();
    } catch (err) {
      setError('Failed to update player');
      console.error(err);
      throw err;
    }
  };

  if (authLoading || teamLoading) {
    return (
      <AdminLayout title="Player Management">
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" label="Loading..." />
        </div>
      </AdminLayout>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <AdminLayout title="Player Management">
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
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-text-muted">Search Players:</label>
            <div className="flex-1 max-w-md">
              <Input
                id="player-search"
                name="search"
                placeholder="Enter player name (min 2 characters)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" label="Searching players..." />
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="text-center py-8 text-text-muted">
              Enter at least 2 characters to search for players
            </div>
          ) : (
            <PlayerEditor
              players={players}
              onUpdatePlayer={handleUpdatePlayer}
              isLoading={isLoading}
            />
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}
