'use client';

import { useState } from 'react';
import { Player } from '@/api/league';
import { Button, Input, Checkbox } from '@/components/bb/ui';

interface PlayerEditorProps {
  players: Player[];
  onUpdatePlayer: (playerId: string, updates: {
    projected_value?: number;
    is_injured?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function PlayerEditor({
  players,
  onUpdatePlayer,
  isLoading = false,
}: PlayerEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    projected_value: string;
    is_injured: boolean;
  }>({ projected_value: '', is_injured: false });
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setEditValues({
      projected_value: player.projected_value?.toString() || '0',
      is_injured: player.is_injured,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ projected_value: '', is_injured: false });
  };

  const handleSave = async (playerId: string) => {
    setSavingId(playerId);
    try {
      await onUpdatePlayer(playerId, {
        projected_value: parseFloat(editValues.projected_value),
        is_injured: editValues.is_injured,
      });
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No players found. Try adjusting your search.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" data-testid="player-editor">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Player</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Position</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">NBA Team</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Projected Value</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Injured</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">On Roster</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const isEditing = editingId === player.id;
            const isSaving = savingId === player.id;

            return (
              <tr
                key={player.id}
                className="border-b border-border last:border-0 hover:bg-surface-hover"
                data-testid={`player-row-${player.id}`}
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-text">{player.name}</div>
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">
                  {player.positions.join('/')}
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">
                  {player.nba_team}
                </td>
                <td className="py-3 px-4 text-right">
                  {isEditing ? (
                    <Input
                      id={`projected-value-${player.id}`}
                      name="projected_value"
                      type="number"
                      step="0.1"
                      value={editValues.projected_value}
                      onChange={(e) => setEditValues({ ...editValues, projected_value: e.target.value })}
                      className="w-24 text-right"
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="text-text">{player.projected_value?.toFixed(1) || '-'}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {isEditing ? (
                    <Checkbox
                      id={`injured-${player.id}`}
                      name="is_injured"
                      checked={editValues.is_injured}
                      onChange={(e) => setEditValues({ ...editValues, is_injured: e.target.checked })}
                      disabled={isSaving}
                    />
                  ) : (
                    <span className={player.is_injured ? 'text-danger-500' : 'text-text-muted'}>
                      {player.is_injured ? 'Yes' : 'No'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={player.on_roster ? 'text-success-500' : 'text-text-muted'}>
                    {player.on_roster ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {isEditing ? (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="primary"
                        onClick={() => handleSave(player.id)}
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
                      onClick={() => handleEdit(player)}
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
