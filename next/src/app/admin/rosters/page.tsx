'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { getTeams, getTeam, Team, TeamDetail, updateRosterPlayer } from '@/api/league';
import { AdminLayout, EditableRosterTable } from '@/components/capwise/admin';
import { Card } from '@/components/capwise/ui';
import { Select } from '@/components/bb/ui';
import { Spinner, Alert } from '@/components/bb/feedback';

export default function AdminRostersPage() {
  const { currentTeam } = useTeam();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentTeam?.id) return;

      setIsLoadingTeams(true);
      try {
        const teamsData = await getTeams(currentTeam.id);
        setTeams(teamsData);
        if (teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].id);
        }
      } catch (err) {
        setError('Failed to load teams');
        console.error(err);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [currentTeam?.id]);

  const fetchTeamRoster = useCallback(async () => {
    if (!currentTeam?.id || !selectedTeamId) return;

    setIsLoadingRoster(true);
    setError(null);
    try {
      const detail = await getTeam(selectedTeamId, currentTeam.id);
      setTeamDetail(detail);
    } catch (err) {
      setError('Failed to load roster');
      console.error(err);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [currentTeam?.id, selectedTeamId]);

  useEffect(() => {
    fetchTeamRoster();
  }, [fetchTeamRoster]);

  const handleUpdatePlayer = async (
    rosterPlayerId: string,
    updates: { salary?: number; is_keeper?: boolean; trade_blocked?: boolean }
  ) => {
    if (!currentTeam?.id) return;

    setError(null);
    setSuccessMessage(null);
    try {
      await updateRosterPlayer(currentTeam.id, rosterPlayerId, updates);
      setSuccessMessage('Player updated successfully');
      await fetchTeamRoster();
    } catch (err) {
      setError('Failed to update player');
      console.error(err);
      throw err;
    }
  };

  const teamOptions = teams.map((team) => ({
    label: team.name,
    value: team.id,
  }));

  return (
    <AdminLayout title="Roster Management">
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
            <label className="text-sm font-medium text-text-muted">Select Team:</label>
            <div className="w-64">
              <Select
                id="team-select"
                name="team"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                options={teamOptions}
                placeholder="Select a team..."
                disabled={isLoadingTeams}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {isLoadingTeams || isLoadingRoster ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" label="Loading roster..." />
            </div>
          ) : teamDetail?.roster ? (
            <EditableRosterTable
              players={teamDetail.roster}
              onUpdatePlayer={handleUpdatePlayer}
              isLoading={isLoadingRoster}
            />
          ) : (
            <div className="text-center py-8 text-text-muted">
              Select a team to view and edit their roster
            </div>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}
