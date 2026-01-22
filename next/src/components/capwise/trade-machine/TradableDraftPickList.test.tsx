import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TradableDraftPickList } from './TradableDraftPickList';
import { TradableDraftPick } from './types';

const currentYear = 2024;

const mockPicks: TradableDraftPick[] = [
  {
    id: 'pick-1',
    year: 2024,
    round: 1,
    pick_number: null,
    projected_number: 5,
    original_team_id: 'team-1',
    original_team_name: 'Lakers',
    current_team_id: 'team-1',
    is_rostered: false,
    isSelected: false,
  },
  {
    id: 'pick-2',
    year: 2025,
    round: 2,
    pick_number: null,
    projected_number: null,
    original_team_id: 'team-2',
    original_team_name: 'Celtics',
    current_team_id: 'team-1',
    is_rostered: false,
    isSelected: true,
  },
  {
    id: 'pick-3',
    year: 2026,
    round: 1,
    pick_number: null,
    projected_number: null,
    original_team_id: 'team-1',
    original_team_name: 'Lakers',
    current_team_id: 'team-1',
    is_rostered: false,
    isSelected: false,
  },
];

describe('TradableDraftPickList', () => {
  it('renders empty state when no picks', () => {
    render(
      <TradableDraftPickList
        picks={[]}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    expect(screen.getByTestId('empty-pick-list')).toBeInTheDocument();
    expect(screen.getByText('No draft picks available')).toBeInTheDocument();
  });

  it('renders pick list with correct data', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    expect(screen.getByTestId('tradable-pick-list')).toBeInTheDocument();
    expect(screen.getByText('2024 1st Round')).toBeInTheDocument();
    expect(screen.getByText('2025 2nd Round')).toBeInTheDocument();
    expect(screen.getByText('2026 1st Round')).toBeInTheDocument();
  });

  it('shows "via" badge for picks from other teams', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('via Celtics')).toBeInTheDocument();
  });

  it('shows projected pick number when available', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('Projected: #5')).toBeInTheDocument();
  });

  it('calls onSelectionChange when pick is selected', () => {
    const onSelectionChange = vi.fn();
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={onSelectionChange}
        currentYear={currentYear}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /2024 1st round/i });
    fireEvent.click(checkbox);

    expect(onSelectionChange).toHaveBeenCalledWith('pick-1', true);
  });

  it('shows selected count when picks are selected', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('sorts picks by year by default (ascending)', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    const pickItems = screen.getAllByTestId(/pick-item-/);
    expect(pickItems[0]).toHaveTextContent('2024');
    expect(pickItems[1]).toHaveTextContent('2025');
    expect(pickItems[2]).toHaveTextContent('2026');
  });

  it('sorts by round when clicking round sort', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    const roundSort = screen.getByTestId('sort-round');
    fireEvent.click(roundSort);

    const pickItems = screen.getAllByTestId(/pick-item-/);
    expect(pickItems[0]).toHaveTextContent('1st Round');
  });

  it('sorts by value when clicking value sort', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    const valueSort = screen.getByTestId('sort-value');
    fireEvent.click(valueSort);

    const pickItems = screen.getAllByTestId(/pick-item-/);
    expect(pickItems[0]).toHaveTextContent('2024 1st');
  });

  it('disables checkboxes when disabled prop is true', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
        disabled
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('calculates and displays pick value', () => {
    render(
      <TradableDraftPickList
        picks={mockPicks}
        onSelectionChange={vi.fn()}
        currentYear={currentYear}
      />
    );

    expect(screen.getByText('100 pts')).toBeInTheDocument();
  });
});
