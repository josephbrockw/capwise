import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeagueSettingsForm } from './LeagueSettingsForm';
import { League } from '@/api/league';

const mockLeague: League = {
  id: 'league1',
  name: 'Test League',
  year: 2026,
  salary_cap: 300000000,
  min_salary: 1000000,
  roster_size: 15,
  commissioner_id: 'user1',
  draft_open: false,
  last_sync_date: '2026-01-01T00:00:00Z',
  needs_sync: false,
  salary_escalation_settings: {
    rookie_year_salary: 1000000,
    year_2_4_multiplier: 1.05,
    year_5_plus_multiplier: 1.08,
  },
};

describe('LeagueSettingsForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with league settings', () => {
    render(
      <LeagueSettingsForm
        league={mockLeague}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/Salary Cap/i)).toHaveValue(300000000);
    expect(screen.getByLabelText(/Minimum Salary/i)).toHaveValue(1000000);
    expect(screen.getByLabelText(/Roster Size/i)).toHaveValue(15);
  });

  it('shows draft open checkbox', () => {
    render(
      <LeagueSettingsForm
        league={mockLeague}
        onSubmit={mockOnSubmit}
      />
    );

    const draftOpenCheckbox = screen.getByLabelText(/Draft Open/i);
    expect(draftOpenCheckbox).not.toBeChecked();
  });

  it('disables save button when no changes', () => {
    render(
      <LeagueSettingsForm
        league={mockLeague}
        onSubmit={mockOnSubmit}
      />
    );

    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when changes are made', () => {
    render(
      <LeagueSettingsForm
        league={mockLeague}
        onSubmit={mockOnSubmit}
      />
    );

    const salaryCapInput = screen.getByLabelText(/Salary Cap/i);
    fireEvent.change(salaryCapInput, { target: { value: '350000000' } });

    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).not.toBeDisabled();
  });

  it('calls onSubmit with updated values', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <LeagueSettingsForm
        league={mockLeague}
        onSubmit={mockOnSubmit}
      />
    );

    const salaryCapInput = screen.getByLabelText(/Salary Cap/i);
    fireEvent.change(salaryCapInput, { target: { value: '350000000' } });

    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        salary_cap: 350000000,
        min_salary: 1000000,
        roster_size: 15,
        draft_open: false,
      }));
    });
  });

  it('resets form when clicking reset button', () => {
    render(
      <LeagueSettingsForm
        league={mockLeague}
        onSubmit={mockOnSubmit}
      />
    );

    const salaryCapInput = screen.getByLabelText(/Salary Cap/i);
    fireEvent.change(salaryCapInput, { target: { value: '350000000' } });

    expect(salaryCapInput).toHaveValue(350000000);

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(salaryCapInput).toHaveValue(300000000);
  });

  it('shows salary escalation settings', () => {
    render(
      <LeagueSettingsForm
        league={mockLeague}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Salary Escalation Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/Rookie Year Salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Years 2-4 Multiplier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Year 5\+ Multiplier/i)).toBeInTheDocument();
  });
});
