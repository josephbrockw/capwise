'use client';

import { useState } from 'react';
import { RookieListItem as RookieType, RookieCreate, RookieUpdate } from '@/api/league';
import { Button, Input } from '@/components/bb/ui';

interface RookieFormProps {
  rookie?: RookieType;
  currentYear: number;
  onSubmit: (data: RookieCreate | RookieUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RookieForm({
  rookie,
  currentYear,
  onSubmit,
  onCancel,
  isLoading = false,
}: RookieFormProps) {
  const [formData, setFormData] = useState({
    name: rookie?.name || '',
    nba_team: rookie?.nba_team || '',
    positions: rookie?.positions?.join(',') || '',
    rookie_rank: rookie?.rookie_rank?.toString() || '',
    rookie_year: rookie?.rookie_year?.toString() || currentYear.toString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.nba_team.trim()) newErrors.nba_team = 'NBA Team is required';
    if (!formData.positions.trim()) newErrors.positions = 'At least one position is required';
    if (!formData.rookie_year) newErrors.rookie_year = 'Rookie year is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const positions = formData.positions.split(',').map((p) => p.trim().toUpperCase());

    if (rookie) {
      await onSubmit({
        name: formData.name,
        nba_team: formData.nba_team,
        positions,
        rookie_rank: formData.rookie_rank ? parseInt(formData.rookie_rank, 10) : undefined,
      } as RookieUpdate);
    } else {
      await onSubmit({
        name: formData.name,
        nba_team: formData.nba_team,
        positions,
        rookie_rank: formData.rookie_rank ? parseInt(formData.rookie_rank, 10) : undefined,
        rookie_year: parseInt(formData.rookie_year, 10),
      } as RookieCreate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="rookie-form">
      <div>
        <Input
          id="rookie-name"
          name="name"
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          disabled={isLoading}
        />
      </div>

      <div>
        <Input
          id="rookie-nba-team"
          name="nba_team"
          label="NBA Team"
          placeholder="e.g., LAL, BOS, GSW"
          value={formData.nba_team}
          onChange={(e) => setFormData({ ...formData, nba_team: e.target.value })}
          error={errors.nba_team}
          disabled={isLoading}
        />
      </div>

      <div>
        <Input
          id="rookie-positions"
          name="positions"
          label="Positions"
          placeholder="e.g., PG,SG or SF,PF"
          value={formData.positions}
          onChange={(e) => setFormData({ ...formData, positions: e.target.value })}
          helperText="Comma-separated positions (PG, SG, SF, PF, C)"
          error={errors.positions}
          disabled={isLoading}
        />
      </div>

      <div>
        <Input
          id="rookie-rank"
          name="rookie_rank"
          label="Rookie Rank"
          type="number"
          placeholder="Optional"
          value={formData.rookie_rank}
          onChange={(e) => setFormData({ ...formData, rookie_rank: e.target.value })}
          disabled={isLoading}
        />
      </div>

      {!rookie && (
        <div>
          <Input
            id="rookie-year"
            name="rookie_year"
            label="Rookie Year"
            type="number"
            value={formData.rookie_year}
            onChange={(e) => setFormData({ ...formData, rookie_year: e.target.value })}
            error={errors.rookie_year}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : rookie ? 'Update Rookie' : 'Add Rookie'}
        </Button>
      </div>
    </form>
  );
}

interface RookieListItemProps {
  rookie: RookieType;
  onEdit: (rookie: RookieType) => void;
  onDelete: (rookie: RookieType) => void;
  isDeleting?: boolean;
}

export function RookieListItem({
  rookie,
  onEdit,
  onDelete,
  isDeleting = false,
}: RookieListItemProps) {
  return (
    <tr
      className="border-b border-border last:border-0 hover:bg-surface-hover"
      data-testid={`rookie-row-${rookie.id}`}
    >
      <td className="py-3 px-4">
        <div className="font-medium text-text">{rookie.name}</div>
      </td>
      <td className="py-3 px-4 text-sm text-text-muted">
        {rookie.positions?.join('/') || '-'}
      </td>
      <td className="py-3 px-4 text-sm text-text-muted">
        {rookie.nba_team}
      </td>
      <td className="py-3 px-4 text-sm text-text-muted">
        {rookie.rookie_year}
      </td>
      <td className="py-3 px-4 text-sm text-text-muted">
        {rookie.rookie_rank || '-'}
      </td>
      <td className="py-3 px-4 text-sm">
        <span className={rookie.player_id ? 'text-success-500' : 'text-text-muted'}>
          {rookie.player_id ? 'Linked' : 'Not linked'}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={() => onEdit(rookie)}
            disabled={isDeleting}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => onDelete(rookie)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </td>
    </tr>
  );
}
