import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RookieForm, RookieListItem } from './RookieForm';
import { RookieListItem as RookieType } from '@/api/league';

const mockRookie: RookieType = {
  id: 'r1',
  name: 'Cooper Flagg',
  nba_team: 'DET',
  positions: ['SF', 'PF'],
  rookie_year: 2026,
  rookie_rank: 1,
  player_id: null,
};

describe('RookieForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form for new rookie', () => {
    render(
      <RookieForm
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/NBA Team/i)).toHaveValue('');
    expect(screen.getByLabelText(/Positions/i)).toHaveValue('');
  });

  it('renders form with existing rookie data', () => {
    render(
      <RookieForm
        rookie={mockRookie}
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Name/i)).toHaveValue('Cooper Flagg');
    expect(screen.getByLabelText(/NBA Team/i)).toHaveValue('DET');
    expect(screen.getByLabelText(/Positions/i)).toHaveValue('SF,PF');
  });

  it('shows validation errors for required fields', async () => {
    render(
      <RookieForm
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Add Rookie');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form data for new rookie', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <RookieForm
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Dylan Harper' } });
    fireEvent.change(screen.getByLabelText(/NBA Team/i), { target: { value: 'WAS' } });
    fireEvent.change(screen.getByLabelText(/Positions/i), { target: { value: 'PG,SG' } });
    fireEvent.change(screen.getByLabelText(/Rookie Rank/i), { target: { value: '2' } });

    const submitButton = screen.getByText('Add Rookie');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Dylan Harper',
        nba_team: 'WAS',
        positions: ['PG', 'SG'],
        rookie_rank: 2,
        rookie_year: 2026,
      });
    });
  });

  it('calls onSubmit with form data for existing rookie', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    render(
      <RookieForm
        rookie={mockRookie}
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Cooper Flagg Jr' } });

    const submitButton = screen.getByText('Update Rookie');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Cooper Flagg Jr',
        nba_team: 'DET',
        positions: ['SF', 'PF'],
      }));
    });
  });

  it('calls onCancel when clicking cancel button', () => {
    render(
      <RookieForm
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows "Add Rookie" button for new rookie', () => {
    render(
      <RookieForm
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Add Rookie')).toBeInTheDocument();
  });

  it('shows "Update Rookie" button for existing rookie', () => {
    render(
      <RookieForm
        rookie={mockRookie}
        currentYear={2026}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Update Rookie')).toBeInTheDocument();
  });
});

describe('RookieListItem', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rookie information', () => {
    render(
      <table>
        <tbody>
          <RookieListItem
            rookie={mockRookie}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Cooper Flagg')).toBeInTheDocument();
    expect(screen.getByText('SF/PF')).toBeInTheDocument();
    expect(screen.getByText('DET')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows "Not linked" for rookies without player_id', () => {
    render(
      <table>
        <tbody>
          <RookieListItem
            rookie={mockRookie}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Not linked')).toBeInTheDocument();
  });

  it('shows "Linked" for rookies with player_id', () => {
    render(
      <table>
        <tbody>
          <RookieListItem
            rookie={{ ...mockRookie, player_id: 'p1' }}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Linked')).toBeInTheDocument();
  });

  it('calls onEdit when clicking Edit button', () => {
    render(
      <table>
        <tbody>
          <RookieListItem
            rookie={mockRookie}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockRookie);
  });

  it('calls onDelete when clicking Delete button', () => {
    render(
      <table>
        <tbody>
          <RookieListItem
            rookie={mockRookie}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockRookie);
  });

  it('shows "Deleting..." and disables buttons when deleting', () => {
    render(
      <table>
        <tbody>
          <RookieListItem
            rookie={mockRookie}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            isDeleting={true}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeDisabled();
  });
});
