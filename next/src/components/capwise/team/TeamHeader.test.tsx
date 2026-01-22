import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeamHeader } from './TeamHeader';

const defaultProps = {
  name: 'Chicago Bulls Dynasty',
  ownerName: 'Michael Jordan',
  logoUrl: null,
  wins: 72,
  losses: 10,
  standing: 1,
};

describe('TeamHeader', () => {
  describe('Rendering', () => {
    it('renders the team header', () => {
      render(<TeamHeader {...defaultProps} />);
      expect(screen.getByTestId('team-header')).toBeInTheDocument();
    });

    it('displays team name', () => {
      render(<TeamHeader {...defaultProps} />);
      expect(screen.getByTestId('team-name')).toHaveTextContent('Chicago Bulls Dynasty');
    });

    it('displays owner name', () => {
      render(<TeamHeader {...defaultProps} />);
      expect(screen.getByTestId('owner-name')).toHaveTextContent('Owned by Michael Jordan');
    });

    it('displays record', () => {
      render(<TeamHeader {...defaultProps} />);
      expect(screen.getByTestId('record')).toHaveTextContent('72-10');
    });

    it('displays standing with ordinal suffix', () => {
      render(<TeamHeader {...defaultProps} />);
      expect(screen.getByTestId('standing')).toHaveTextContent('1');
      expect(screen.getByTestId('standing')).toHaveTextContent('Place');
    });
  });

  describe('Logo', () => {
    it('renders placeholder when no logo URL', () => {
      render(<TeamHeader {...defaultProps} logoUrl={null} />);
      const logo = screen.getByTestId('team-logo');
      expect(logo.querySelector('svg')).toBeInTheDocument();
    });

    it('renders image when logo URL provided', () => {
      render(<TeamHeader {...defaultProps} logoUrl="https://example.com/logo.png" />);
      const logo = screen.getByTestId('team-logo');
      const img = logo.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
    });
  });

  describe('Badges', () => {
    it('does not show badges by default', () => {
      render(<TeamHeader {...defaultProps} />);
      expect(screen.queryByTestId('own-team-badge')).not.toBeInTheDocument();
      expect(screen.queryByTestId('commissioner-badge')).not.toBeInTheDocument();
    });

    it('shows own team badge when isOwnTeam is true', () => {
      render(<TeamHeader {...defaultProps} isOwnTeam />);
      expect(screen.getByTestId('own-team-badge')).toHaveTextContent('Your Team');
    });

    it('shows commissioner badge when isCommissioner is true', () => {
      render(<TeamHeader {...defaultProps} isCommissioner />);
      expect(screen.getByTestId('commissioner-badge')).toHaveTextContent('Commissioner');
    });

    it('shows both badges when applicable', () => {
      render(<TeamHeader {...defaultProps} isOwnTeam isCommissioner />);
      expect(screen.getByTestId('own-team-badge')).toBeInTheDocument();
      expect(screen.getByTestId('commissioner-badge')).toBeInTheDocument();
    });
  });

  describe('Standing ordinal suffixes', () => {
    it('displays 1st correctly', () => {
      render(<TeamHeader {...defaultProps} standing={1} />);
      expect(screen.getByTestId('standing')).toHaveTextContent('1');
    });

    it('displays 2nd correctly', () => {
      render(<TeamHeader {...defaultProps} standing={2} />);
      expect(screen.getByTestId('standing')).toHaveTextContent('2');
    });

    it('displays 3rd correctly', () => {
      render(<TeamHeader {...defaultProps} standing={3} />);
      expect(screen.getByTestId('standing')).toHaveTextContent('3');
    });

    it('displays 4th correctly', () => {
      render(<TeamHeader {...defaultProps} standing={4} />);
      expect(screen.getByTestId('standing')).toHaveTextContent('4');
    });
  });
});
