import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DraftPickList, DraftPickData } from './DraftPickList';

const currentYear = new Date().getFullYear();

const mockPicks: DraftPickData[] = [
  {
    id: '1',
    year: currentYear,
    round: 1,
    pickNumber: 5,
    originalTeamId: 'team-1',
    originalTeamName: 'Bulls',
    currentTeamId: 'team-1',
    isOwned: true,
  },
  {
    id: '2',
    year: currentYear,
    round: 2,
    pickNumber: null,
    originalTeamId: 'team-2',
    originalTeamName: 'Lakers',
    currentTeamId: 'team-1',
    isOwned: true,
    isFromTrade: true,
  },
  {
    id: '3',
    year: currentYear + 1,
    round: 1,
    pickNumber: null,
    originalTeamId: 'team-1',
    originalTeamName: 'Bulls',
    currentTeamId: 'team-1',
    isOwned: true,
  },
  {
    id: '4',
    year: currentYear + 2,
    round: 1,
    pickNumber: null,
    originalTeamId: 'team-1',
    originalTeamName: 'Bulls',
    currentTeamId: 'team-1',
    isOwned: true,
  },
  {
    id: '5',
    year: currentYear + 3,
    round: 1,
    pickNumber: null,
    originalTeamId: 'team-1',
    originalTeamName: 'Bulls',
    currentTeamId: 'team-1',
    isOwned: true,
  },
];

describe('DraftPickList', () => {
  describe('Rendering', () => {
    it('renders the draft pick list', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" />);
      expect(screen.getByTestId('draft-pick-list')).toBeInTheDocument();
    });

    it('renders empty state when no picks', () => {
      render(<DraftPickList picks={[]} teamId="team-1" />);
      expect(screen.getByTestId('draft-pick-list-empty')).toHaveTextContent('No draft picks');
    });

    it('groups picks by year', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" />);
      expect(screen.getByTestId(`draft-year-${currentYear}`)).toBeInTheDocument();
      expect(screen.getByTestId(`draft-year-${currentYear + 1}`)).toBeInTheDocument();
    });

    it('displays round labels correctly', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" />);
      expect(screen.getAllByText('1st Round').length).toBeGreaterThan(0);
      expect(screen.getByText('2nd Round')).toBeInTheDocument();
    });

    it('displays pick number when available', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" />);
      expect(screen.getByText('(Pick #5)')).toBeInTheDocument();
    });
  });

  describe('Trade indicators', () => {
    it('shows trade icon for picks acquired via trade', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" />);
      const tradeIcon = screen.getByTestId('trade-icon-2');
      expect(tradeIcon).toBeInTheDocument();
      expect(tradeIcon).toHaveTextContent('Acquired via trade from Lakers');
    });

    it('does not show trade badge for own picks', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" />);
      expect(screen.queryByTestId('trade-icon-1')).not.toBeInTheDocument();
    });
  });

  describe('Year expansion', () => {
    it('shows only default years initially', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" defaultYearsToShow={2} />);
      expect(screen.getByTestId(`draft-year-${currentYear}`)).toBeInTheDocument();
      expect(screen.getByTestId(`draft-year-${currentYear + 1}`)).toBeInTheDocument();
      expect(screen.queryByTestId(`draft-year-${currentYear + 2}`)).not.toBeInTheDocument();
    });

    it('shows toggle button when more years available', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" defaultYearsToShow={2} />);
      expect(screen.getByTestId('toggle-years-button')).toBeInTheDocument();
    });

    it('expands to show all years when toggle clicked', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" defaultYearsToShow={2} />);

      fireEvent.click(screen.getByTestId('toggle-years-button'));

      expect(screen.getByTestId(`draft-year-${currentYear + 2}`)).toBeInTheDocument();
      expect(screen.getByTestId(`draft-year-${currentYear + 3}`)).toBeInTheDocument();
    });

    it('collapses when toggle clicked again', () => {
      render(<DraftPickList picks={mockPicks} teamId="team-1" defaultYearsToShow={2} />);

      fireEvent.click(screen.getByTestId('toggle-years-button'));
      fireEvent.click(screen.getByTestId('toggle-years-button'));

      expect(screen.queryByTestId(`draft-year-${currentYear + 2}`)).not.toBeInTheDocument();
    });

    it('does not show toggle when all years fit in default', () => {
      const fewPicks = mockPicks.slice(0, 2);
      render(<DraftPickList picks={fewPicks} teamId="team-1" defaultYearsToShow={3} />);
      expect(screen.queryByTestId('toggle-years-button')).not.toBeInTheDocument();
    });
  });
});
