'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { getRookies, createRookie, updateRookie, deleteRookie, RookieListItem as RookieListItemType, RookieCreate, RookieUpdate } from '@/api/league';
import { AdminLayout, RookieForm, RookieListItem } from '@/components/capwise/admin';
import { Card } from '@/components/capwise/ui';
import { Button, Select } from '@/components/bb/ui';
import { Spinner, Alert, Modal } from '@/components/bb/feedback';

export default function AdminRookiesPage() {
  const router = useRouter();
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const { currentTeam, currentLeague, isLoading: teamLoading } = useTeam();

  const [rookies, setRookies] = useState<RookieListItemType[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRookie, setEditingRookie] = useState<RookieListItemType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentYear = currentLeague?.year || new Date().getFullYear();
  const yearOptions = [
    { label: 'All Years', value: '' },
    ...Array.from({ length: 3 }, (_, i) => ({
      label: (currentYear + i).toString(),
      value: (currentYear + i).toString(),
    })),
  ];

  useEffect(() => {
    if (!authLoading && !teamLoading && !isSuperAdmin) {
      router.push('/admin/rosters');
    }
  }, [authLoading, teamLoading, isSuperAdmin, router]);

  const fetchRookies = useCallback(async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await getRookies(currentTeam.id, {
        rookie_year: selectedYear ? parseInt(selectedYear, 10) : undefined,
      });
      setRookies(data);
    } catch (err) {
      setError('Failed to load rookies');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam?.id, selectedYear]);

  useEffect(() => {
    fetchRookies();
  }, [fetchRookies]);

  const handleAddRookie = () => {
    setEditingRookie(null);
    setIsModalOpen(true);
  };

  const handleEditRookie = (rookie: RookieListItemType) => {
    setEditingRookie(rookie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRookie(null);
  };

  const handleSubmit = async (data: RookieCreate | RookieUpdate) => {
    if (!currentTeam?.id) return;

    setIsSaving(true);
    setError(null);
    try {
      if (editingRookie) {
        await updateRookie(currentTeam.id, editingRookie.id, data as RookieUpdate);
        setSuccessMessage('Rookie updated successfully');
      } else {
        await createRookie(currentTeam.id, data as RookieCreate);
        setSuccessMessage('Rookie added successfully');
      }
      handleCloseModal();
      await fetchRookies();
    } catch (err) {
      setError('Failed to save rookie');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRookie = async (rookie: RookieListItemType) => {
    if (!currentTeam?.id) return;
    if (!confirm(`Are you sure you want to delete ${rookie.name}?`)) return;

    setDeletingId(rookie.id);
    setError(null);
    try {
      await deleteRookie(currentTeam.id, rookie.id);
      setSuccessMessage('Rookie deleted successfully');
      await fetchRookies();
    } catch (err) {
      setError('Failed to delete rookie');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || teamLoading) {
    return (
      <AdminLayout title="Rookie Management">
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
    <AdminLayout title="Rookie Management">
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
          <div className="flex items-center justify-between">
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
            <Button variant="primary" onClick={handleAddRookie}>
              Add Rookie
            </Button>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" label="Loading rookies..." />
            </div>
          ) : rookies.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No rookies found. Click &quot;Add Rookie&quot; to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="rookie-list">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Position</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">NBA Team</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Year</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Player Link</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rookies.map((rookie) => (
                    <RookieListItem
                      key={rookie.id}
                      rookie={rookie}
                      onEdit={handleEditRookie}
                      onDelete={handleDeleteRookie}
                      isDeleting={deletingId === rookie.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        title={editingRookie ? 'Edit Rookie' : 'Add Rookie'}
      >
        <RookieForm
          rookie={editingRookie || undefined}
          currentYear={currentYear}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSaving}
        />
      </Modal>
    </AdminLayout>
  );
}
