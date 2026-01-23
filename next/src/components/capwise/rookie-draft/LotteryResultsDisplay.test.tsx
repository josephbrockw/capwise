import { render, screen } from '@testing-library/react';
import { LotteryResultsDisplay } from './LotteryResultsDisplay';
import { LotteryResult } from '@/api/league';

const mockResult: LotteryResult = {
  id: 'lottery-1',
  year: 2025,
  executed_at: '2025-05-15T14:00:00.000Z',
  executed_by: 'commissioner-1',
  first_pick_team_id: 'team-3',
  first_pick_team_name: 'Lucky Team',
  second_pick_team_id: 'team-1',
  second_pick_team_name: 'Worst Team',
  results: {
    lottery_teams: [
      { team_id: 'team-1', team_name: 'Worst Team', original_position: 1, original_odds: 0.25 },
      { team_id: 'team-2', team_name: 'Second Worst', original_position: 2, original_odds: 0.20 },
      { team_id: 'team-3', team_name: 'Lucky Team', original_position: 3, original_odds: 0.15 },
    ],
    final_order: [
      { pick_number: 1, team_id: 'team-3', team_name: 'Lucky Team', moved: true },
      { pick_number: 2, team_id: 'team-1', team_name: 'Worst Team', moved: true },
      { pick_number: 3, team_id: 'team-2', team_name: 'Second Worst', moved: true },
    ],
  },
};

describe('LotteryResultsDisplay', () => {
  it('renders lottery result header', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    expect(screen.getByText('Lottery Results')).toBeInTheDocument();
  });

  it('displays execution date', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    expect(screen.getByText(/Executed on/)).toBeInTheDocument();
  });

  it('displays first pick winner', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    expect(screen.getByText('1st Pick Winner')).toBeInTheDocument();
    expect(screen.getAllByText('Lucky Team').length).toBeGreaterThanOrEqual(1);
  });

  it('displays second pick winner', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    expect(screen.getByText('2nd Pick Winner')).toBeInTheDocument();
    expect(screen.getAllByText('Worst Team').length).toBeGreaterThanOrEqual(1);
  });

  it('displays final draft order', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    expect(screen.getByText('Final Draft Order')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('shows positive movement for teams that moved up', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows negative movement for teams that moved down', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    expect(screen.getAllByText('-1').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all teams in final order', () => {
    render(<LotteryResultsDisplay result={mockResult} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    expect(screen.getAllByText('Lucky Team').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Worst Team').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Second Worst').length).toBeGreaterThanOrEqual(1);
  });
});
