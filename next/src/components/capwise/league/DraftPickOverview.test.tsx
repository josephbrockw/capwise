import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DraftPickOverview } from './DraftPickOverview';
import { DraftPick } from '@/api/league';

const mockPicks: DraftPick[] = [
  {
    id: 'pick-1',
    league_id: 'league-1',
    original_team_id: 'team-1',
    original_team_name: "Joe's Ballers",
    current_team_id: 'team-1',
    current_team_name: "Joe's Ballers",
    year: 2026,
    round: 1,
    pick_number: null,
    is_owned: true,
  },
  {
    id: 'pick-2',
    league_id: 'league-1',
    original_team_id: 'team-2',
    original_team_name: 'Court Kings',
    current_team_id: 'team-1',
    current_team_name: "Joe's Ballers",
    year: 2026,
    round: 1,
    pick_number: null,
    is_owned: true,
  },
];

describe('DraftPickOverview', () => {
  const defaultProps = {
    draftPicks: mockPicks,
    years: [2026, 2027],
    selectedYear: 2026,
    onYearChange: vi.fn(),
    currentTeamId: 'team-1',
  };

  it('renders draft picks', () => {
    render(<DraftPickOverview {...defaultProps} />);

    expect(screen.getAllByText("Joe's Ballers").length).toBeGreaterThan(0);
    expect(screen.getByText('Court Kings')).toBeInTheDocument();
  });

  it('displays round information', () => {
    render(<DraftPickOverview {...defaultProps} />);

    const roundCells = screen.getAllByText('R1');
    expect(roundCells.length).toBe(2);
  });

  it('shows "You" badge for owned picks', () => {
    render(<DraftPickOverview {...defaultProps} />);

    const badges = screen.getAllByText('You');
    expect(badges.length).toBe(2);
  });

  it('shows "Traded" badge for traded picks', () => {
    render(<DraftPickOverview {...defaultProps} />);

    const tradedBadges = screen.getAllByText('Traded');
    expect(tradedBadges.length).toBeGreaterThan(0);
  });

  it('renders year selector buttons', () => {
    render(<DraftPickOverview {...defaultProps} />);

    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2027')).toBeInTheDocument();
  });

  it('highlights selected year', () => {
    render(<DraftPickOverview {...defaultProps} selectedYear={2026} />);

    const yearButton = screen.getByText('2026');
    expect(yearButton).toHaveClass('bg-primary-500');
  });

  it('calls onYearChange when year clicked', () => {
    const onYearChange = vi.fn();
    render(<DraftPickOverview {...defaultProps} onYearChange={onYearChange} />);

    fireEvent.click(screen.getByText('2027'));
    expect(onYearChange).toHaveBeenCalledWith(2027);
  });

  it('shows empty state when no picks', () => {
    render(<DraftPickOverview {...defaultProps} draftPicks={[]} />);

    expect(screen.getByText('No draft picks for 2026')).toBeInTheDocument();
  });

  it('renders links to team pages', () => {
    render(<DraftPickOverview {...defaultProps} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
