import { render, screen, fireEvent } from '@testing-library/react';
import { LotteryOddsDisplay } from './LotteryOddsDisplay';
import { LotteryOdds } from '@/api/league';

const mockOdds: LotteryOdds[] = [
  {
    team_id: 'team-1',
    team_name: 'Worst Team',
    position: 1,
    odds: 0.25,
    wins: 10,
    losses: 52,
  },
  {
    team_id: 'team-2',
    team_name: 'Second Worst',
    position: 2,
    odds: 0.20,
    wins: 15,
    losses: 47,
  },
  {
    team_id: 'team-3',
    team_name: 'Third Worst',
    position: 3,
    odds: 0.15,
    wins: 20,
    losses: 42,
  },
];

describe('LotteryOddsDisplay', () => {
  it('renders team names and positions', () => {
    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('Worst Team')).toBeInTheDocument();
    expect(screen.getByText('Second Worst')).toBeInTheDocument();
    expect(screen.getByText('Third Worst')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('renders team records', () => {
    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('10-52')).toBeInTheDocument();
    expect(screen.getByText('15-47')).toBeInTheDocument();
    expect(screen.getByText('20-42')).toBeInTheDocument();
  });

  it('renders odds as percentages', () => {
    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={false}
      />
    );

    expect(screen.getByText('25.0%')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
    expect(screen.getByText('15.0%')).toBeInTheDocument();
  });

  it('shows Run Lottery button for commissioner', () => {
    const onRunLottery = vi.fn();

    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={true}
        onRunLottery={onRunLottery}
      />
    );

    expect(screen.getByRole('button', { name: 'Run Lottery' })).toBeInTheDocument();
  });

  it('hides Run Lottery button for non-commissioner', () => {
    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={false}
      />
    );

    expect(screen.queryByRole('button', { name: 'Run Lottery' })).not.toBeInTheDocument();
  });

  it('calls onRunLottery when button clicked', () => {
    const onRunLottery = vi.fn();

    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={true}
        onRunLottery={onRunLottery}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Run Lottery' }));

    expect(onRunLottery).toHaveBeenCalled();
  });

  it('disables button when loading', () => {
    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={true}
        isLoading={true}
        onRunLottery={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'Running...' })).toBeDisabled();
  });

  it('shows empty state when no odds', () => {
    render(
      <LotteryOddsDisplay
        odds={[]}
        isCommissioner={false}
      />
    );

    expect(screen.getByText(/No lottery teams available/)).toBeInTheDocument();
  });

  it('shows explanatory text about lottery', () => {
    render(
      <LotteryOddsDisplay
        odds={mockOdds}
        isCommissioner={false}
      />
    );

    expect(screen.getByText(/The lottery determines picks 1 and 2/)).toBeInTheDocument();
  });
});
