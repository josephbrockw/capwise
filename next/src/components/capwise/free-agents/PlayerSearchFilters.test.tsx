import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerSearchFilters, PlayerFilters } from './PlayerSearchFilters';

const defaultFilters: PlayerFilters = {
  search: '',
  positions: [],
  minProjectedValue: null,
  maxProjectedValue: null,
  hideInjured: false,
};

describe('PlayerSearchFilters', () => {
  it('renders search input', () => {
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Search players...')).toBeInTheDocument();
  });

  it('renders position filter buttons', () => {
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={vi.fn()} />);

    expect(screen.getByText('PG')).toBeInTheDocument();
    expect(screen.getByText('SG')).toBeInTheDocument();
    expect(screen.getByText('SF')).toBeInTheDocument();
    expect(screen.getByText('PF')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('calls onFiltersChange when position clicked', () => {
    const onFiltersChange = vi.fn();
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />);

    fireEvent.click(screen.getByText('PG'));
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      positions: ['PG'],
    });
  });

  it('removes position when already selected', () => {
    const onFiltersChange = vi.fn();
    const filters = { ...defaultFilters, positions: ['PG' as const] };
    render(<PlayerSearchFilters filters={filters} onFiltersChange={onFiltersChange} />);

    fireEvent.click(screen.getByText('PG'));
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      positions: [],
    });
  });

  it('renders hide injured toggle', () => {
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={vi.fn()} />);

    expect(screen.getByText('Hide Injured')).toBeInTheDocument();
  });

  it('calls onFiltersChange when hide injured toggled', () => {
    const onFiltersChange = vi.fn();
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={onFiltersChange} />);

    fireEvent.click(screen.getByRole('switch'));
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      hideInjured: true,
    });
  });

  it('shows clear filters button when filters active', () => {
    const filters = { ...defaultFilters, positions: ['PG' as const] };
    render(<PlayerSearchFilters filters={filters} onFiltersChange={vi.fn()} />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('clears all filters when clear button clicked', () => {
    const onFiltersChange = vi.fn();
    const filters = { ...defaultFilters, positions: ['PG' as const], hideInjured: true };
    render(<PlayerSearchFilters filters={filters} onFiltersChange={onFiltersChange} />);

    fireEvent.click(screen.getByText('Clear Filters'));
    expect(onFiltersChange).toHaveBeenCalledWith(defaultFilters);
  });

  it('renders projected value inputs', () => {
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={vi.fn()} />);

    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument();
  });

  it('updates local min value immediately on input', () => {
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={vi.fn()} />);

    const minInput = screen.getByPlaceholderText('Min') as HTMLInputElement;
    fireEvent.change(minInput, { target: { value: '25' } });
    expect(minInput.value).toBe('25');
  });

  it('updates local max value immediately on input', () => {
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={vi.fn()} />);

    const maxInput = screen.getByPlaceholderText('Max') as HTMLInputElement;
    fireEvent.change(maxInput, { target: { value: '50' } });
    expect(maxInput.value).toBe('50');
  });

  it('disables inputs when loading', () => {
    render(<PlayerSearchFilters filters={defaultFilters} onFiltersChange={vi.fn()} isLoading={true} />);

    expect(screen.getByPlaceholderText('Search players...')).toBeDisabled();
  });
});
