'use client';

import { useState } from 'react';
import { RosterPlayerDetail } from '@/api/league';
import { Button, Input, Checkbox } from '@/components/bb/ui';
import { formatCurrency } from '@/utils/format';

export interface EditableRosterPlayer extends RosterPlayerDetail {
  isEditing?: boolean;
  editedSalary?: number;
  editedIsKeeper?: boolean;
  editedTradeBlocked?: boolean;
}

interface EditableRosterTableProps {
  players: RosterPlayerDetail[];
  onUpdatePlayer: (playerId: string, updates: {
    salary?: number;
    is_keeper?: boolean;
    trade_blocked?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function EditableRosterTable({
  players,
  onUpdatePlayer,
  isLoading = false,
}: EditableRosterTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    salary: string;
    is_keeper: boolean;
    trade_blocked: boolean;
  }>({ salary: '', is_keeper: false, trade_blocked: false });
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleEdit = (player: RosterPlayerDetail) => {
    setEditingId(player.id);
    setEditValues({
      salary: player.salary.toString(),
      is_keeper: player.is_keeper,
      trade_blocked: player.trade_blocked,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ salary: '', is_keeper: false, trade_blocked: false });
  };

  const handleSave = async (playerId: string) => {
    setSavingId(playerId);
    try {
      await onUpdatePlayer(playerId, {
        salary: parseInt(editValues.salary, 10),
        is_keeper: editValues.is_keeper,
        trade_blocked: editValues.trade_blocked,
      });
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No players on roster
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" data-testid="editable-roster-table">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Player</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Position</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">NBA Team</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Salary</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Keeper</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-text-muted">Trade Blocked</th>
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
                data-testid={`roster-row-${player.id}`}
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-text">{player.player.name}</div>
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">
                  {player.player.positions.join('/')}
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">
                  {player.player.nba_team}
                </td>
                <td className="py-3 px-4 text-right">
                  {isEditing ? (
                    <Input
                      id={`salary-${player.id}`}
                      name="salary"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={editValues.salary}
                      onChange={(e) => setEditValues({ ...editValues, salary: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-36 text-right"
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="text-text">{formatCurrency(player.salary)}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {isEditing ? (
                    <Checkbox
                      id={`keeper-${player.id}`}
                      name="is_keeper"
                      checked={editValues.is_keeper}
                      onChange={(e) => setEditValues({ ...editValues, is_keeper: e.target.checked })}
                      disabled={isSaving}
                    />
                  ) : (
                    <span className={player.is_keeper ? 'text-success-500' : 'text-text-muted'}>
                      {player.is_keeper ? 'Yes' : 'No'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {isEditing ? (
                    <Checkbox
                      id={`trade-blocked-${player.id}`}
                      name="trade_blocked"
                      checked={editValues.trade_blocked}
                      onChange={(e) => setEditValues({ ...editValues, trade_blocked: e.target.checked })}
                      disabled={isSaving}
                    />
                  ) : (
                    <span className={player.trade_blocked ? 'text-danger-500' : 'text-text-muted'}>
                      {player.trade_blocked ? 'Yes' : 'No'}
                    </span>
                  )}
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
