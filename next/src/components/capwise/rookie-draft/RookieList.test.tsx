import { render, screen, fireEvent } from '@testing-library/react';
import { RookieList } from './RookieList';
import { RookieListItem } from '@/api/league';

const mockRookies: RookieListItem[] = [
  {
    id: 'rookie-1',
    name: 'Cooper Flagg',
    nba_team: 'BOS',
    rookie_rank: 1,
    rookie_year: 2025,
    positions: ['SF', 'PF'],
    player_id: null,
  },
  {
    id: 'rookie-2',
    name: 'Dylan Harper',
    nba_team: 'NYK',
    rookie_rank: 2,
    rookie_year: 2025,
    positions: ['PG', 'SG'],
    player_id: null,
  },
  {
    id: 'rookie-3',
    name: 'Ace Bailey',
    nba_team: 'LAL',
    rookie_rank: 3,
    rookie_year: 2025,
    positions: ['SF'],
    player_id: null,
  },
  {
    id: 'rookie-drafted',
    name: 'Drafted Player',
    nba_team: 'MIA',
    rookie_rank: 10,
    rookie_year: 2025,
    positions: ['C'],
    player_id: 'player-123',
  },
];

describe('RookieList', () => {
  it('renders available rookies', () => {
    render(<RookieList rookies={mockRookies} />);

    expect(screen.getByText('Cooper Flagg')).toBeInTheDocument();
    expect(screen.getByText('Dylan Harper')).toBeInTheDocument();
    expect(screen.getByText('Ace Bailey')).toBeInTheDocument();
  });

  it('filters out already drafted rookies', () => {
    render(<RookieList rookies={mockRookies} />);

    expect(screen.queryByText('Drafted Player')).not.toBeInTheDocument();
  });

  it('shows rookie count', () => {
    render(<RookieList rookies={mockRookies} />);

    expect(screen.getByText(/Showing 3 of 3 available rookies/)).toBeInTheDocument();
  });

  it('filters by search term', () => {
    render(<RookieList rookies={mockRookies} />);

    const searchInput = screen.getByPlaceholderText('Search by name or NBA team...');
    fireEvent.change(searchInput, { target: { value: 'Cooper' } });

    expect(screen.getByText('Cooper Flagg')).toBeInTheDocument();
    expect(screen.queryByText('Dylan Harper')).not.toBeInTheDocument();
    expect(screen.queryByText('Ace Bailey')).not.toBeInTheDocument();
  });

  it('filters by NBA team in search', () => {
    render(<RookieList rookies={mockRookies} />);

    const searchInput = screen.getByPlaceholderText('Search by name or NBA team...');
    fireEvent.change(searchInput, { target: { value: 'NYK' } });

    expect(screen.getByText('Dylan Harper')).toBeInTheDocument();
    expect(screen.queryByText('Cooper Flagg')).not.toBeInTheDocument();
  });

  it('filters by position', () => {
    render(<RookieList rookies={mockRookies} />);

    const positionSelect = screen.getByRole('combobox');
    fireEvent.click(positionSelect);

    const pgOption = screen.getByTestId('position-filter-option-PG');
    fireEvent.click(pgOption);

    expect(screen.getByText('Dylan Harper')).toBeInTheDocument();
    expect(screen.queryByText('Cooper Flagg')).not.toBeInTheDocument();
    expect(screen.queryByText('Ace Bailey')).not.toBeInTheDocument();
  });

  it('shows empty state when no matches', () => {
    render(<RookieList rookies={mockRookies} />);

    const searchInput = screen.getByPlaceholderText('Search by name or NBA team...');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    expect(screen.getByText('No available rookies found.')).toBeInTheDocument();
  });

  it('calls onSelectRookie when row is clicked', () => {
    const onSelectRookie = vi.fn();

    render(<RookieList rookies={mockRookies} onSelectRookie={onSelectRookie} />);

    fireEvent.click(screen.getByText('Cooper Flagg'));

    expect(onSelectRookie).toHaveBeenCalledWith(mockRookies[0]);
  });

  it('highlights selected rookie', () => {
    render(
      <RookieList
        rookies={mockRookies}
        onSelectRookie={() => {}}
        selectedRookieId="rookie-1"
      />
    );

    const row = screen.getByText('Cooper Flagg').closest('tr');
    expect(row).toHaveClass('bg-primary/10');
  });

  it('sorts rookies by rank', () => {
    const unsortedRookies: RookieListItem[] = [
      { ...mockRookies[2], rookie_rank: 3 },
      { ...mockRookies[0], rookie_rank: 1 },
      { ...mockRookies[1], rookie_rank: 2 },
    ];

    render(<RookieList rookies={unsortedRookies} />);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Cooper Flagg');
    expect(rows[1]).toHaveTextContent('Dylan Harper');
    expect(rows[2]).toHaveTextContent('Ace Bailey');
  });

  it('displays position badges', () => {
    render(<RookieList rookies={mockRookies} />);

    expect(screen.getAllByText('SF').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PF').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PG').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SG').length).toBeGreaterThanOrEqual(1);
  });
});
