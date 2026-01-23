'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { getDraftPicks, getTeams, getRookies, updateDraftPick, DraftPick, Team, RookieListItem } from '@/api/league';
import { AdminLayout, DraftPickEditor } from '@/components/capwise/admin';
import { Card } from '@/components/capwise/ui';
import { Select } from '@/components/bb/ui';
import { Spinner, Alert } from '@/components/bb/feedback';

export default function AdminDraftPicksPage() {
  const { currentTeam, currentLeague } = useTeam();

  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rookies, setRookies] = useState<RookieListItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { label: 'All Years', value: '' },
    ...Array.from({ length: 5 }, (_, i) => ({
      label: (currentYear + i).toString(),
      value: (currentYear + i).toString(),
    })),
  ];

  const fetchData = useCallback(async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const [picksData, teamsData, rookiesData] = await Promise.all([
        getDraftPicks(currentTeam.id, { year: selectedYear ? parseInt(selectedYear, 10) : undefined }),
        getTeams(currentTeam.id),
        getRookies(currentTeam.id, { rookie_year: currentLeague?.year }),
      ]);
      setDraftPicks(picksData);
      setTeams(teamsData);
      setRookies(rookiesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam?.id, currentLeague?.year, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePick = async (
    pickId: string,
    updates: {
      pick_number?: number;
      projected_number?: number;
      current_team_id?: string;
      rookie_id?: string;
    }
  ) => {
    if (!currentTeam?.id) return;

    setError(null);
    setSuccessMessage(null);
    try {
      await updateDraftPick(currentTeam.id, pickId, updates);
      setSuccessMessage('Draft pick updated successfully');
      await fetchData();
    } catch (err) {
      setError('Failed to update draft pick');
      console.error(err);
      throw err;
    }
  };

  return (
    <AdminLayout title="Draft Pick Management">
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
            <label className="text-sm font-medium text-text-muted">Filter by Year:</label>
            <div className="w-48">
              <Select
                id="year-select"
                name="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={yearOptions}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" label="Loading draft picks..." />
            </div>
          ) : (
            <DraftPickEditor
              picks={draftPicks}
              teams={teams}
              rookies={rookies}
              onUpdatePick={handleUpdatePick}
              isLoading={isLoading}
            />
          )}
        </div>
      </Card>
    </AdminLayout>
  );
}
