'use client';

import { useState } from 'react';
import { DraftPick, Team, RookieListItem } from '@/api/league';
import { Button, Input, Select } from '@/components/bb/ui';

interface DraftPickEditorProps {
  picks: DraftPick[];
  teams: Team[];
  rookies: RookieListItem[];
  onUpdatePick: (pickId: string, updates: {
    pick_number?: number;
    projected_number?: number;
    current_team_id?: string;
    rookie_id?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function DraftPickEditor({
  picks,
  teams,
  rookies,
  onUpdatePick,
  isLoading = false,
}: DraftPickEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    pick_number: string;
    projected_number: string;
    current_team_id: string;
    rookie_id: string;
  }>({ pick_number: '', projected_number: '', current_team_id: '', rookie_id: '' });
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleEdit = (pick: DraftPick) => {
    setEditingId(pick.id);
    setEditValues({
      pick_number: pick.pick_number?.toString() || '',
      projected_number: pick.projected_number?.toString() || '',
      current_team_id: pick.current_team_id,
      rookie_id: '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ pick_number: '', projected_number: '', current_team_id: '', rookie_id: '' });
  };

  const handleSave = async (pickId: string) => {
    setSavingId(pickId);
    try {
      await onUpdatePick(pickId, {
        pick_number: editValues.pick_number ? parseInt(editValues.pick_number, 10) : undefined,
        projected_number: editValues.projected_number ? parseInt(editValues.projected_number, 10) : undefined,
        current_team_id: editValues.current_team_id || undefined,
        rookie_id: editValues.rookie_id || undefined,
      });
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

  const teamOptions = [
    { label: 'Select team...', value: '' },
    ...teams.map((team) => ({ label: team.name, value: team.id })),
  ];

  const availableRookies = rookies.filter((r) => !r.player_id);
  const rookieOptions = [
    { label: 'No selection', value: '' },
    ...availableRookies.map((rookie) => ({
      label: `${rookie.name} (${rookie.nba_team})`,
      value: rookie.id,
    })),
  ];

  if (picks.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No draft picks found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" data-testid="draft-pick-editor">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Year</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Round</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Pick #</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Projected #</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Original Team</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Current Owner</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Assigned Rookie</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((pick) => {
            const isEditing = editingId === pick.id;
            const isSaving = savingId === pick.id;

            return (
              <tr
                key={pick.id}
                className="border-b border-border last:border-0 hover:bg-surface-hover"
                data-testid={`draft-pick-row-${pick.id}`}
              >
                <td className="py-3 px-4 text-text">{pick.year}</td>
                <td className="py-3 px-4 text-text">Round {pick.round}</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <Input
                      id={`pick-number-${pick.id}`}
                      name="pick_number"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={editValues.pick_number}
                      onChange={(e) => setEditValues({ ...editValues, pick_number: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-24"
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="text-text">{pick.pick_number || '-'}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <Input
                      id={`projected-number-${pick.id}`}
                      name="projected_number"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={editValues.projected_number}
                      onChange={(e) => setEditValues({ ...editValues, projected_number: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-24"
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="text-text-muted">{pick.projected_number || '-'}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-text-muted">{pick.original_team_name}</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <Select
                      id={`current-team-${pick.id}`}
                      name="current_team_id"
                      value={editValues.current_team_id}
                      onChange={(e) => setEditValues({ ...editValues, current_team_id: e.target.value })}
                      options={teamOptions}
                      disabled={isSaving}
                    />
                  ) : (
                    <span className={pick.current_team_id !== pick.original_team_id ? 'text-warning-500' : 'text-text'}>
                      {pick.current_team_name}
                      {pick.current_team_id !== pick.original_team_id && ' (traded)'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <Select
                      id={`rookie-${pick.id}`}
                      name="rookie_id"
                      value={editValues.rookie_id}
                      onChange={(e) => setEditValues({ ...editValues, rookie_id: e.target.value })}
                      options={rookieOptions}
                      disabled={isSaving}
                    />
                  ) : (
                    <span className={pick.assigned_name ? 'text-success-500' : 'text-text-muted'}>
                      {pick.assigned_name || 'Not assigned'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {isEditing ? (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="primary"
                        onClick={() => handleSave(pick.id)}
                        disabled={isSaving || isLoading}
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(pick)}
                      disabled={isLoading || editingId !== null}
                    >
                      Edit
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
