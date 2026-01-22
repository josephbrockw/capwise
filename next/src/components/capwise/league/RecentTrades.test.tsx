import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecentTrades } from './RecentTrades';
import { Trade } from '@/api/league';

const mockTrades: Trade[] = [
  {
    id: 'trade-1',
    league_id: 'league-1',
    status: 'accepted',
    proposed_at: '2025-01-10T14:30:00.000Z',
    resolved_at: '2025-01-11T10:00:00.000Z',
    proposed_by_team_id: 'team-1',
    notes: 'Star player swap',
    teams: [
      {
        team_id: 'team-1',
        team_name: "Joe's Ballers",
        assets_sent: [
          {
            id: 'asset-1',
            type: 'player',
            player: { id: 'player-1', name: 'Darius Garland' },
            from_team_id: 'team-1',
            from_team_name: "Joe's Ballers",
            to_team_id: 'team-2',
            to_team_name: 'Court Kings',
          },
        ],
        assets_received: [],
      },
      {
        team_id: 'team-2',
        team_name: 'Court Kings',
        assets_sent: [
          {
            id: 'asset-2',
            type: 'draft_pick',
            draft_pick: { id: 'pick-1', year: 2026, round: 1 },
            from_team_id: 'team-2',
            from_team_name: 'Court Kings',
            to_team_id: 'team-1',
            to_team_name: "Joe's Ballers",
          },
        ],
        assets_received: [],
      },
    ],
  },
];

describe('RecentTrades', () => {
  it('renders trade with team names', () => {
    render(<RecentTrades trades={mockTrades} />);

    expect(screen.getByText("Joe's Ballers ↔ Court Kings")).toBeInTheDocument();
  });

  it('displays player names in trade assets', () => {
    render(<RecentTrades trades={mockTrades} />);

    expect(screen.getByText(/Darius Garland/)).toBeInTheDocument();
  });

  it('displays draft picks in trade assets', () => {
    render(<RecentTrades trades={mockTrades} />);

    expect(screen.getByText(/2026 R1/)).toBeInTheDocument();
  });

  it('shows trade status badge', () => {
    render(<RecentTrades trades={mockTrades} />);

    expect(screen.getByText('accepted')).toBeInTheDocument();
  });

  it('shows empty state when no trades', () => {
    render(<RecentTrades trades={[]} />);

    expect(screen.getByText('No recent trades')).toBeInTheDocument();
  });

  it('renders multiple trades', () => {
    const multipleTrades: Trade[] = [
      ...mockTrades,
      {
        ...mockTrades[0],
        id: 'trade-2',
        teams: [
          { ...mockTrades[0].teams[0], team_name: 'Slam Dunkers' },
          { ...mockTrades[0].teams[1], team_name: "Granny's Hoopers" },
        ],
      },
    ];

    render(<RecentTrades trades={multipleTrades} />);

    expect(screen.getByText("Joe's Ballers ↔ Court Kings")).toBeInTheDocument();
    expect(screen.getByText("Slam Dunkers ↔ Granny's Hoopers")).toBeInTheDocument();
  });
});
