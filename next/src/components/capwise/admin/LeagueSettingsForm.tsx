'use client';

import { useState, useEffect } from 'react';
import { League, LeagueSettingsUpdate } from '@/api/league';
import { Button, Input, Checkbox } from '@/components/bb/ui';
import { formatCurrency } from '@/utils/format';

interface LeagueSettingsFormProps {
  league: League;
  onSubmit: (updates: LeagueSettingsUpdate) => Promise<void>;
  isLoading?: boolean;
}

export function LeagueSettingsForm({
  league,
  onSubmit,
  isLoading = false,
}: LeagueSettingsFormProps) {
  const [formData, setFormData] = useState({
    salary_cap: league.salary_cap.toString(),
    min_salary: league.min_salary.toString(),
    roster_size: league.roster_size.toString(),
    draft_open: league.draft_open,
    rookie_year_salary: league.salary_escalation_settings?.rookie_year_salary?.toString() || '1',
    year_2_4_multiplier: league.salary_escalation_settings?.year_2_4_multiplier?.toString() || '1.05',
    year_5_plus_multiplier: league.salary_escalation_settings?.year_5_plus_multiplier?.toString() || '1.08',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasChanged =
      formData.salary_cap !== league.salary_cap.toString() ||
      formData.min_salary !== league.min_salary.toString() ||
      formData.roster_size !== league.roster_size.toString() ||
      formData.draft_open !== league.draft_open ||
      formData.rookie_year_salary !== (league.salary_escalation_settings?.rookie_year_salary?.toString() || '1') ||
      formData.year_2_4_multiplier !== (league.salary_escalation_settings?.year_2_4_multiplier?.toString() || '1.05') ||
      formData.year_5_plus_multiplier !== (league.salary_escalation_settings?.year_5_plus_multiplier?.toString() || '1.08');
    setHasChanges(hasChanged);
  }, [formData, league]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit({
        salary_cap: parseInt(formData.salary_cap, 10),
        min_salary: parseInt(formData.min_salary, 10),
        roster_size: parseInt(formData.roster_size, 10),
        draft_open: formData.draft_open,
        salary_escalation_settings: {
          rookie_year_salary: parseInt(formData.rookie_year_salary, 10),
          year_2_4_multiplier: parseFloat(formData.year_2_4_multiplier),
          year_5_plus_multiplier: parseFloat(formData.year_5_plus_multiplier),
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      salary_cap: league.salary_cap.toString(),
      min_salary: league.min_salary.toString(),
      roster_size: league.roster_size.toString(),
      draft_open: league.draft_open,
      rookie_year_salary: league.salary_escalation_settings?.rookie_year_salary?.toString() || '1',
      year_2_4_multiplier: league.salary_escalation_settings?.year_2_4_multiplier?.toString() || '1.05',
      year_5_plus_multiplier: league.salary_escalation_settings?.year_5_plus_multiplier?.toString() || '1.08',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="league-settings-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text">General Settings</h3>

          <Input
            id="salary-cap"
            name="salary_cap"
            label="Salary Cap"
            type="number"
            value={formData.salary_cap}
            onChange={(e) => setFormData({ ...formData, salary_cap: e.target.value })}
            helperText={`Current: ${formatCurrency(league.salary_cap)}`}
            disabled={isLoading || isSaving}
          />

          <Input
            id="min-salary"
            name="min_salary"
            label="Minimum Salary"
            type="number"
            value={formData.min_salary}
            onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
            helperText={`Current: ${formatCurrency(league.min_salary)}`}
            disabled={isLoading || isSaving}
          />

          <Input
            id="roster-size"
            name="roster_size"
            label="Roster Size"
            type="number"
            value={formData.roster_size}
            onChange={(e) => setFormData({ ...formData, roster_size: e.target.value })}
            disabled={isLoading || isSaving}
          />

          <div className="pt-2">
            <Checkbox
              id="draft-open"
              name="draft_open"
              label="Draft Open"
              checked={formData.draft_open}
              onChange={(e) => setFormData({ ...formData, draft_open: e.target.checked })}
              disabled={isLoading || isSaving}
            />
            <p className="text-sm text-text-muted mt-1">
              When enabled, commissioners can make draft picks
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text">Salary Escalation Settings</h3>

          <Input
            id="rookie-year-salary"
            name="rookie_year_salary"
            label="Rookie Year Salary"
            type="number"
            value={formData.rookie_year_salary}
            onChange={(e) => setFormData({ ...formData, rookie_year_salary: e.target.value })}
            helperText="Base salary for rookie contracts"
            disabled={isLoading || isSaving}
          />

          <Input
            id="year-2-4-multiplier"
            name="year_2_4_multiplier"
            label="Years 2-4 Multiplier"
            type="number"
            step="0.01"
            value={formData.year_2_4_multiplier}
            onChange={(e) => setFormData({ ...formData, year_2_4_multiplier: e.target.value })}
            helperText="Salary multiplier for years 2-4"
            disabled={isLoading || isSaving}
          />

          <Input
            id="year-5-plus-multiplier"
            name="year_5_plus_multiplier"
            label="Year 5+ Multiplier"
            type="number"
            step="0.01"
            value={formData.year_5_plus_multiplier}
            onChange={(e) => setFormData({ ...formData, year_5_plus_multiplier: e.target.value })}
            helperText="Salary multiplier for year 5 and beyond"
            disabled={isLoading || isSaving}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          onClick={handleReset}
          disabled={isLoading || isSaving || !hasChanges}
        >
          Reset
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || isSaving || !hasChanges}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
