import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StandingsTable } from './StandingsTable';
import { Team } from '@/api/league';

const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: "Joe's Ballers",
    owner_name: 'Joe',
    wins: 12,
    losses: 5,
    standing: 1,
    cap_space: 50,
    abbreviation: 'JOE',
    logo_url: null,
    espn_team_id: 1,
    current_salary: 250,
    league_name: 'Dynasty Ballers',
  },
  {
    id: 'team-2',
    name: 'Court Kings',
    owner_name: 'Admin',
    wins: 10,
    losses: 7,
    standing: 2,
    cap_space: -10,
    abbreviation: 'CK',
    logo_url: null,
    espn_team_id: 2,
    current_salary: 310,
    league_name: 'Dynasty Ballers',
  },
];

describe('StandingsTable', () => {
  it('renders all teams', () => {
    render(<StandingsTable teams={mockTeams} currentTeamId="team-1" />);

    expect(screen.getAllByText("Joe's Ballers").length).toBeGreaterThan(0);
    expect(screen.getAllByText('Court Kings').length).toBeGreaterThan(0);
  });

  it('displays win-loss records', () => {
    render(<StandingsTable teams={mockTeams} currentTeamId="team-1" />);

    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('highlights current team with "You" badge', () => {
    render(<StandingsTable teams={mockTeams} currentTeamId="team-1" />);

    const badges = screen.getAllByText('You');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows positive cap space in success color', () => {
    render(<StandingsTable teams={mockTeams} currentTeamId="team-1" />);

    const positiveCapSpaces = screen.getAllByText('$50');
    expect(positiveCapSpaces[0]).toHaveClass('text-success-600');
  });

  it('shows negative cap space in danger color', () => {
    render(<StandingsTable teams={mockTeams} currentTeamId="team-1" />);

    const negativeCapSpaces = screen.getAllByText('-$10');
    expect(negativeCapSpaces[0]).toHaveClass('text-danger-600');
  });

  it('renders team links with correct href', () => {
    render(<StandingsTable teams={mockTeams} currentTeamId="team-1" />);

    const links = screen.getAllByRole('link');
    expect(links.some(link => link.getAttribute('href')?.includes('team-1'))).toBe(true);
  });
});
